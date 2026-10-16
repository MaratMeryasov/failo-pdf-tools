import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { access, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import multer from "multer";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { diffLines } from "diff";
import ExcelJS from "exceljs";
import pptxgen from "pptxgenjs";
import sharp from "sharp";
import JSZip from "jszip";

const execFile = promisify(execFileCallback);
const root = fileURLToPath(new URL(".", import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4173);
const localOnly = process.env.HOST || "127.0.0.1";
const maxUpload = 50 * 1024 * 1024;
const installedTools = [
  "ocrmypdf", "tesseract", "pdftotext", "pdftoppm", "qpdf", "gs", "soffice",
];

function safeBaseName(filename) {
  return basename(filename, extname(filename))
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}._-]+/gu, "_")
    .replace(/^[_\.]+|[_\.]+$/g, "")
    .slice(0, 80) || "document";
}

function requireFiles(files, minimum = 1, maximum = 1) {
  if (files.length < minimum || files.length > maximum) {
    throw new Error(`Для этой операции требуется от ${minimum} до ${maximum} файлов.`);
  }
  return files;
}

async function run(command, args, options = {}) {
  try {
    return await execFile(command, args, {
      timeout: 120_000,
      maxBuffer: 8 * 1024 * 1024,
      ...options,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Не найдена программа ${command}. Установите её по инструкции в README.md.`);
    }
    const detail = error.stderr?.toString().trim();
    throw new Error(detail || `${command} завершилась с ошибкой.`);
  }
}

async function readPdfText(path) {
  const bytes = new Uint8Array(await readFile(path));
  const loadingTask = getDocument({
    data: bytes,
    useSystemFonts: true,
    standardFontDataUrl: `http://127.0.0.1:${port}/node_modules/pdfjs-dist/standard_fonts/`,
  });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const lines = [];
    let currentY = null;
    let line = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = Math.round(item.transform[5]);
      if (currentY !== null && Math.abs(y - currentY) > 3 && line) {
        lines.push(line.trim());
        line = "";
      }
      line += `${item.str}${item.hasEOL ? "\n" : " "}`;
      currentY = y;
      if (item.hasEOL && line.trim()) {
        lines.push(line.trim());
        line = "";
        currentY = null;
      }
    }
    if (line.trim()) lines.push(line.trim());
    pages.push(lines.join("\n"));
    page.cleanup();
  }
  await loadingTask.destroy();
  return pages;
}

function textResult(text, filename, type = "text/plain; charset=utf-8") {
  return { buffer: Buffer.from(text, "utf8"), filename, type };
}

function pdfResult(bytes, filename) {
  return { buffer: Buffer.from(bytes), filename, type: "application/pdf" };
}

async function convertWithLibreOffice(input, directory, outputExtension = "pdf") {
  const profile = join(directory, "libreoffice-profile");
  const args = [
    `-env:UserInstallation=file://${profile}`,
    "--headless", "--nologo", "--nodefault", "--nolockcheck",
    "--convert-to", outputExtension, "--outdir", directory, input,
  ];
  await run("soffice", args);
  const output = join(directory, `${safeBaseName(input)}.${outputExtension}`);
  return readFile(output);
}

async function runOllama(prompt) {
  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "qwen2.5:7b",
      prompt,
      stream: false,
      options: { temperature: 0.1, top_p: 0.8 },
    }),
    signal: AbortSignal.timeout(180_000),
  }).catch((error) => {
    if (error.name === "TimeoutError") throw new Error("Локальная AI-модель не ответила за 3 минуты.");
    throw new Error("Ollama не запущена. Запустите локальный сервер Ollama и модель из README.md.");
  });
  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 404) {
      throw new Error(`Модель ${process.env.OLLAMA_MODEL || "qwen2.5:7b"} не загружена. Сначала выполните команду из README.md.`);
    }
    throw new Error(`Локальная модель ответила с ошибкой: ${detail.slice(0, 300)}`);
  }
  const data = await response.json();
  if (!data.response?.trim()) throw new Error("Локальная модель вернула пустой ответ.");
  return data.response.trim();
}

function parsePageOrder(value, count) {
  const pages = String(value || "").split(",").map((item) => Number(item.trim()));
  if (!pages.length || pages.some((page) => !Number.isInteger(page) || page < 1 || page > count)) {
    throw new Error(`Укажите номера страниц от 1 до ${count}.`);
  }
  if (new Set(pages).size !== pages.length) throw new Error("Номер страницы не может повторяться.");
  return pages.map((page) => page - 1);
}

function parsePageRanges(value, count) {
  const indices = [];
  for (const part of String(value || "").split(",").map((item) => item.trim())) {
    const range = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!range) throw new Error("Укажите страницы и диапазоны, например: 1-3, 5.");
    const start = Number(range[1]);
    const end = Number(range[2] || range[1]);
    if (start < 1 || end < start || end > count) {
      throw new Error(`Номера страниц должны быть в диапазоне от 1 до ${count}.`);
    }
    for (let page = start; page <= end; page += 1) indices.push(page - 1);
  }
  if (!indices.length) throw new Error("Укажите хотя бы одну страницу.");
  if (new Set(indices).size !== indices.length) throw new Error("Страница указана больше одного раза.");
  return indices;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  })[character]);
}

function protectWeekdayRanges(text, language) {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const target = String(language || "").toLowerCase();
  const translations = target.startsWith("рус")
    ? ["понедельника", "вторника", "среды", "четверга", "пятницы", "субботы", "воскресенья"]
    : target.startsWith("es")
      ? ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
      : target.startsWith("fr")
        ? ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
        : target.startsWith("de")
          ? ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
          : target.includes("中文") || target.includes("chinese")
            ? ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
            : weekdays;
  const russianEndDays = ["понедельник", "вторник", "среду", "четверг", "пятницу", "субботу", "воскресенье"];
  const dayPattern = weekdays.join("|");
  const pattern = new RegExp(
    `\\b(?:from\\s+)?(${dayPattern})\\s*(?:to|through|until|[-–—])\\s*(${dayPattern})\\b`,
    "gi",
  );
  const ranges = [];
  const protectedText = text.replace(pattern, (_range, start, end) => {
    const startIndex = weekdays.findIndex((day) => day.toLowerCase() === start.toLowerCase());
    const endIndex = weekdays.findIndex((day) => day.toLowerCase() === end.toLowerCase());
    const token = `DAYRANGE${String(ranges.length).padStart(3, "0")}END`;
    let replacement;
    if (target.startsWith("рус")) replacement = `${startIndex === 1 ? "со" : "с"} ${translations[startIndex]} по ${russianEndDays[endIndex]}`;
    else if (target.startsWith("es")) replacement = `de ${translations[startIndex]} a ${translations[endIndex]}`;
    else if (target.startsWith("fr")) replacement = `du ${translations[startIndex]} au ${translations[endIndex]}`;
    else if (target.startsWith("de")) replacement = `von ${translations[startIndex]} bis ${translations[endIndex]}`;
    else if (target.includes("中文") || target.includes("chinese")) replacement = `从${translations[startIndex]}到${translations[endIndex]}`;
    else replacement = `from ${translations[startIndex]} to ${translations[endIndex]}`;
    ranges.push({ token, replacement });
    return token;
  });
  return {
    text: protectedText,
    restore(result) {
      return ranges.reduce((output, range) => output.replaceAll(range.token, range.replacement), result);
    },
  };
}

async function processTool(tool, files, fields, directory) {
  const file = files[0];
  const input = file?.path;

  if (tool === "merge") {
    requireFiles(files, 2, 10);
    const output = await PDFDocument.create();
    for (const item of files) {
      const source = await PDFDocument.load(await readFile(item.path));
      const pages = await output.copyPages(source, source.getPageIndices());
      pages.forEach((page) => output.addPage(page));
    }
    return pdfResult(await output.save(), "merged-document.pdf");
  }

  if (tool === "split" || tool === "organize") {
    requireFiles(files);
    const source = await PDFDocument.load(await readFile(input));
    const indices = tool === "split"
      ? parsePageRanges(fields.range, source.getPageCount())
      : parsePageOrder(fields.order, source.getPageCount());
    const output = await PDFDocument.create();
    const pages = await output.copyPages(source, indices);
    pages.forEach((page) => output.addPage(page));
    const suffix = tool === "split" ? "pages" : "ordered";
    return pdfResult(await output.save(), `${safeBaseName(file.originalname)}-${suffix}.pdf`);
  }

  if (tool === "rotate") {
    requireFiles(files);
    const angle = Number(fields.angle);
    if (![90, 180, 270].includes(angle)) throw new Error("Выберите поворот на 90, 180 или 270 градусов.");
    const document = await PDFDocument.load(await readFile(input));
    document.getPages().forEach((page) => {
      page.setRotation(degrees((page.getRotation().angle + angle) % 360));
    });
    return pdfResult(await document.save(), `${safeBaseName(file.originalname)}-rotated.pdf`);
  }

  if (tool === "watermark") {
    requireFiles(files);
    const text = String(fields.text || "").trim().slice(0, 60);
    const opacityPercent = Number(fields.opacity ?? 25);
    if (!text) throw new Error("Введите текст водяного знака.");
    if (!Number.isFinite(opacityPercent) || opacityPercent < 10 || opacityPercent > 70) {
      throw new Error("Прозрачность должна быть от 10 до 70 процентов.");
    }
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="240"><text x="600" y="150" text-anchor="middle" font-family="sans-serif" font-size="120" font-weight="bold" fill="#555" fill-opacity="${opacityPercent / 100}">${escapeXml(text)}</text></svg>`);
    const watermark = await sharp(svg).png().toBuffer();
    const document = await PDFDocument.load(await readFile(input));
    const image = await document.embedPng(watermark);
    for (const page of document.getPages()) {
      const { width, height } = page.getSize();
      const imageWidth = Math.min(width * 0.85, image.width);
      const imageHeight = imageWidth * image.height / image.width;
      page.drawImage(image, {
        x: (width - imageWidth) / 2,
        y: (height - imageHeight) / 2,
        width: imageWidth,
        height: imageHeight,
      });
    }
    return pdfResult(await document.save(), `${safeBaseName(file.originalname)}-watermarked.pdf`);
  }

  if (tool === "page-numbers") {
    requireFiles(files);
    const document = await PDFDocument.load(await readFile(input));
    const pages = document.getPages();
    const font = await document.embedFont(StandardFonts.Helvetica);
    pages.forEach((page, index) => {
      const label = fields.format === "total" ? `${index + 1} / ${pages.length}` : String(index + 1);
      page.drawText(label, {
        x: page.getWidth() - label.length * 6.1 - 28,
        y: 18,
        size: 11,
        font,
        color: rgb(0.3, 0.3, 0.35),
      });
    });
    return pdfResult(await document.save(), `${safeBaseName(file.originalname)}-numbered.pdf`);
  }

  if (tool === "sign") {
    requireFiles(files);
    const signature = String(fields.signature || "");
    const match = signature.match(/^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) throw new Error("Нарисуйте подпись в поле выше.");
    const document = await PDFDocument.load(await readFile(input));
    const image = await document.embedPng(Buffer.from(match[1], "base64"));
    for (const page of document.getPages()) {
      const { width } = page.getSize();
      const signatureWidth = Math.min(width * 0.32, 170);
      const signatureHeight = signatureWidth * image.height / image.width;
      page.drawImage(image, {
        x: width - signatureWidth - 36,
        y: 34,
        width: signatureWidth,
        height: signatureHeight,
      });
    }
    return pdfResult(await document.save(), `${safeBaseName(file.originalname)}-signed.pdf`);
  }

  if (tool === "compress") {
    requireFiles(files);
    const quality = Number(fields.quality ?? 60);
    if (!Number.isFinite(quality) || quality < 25 || quality > 90) {
      throw new Error("Качество должно быть от 25 до 90 процентов.");
    }
    const output = join(directory, `${safeBaseName(file.originalname)}-compressed.pdf`);
    const resolution = Math.round(72 + quality * 1.2);
    await run("gs", [
      "-dBATCH", "-dNOPAUSE", "-dSAFER", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.5",
      "-dDetectDuplicateImages=true", "-dCompressFonts=true", "-dSubsetFonts=true",
      `-dColorImageResolution=${resolution}`, `-dGrayImageResolution=${resolution}`,
      `-dMonoImageResolution=${resolution}`, `-dJPEGQ=${quality}`,
      `-sOutputFile=${output}`, input,
    ]);
    return pdfResult(await readFile(output), basename(output));
  }

  if (tool === "pdf-to-images") {
    requireFiles(files);
    const format = fields.format === "png" ? "png" : "jpg";
    const scale = Number(fields.scale ?? 1);
    if (![1, 1.5, 2].includes(scale)) throw new Error("Выберите доступное качество изображения.");
    const prefix = join(directory, "page");
    await run("pdftoppm", [format === "png" ? "-png" : "-jpeg", "-r", String(Math.round(120 * scale)), input, prefix]);
    const images = (await readdir(directory))
      .filter((name) => new RegExp(`^page-\\d+\\.${format}$`).test(name))
      .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    if (!images.length) throw new Error("Не удалось преобразовать страницы PDF в изображения.");
    if (images.length === 1) {
      return {
        buffer: await readFile(join(directory, images[0])),
        filename: `${safeBaseName(file.originalname)}-001.${format}`,
        type: format === "png" ? "image/png" : "image/jpeg",
      };
    }
    const archive = new JSZip();
    images.forEach((name, index) => {
      archive.file(`${safeBaseName(file.originalname)}-${String(index + 1).padStart(3, "0")}.${format}`, readFile(join(directory, name)));
    });
    return {
      buffer: await archive.generateAsync({ type: "nodebuffer" }),
      filename: `${safeBaseName(file.originalname)}-images.zip`,
      type: "application/zip",
    };
  }

  if (tool === "images-to-pdf") {
    requireFiles(files, 1, 10);
    const document = await PDFDocument.create();
    for (const item of files) {
      const bytes = await readFile(item.path);
      const image = /\.png$/i.test(item.originalname)
        ? await document.embedPng(bytes)
        : await document.embedJpg(bytes);
      const page = document.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    return pdfResult(await document.save(), "images-document.pdf");
  }

  if (tool === "ocr") {
    requireFiles(files);
    const language = fields.language === "eng" ? "eng" : "rus+eng";
    const output = join(directory, `${safeBaseName(file.originalname)}-searchable.pdf`);
    await run("ocrmypdf", ["--skip-text", "--deskew", "--rotate-pages", "--language", language, input, output]);
    return pdfResult(await readFile(output), basename(output));
  }

  if (tool === "office-to-pdf") {
    requireFiles(files);
    if (!/\.(doc|docx|odt|rtf|ppt|pptx|odp|xls|xlsx|ods)$/i.test(file.originalname)) {
      throw new Error("Выберите документ Word, PowerPoint или Excel.");
    }
    const bytes = await convertWithLibreOffice(input, directory);
    return pdfResult(bytes, `${safeBaseName(file.originalname)}.pdf`);
  }

  if (tool === "pdf-to-docx") {
    requireFiles(files);
    const pages = await readPdfText(input);
    const children = pages.flatMap((text) => [
      ...text.split(/\n+/).filter(Boolean).map((line) => new Paragraph({ children: [new TextRun(line)] })),
      new Paragraph(""),
    ]);
    const document = new Document({ sections: [{ children }] });
    return { buffer: await Packer.toBuffer(document), filename: `${safeBaseName(file.originalname)}.docx`, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }

  if (tool === "pdf-to-pptx") {
    requireFiles(files);
    await run("pdftoppm", ["-png", "-r", "100", input, join(directory, "slide")]);
    const images = (await readdir(directory)).filter((name) => /^slide-\d+\.png$/.test(name)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    if (!images.length) throw new Error("Не удалось преобразовать страницы PDF в изображения.");
    const deck = new pptxgen();
    deck.layout = "LAYOUT_WIDE";
    for (const image of images) {
      const slide = deck.addSlide();
      slide.addImage({ path: join(directory, image), x: 0, y: 0, w: 13.333, h: 7.5 });
    }
    return { buffer: await deck.write({ outputType: "nodebuffer" }), filename: `${safeBaseName(file.originalname)}.pptx`, type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
  }

  if (tool === "pdf-to-xlsx") {
    requireFiles(files);
    const pages = await readPdfText(input);
    const rows = pages.flatMap((page, index) => [
      ...(index ? [[""]] : []),
      ...page.split("\n").filter(Boolean).map((line) => [line]),
    ]);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Текст PDF");
    rows.forEach((row) => sheet.addRow(row));
    return { buffer: Buffer.from(await workbook.xlsx.writeBuffer()), filename: `${safeBaseName(file.originalname)}.xlsx`, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
  }

  if (tool === "pdf-to-markdown") {
    requireFiles(files);
    const pages = await readPdfText(input);
    const markdown = pages.map((text, index) => `## Страница ${index + 1}\n\n${text}`).join("\n\n---\n\n");
    return textResult(markdown, `${safeBaseName(file.originalname)}.md`, "text/markdown; charset=utf-8");
  }

  if (tool === "summarize" || tool === "translate") {
    requireFiles(files);
    const pages = await readPdfText(input);
    const language = String(fields.language || "Русский").slice(0, 40);
    const modelLanguage = {
      "Русский": "Russian",
      Español: "Spanish",
      Français: "French",
      Deutsch: "German",
      中文: "Chinese",
    }[language] || language;
    const protectedText = protectWeekdayRanges(pages.join("\n\n").slice(0, 40_000), language);
    const text = protectedText.text;
    if (!text.trim()) throw new Error("В PDF нет текста. Для сканированного документа сначала запустите OCR.");
    const prompt = tool === "summarize"
      ? `Write a short, factual summary in Russian. Use only facts stated in the document. Do not infer, alter dates or numbers, or invent details. Preserve every DAYRANGE token exactly as written. Return only the summary.\n\nDOCUMENT:\n${text}`
      : `Translate every sentence in the document into ${modelLanguage}. This is a faithful full translation, not a summary. Preserve all facts and keep every DAYRANGE token exactly as written. Do not add an introduction or commentary. Return only the translation.\n\nDOCUMENT:\n${text}`;
    const result = protectedText.restore(await runOllama(prompt));
    return textResult(result, `${safeBaseName(file.originalname)}-${tool === "summarize" ? "summary" : "translation"}.txt`);
  }

  if (tool === "compare") {
    requireFiles(files, 2, 2);
    const [left, right] = await Promise.all(files.map((item) => readPdfText(item.path)));
    const leftText = left.join("\n\n");
    const rightText = right.join("\n\n");
    if (!leftText.trim() || !rightText.trim()) {
      throw new Error("В одном из файлов нет текстового слоя. Сначала распознайте скан с помощью OCR.");
    }
    const changes = diffLines(leftText, rightText);
    const report = changes.map((part) => {
      const marker = part.added ? "+ " : part.removed ? "- " : "  ";
      return part.value.split("\n").filter(Boolean).map((line) => `${marker}${line}`).join("\n");
    }).filter(Boolean).join("\n");
    return textResult(report || "Документы не отличаются.", "pdf-comparison.txt");
  }

  if (tool === "repair") {
    requireFiles(files);
    const output = join(directory, `${safeBaseName(file.originalname)}-repaired.pdf`);
    await run("qpdf", ["--warning-exit-0", input, output]);
    return pdfResult(await readFile(output), basename(output));
  }

  if (tool === "protect" || tool === "unlock") {
    requireFiles(files);
    const output = join(directory, `${safeBaseName(file.originalname)}-${tool === "protect" ? "protected" : "unlocked"}.pdf`);
    if (tool === "protect") {
      const password = String(fields.password || "");
      if (password.length < 6) throw new Error("Пароль должен содержать не менее 6 символов.");
      await run("qpdf", ["--encrypt", password, password, "256", "--", input, output]);
    } else {
      const password = String(fields.password || "");
      if (!password) throw new Error("Введите пароль от PDF.");
      await run("qpdf", [`--password=${password}`, "--decrypt", input, output]);
    }
    return pdfResult(await readFile(output), basename(output));
  }

  if (tool === "pdfa") {
    requireFiles(files);
    let icc = process.env.PDFA_ICC_PROFILE;
    let ghostscriptPrefix;
    try {
      ghostscriptPrefix = (await run("brew", ["--prefix", "ghostscript"])).stdout.trim();
    } catch (error) {
      if (!icc) throw new Error("Не найден ICC-профиль для PDF/A. Укажите путь через PDFA_ICC_PROFILE.");
      throw error;
    }
    if (!icc) {
      icc = join(ghostscriptPrefix, "share", "ghostscript", "iccprofiles", "default_rgb.icc");
      try {
        await access(icc);
      } catch {
        throw new Error("Не найден ICC-профиль для PDF/A. Укажите путь через PDFA_ICC_PROFILE.");
      }
    }
    const output = join(directory, `${safeBaseName(file.originalname)}-pdfa.pdf`);
    await run("gs", [
      `--permit-file-read=${input}`, `--permit-file-write=${output}`,
      `--permit-file-read=${icc}`,
      `--permit-file-read=${join(ghostscriptPrefix, "share", "ghostscript", "Resource", "Font", "*")}`,
      "-dPDFA=2", "-dBATCH", "-dNOPAUSE", "-dNOOUTERSAVE", "-sDEVICE=pdfwrite",
      "-dPDFACompatibilityPolicy=1", "-sColorConversionStrategy=RGB", `-sOutputICCProfile=${icc}`,
      `-sOutputFile=${output}`, input,
    ]);
    return pdfResult(await readFile(output), basename(output));
  }

  if (tool === "html-to-pdf") {
    requireFiles(files);
    if (!/\.(html?|xhtml)$/i.test(file.originalname)) throw new Error("Выберите файл HTML.");
    const originalHtml = await readFile(input, "utf8");
    const safeHtml = originalHtml
      .replace(/<\s*(script|iframe|object|embed|form|base|link|style)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, "")
      .replace(/<\s*(script|iframe|object|embed|base|link|style)\b[^>]*\/?\s*>/gi, "")
      .replace(/\s+on[\w:-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\s+(src|href|srcset|poster|background)\s*=\s*("(?!data:|#)[^"]*"|'(?!data:|#)[^']*'|(?!(?:data:|#))[^\s>]+)/gi, "")
      .replace(/\s+style\s*=\s*("[^"]*url\s*\([^"]*"|'[^']*url\s*\([^']*'|[^\s>]*url\s*\([^\s>]*)/gi, "");
    const safeHtmlPath = join(directory, "input.html");
    await writeFile(safeHtmlPath, safeHtml, "utf8");
    const bytes = await convertWithLibreOffice(safeHtmlPath, directory);
    return pdfResult(bytes, `${safeBaseName(file.originalname)}.pdf`);
  }

  if (tool === "redact") {
    requireFiles(files);
    const pageCount = Number(fields.page);
    const x = Number(fields.x);
    const y = Number(fields.y);
    const width = Number(fields.width);
    const height = Number(fields.height);
    if (![pageCount, x, y, width, height].every(Number.isFinite) || pageCount < 1 || x < 0 || y < 0 || width <= 0 || height <= 0) {
      throw new Error("Укажите номер страницы и размеры чёрной области в миллиметрах.");
    }
    const source = await PDFDocument.load(await readFile(input));
    if (pageCount > source.getPageCount()) throw new Error(`В документе ${source.getPageCount()} стр.`);
    const originalPages = source.getPages();
    await run("pdftoppm", ["-png", "-r", "120", input, join(directory, "redact-page")]);
    const images = (await readdir(directory)).filter((name) => /^redact-page-\d+\.png$/.test(name));
    const output = await PDFDocument.create();
    const scale = 120 / 25.4;
    for (let index = 0; index < originalPages.length; index += 1) {
      const imageName = images.find((name) => Number(name.match(/(\d+)\.png$/)[1]) === index + 1);
      if (!imageName) throw new Error(`Не удалось подготовить страницу ${index + 1}.`);
      const imagePath = join(directory, imageName);
      const metadata = await sharp(imagePath).metadata();
      if (index + 1 === pageCount) {
        const left = Math.round(x * scale);
        const top = Math.round(y * scale);
        const rectWidth = Math.round(width * scale);
        const rectHeight = Math.round(height * scale);
        if (left + rectWidth > metadata.width || top + rectHeight > metadata.height) {
          throw new Error("Чёрная область выходит за пределы страницы.");
        }
        const cover = Buffer.from(`<svg width="${rectWidth}" height="${rectHeight}"><rect width="100%" height="100%" fill="#000"/></svg>`);
        await sharp(imagePath).composite([{ input: cover, left, top }]).png().toFile(join(directory, `redacted-${index + 1}.png`));
      } else {
        await sharp(imagePath).png().toFile(join(directory, `redacted-${index + 1}.png`));
      }
      const page = originalPages[index];
      const embedded = await output.embedPng(await readFile(join(directory, `redacted-${index + 1}.png`)));
      const outputPage = output.addPage([metadata.width * 72 / 120, metadata.height * 72 / 120]);
      outputPage.drawImage(embedded, { x: 0, y: 0, width: outputPage.getWidth(), height: outputPage.getHeight() });
    }
    return pdfResult(await output.save(), `${safeBaseName(file.originalname)}-redacted.pdf`);
  }

  if (tool === "crop") {
    requireFiles(files);
    const margins = ["left", "top", "right", "bottom"].map((key) => Number(fields[key] || 0));
    if (margins.some((value) => !Number.isFinite(value) || value < 0 || value > 200)) {
      throw new Error("Поля должны быть числами от 0 до 200 мм.");
    }
    const [left, top, right, bottom] = margins.map((value) => value * 72 / 25.4);
    const document = await PDFDocument.load(await readFile(input));
    for (const page of document.getPages()) {
      const box = page.getCropBox();
      if (left + right >= box.width || top + bottom >= box.height) throw new Error("Поля обрезки слишком велики для страницы.");
      page.setCropBox(box.x + left, box.y + bottom, box.width - left - right, box.height - top - bottom);
    }
    return pdfResult(await document.save(), `${safeBaseName(file.originalname)}-cropped.pdf`);
  }

  throw new Error("Этот инструмент пока не поддерживается сервером.");
}

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.static(root, { index: "index.html", dotfiles: "ignore" }));

app.get("/api/health", async (_request, response) => {
  const tools = {};
  const versions = {};
  for (const tool of installedTools) {
    try {
      const result = await run(tool, ["--version"], { timeout: 5000, maxBuffer: 128 * 1024 });
      tools[tool] = true;
      versions[tool] = (result.stdout || result.stderr).split("\n")[0].slice(0, 100);
    } catch (error) {
      tools[tool] = error.message.includes("Не найдена программа") ? false : true;
    }
  }
  let ollama = false;
  let modelReady = false;
  const model = process.env.OLLAMA_MODEL || "qwen2.5:7b";
  try {
    const result = await fetch("http://127.0.0.1:11434/api/tags", { signal: AbortSignal.timeout(1500) });
    ollama = result.ok;
    if (ollama) {
      const tags = await result.json();
      modelReady = tags.models?.some((item) => item.name === model || item.name.startsWith(`${model}:`)) || false;
    }
  } catch {}
  let russianOcr = false;
  if (tools.tesseract) {
    try {
      const result = await run("tesseract", ["--list-langs"], { timeout: 5000, maxBuffer: 128 * 1024 });
      russianOcr = result.stdout.split(/\r?\n/).includes("rus");
    } catch {}
  }
  let pdfaProfile = Boolean(process.env.PDFA_ICC_PROFILE);
  if (!pdfaProfile) {
    try {
      const prefix = (await run("brew", ["--prefix", "ghostscript"])).stdout.trim();
      await access(join(prefix, "share", "ghostscript", "iccprofiles", "default_rgb.icc"));
      pdfaProfile = true;
    } catch {}
  }
  response.json({
    ok: true,
    tools,
    versions,
    russianOcr,
    ollama,
    modelReady,
    model,
    pdfaProfile,
  });
});

const upload = multer({
  dest: tmpdir(),
  limits: { fileSize: maxUpload, files: 10, fields: 20, fieldSize: 16 * 1024 },
});

app.post("/api/tools/:tool", upload.array("files", 10), async (request, response) => {
  const files = request.files || [];
  const directory = await mkdtemp(join(tmpdir(), "failo-local-"));
  try {
    if (!files.length) throw new Error("Добавьте файлы для обработки.");
    for (const [index, file] of files.entries()) {
      const safeName = `${index + 1}-${safeBaseName(file.originalname)}${extname(file.originalname).toLowerCase()}`;
      const destination = join(directory, safeName);
      await rename(file.path, destination);
      file.path = destination;
    }
    const result = await processTool(request.params.tool, files, request.body, directory);
    response.set({
      "content-type": result.type,
      "content-disposition": `attachment; filename="${encodeURIComponent(result.filename)}"; filename*=UTF-8''${encodeURIComponent(result.filename)}`,
      "cache-control": "no-store",
      "content-length": String(result.buffer.length),
    });
    response.end(result.buffer);
  } catch (error) {
    response.status(400).json({ error: error.message || "Не удалось обработать файл." });
  } finally {
    await Promise.all(files.map((file) => rm(file.path, { force: true })));
    await rm(directory, { recursive: true, force: true });
  }
});

app.post("/api/forms/fields", upload.single("file"), async (request, response) => {
  try {
    const document = await PDFDocument.load(await readFile(request.file.path));
    const fields = document.getForm().getFields().map((field) => ({
      name: field.getName(),
      type: field.constructor.name,
    }));
    response.json({ fields });
  } catch (error) {
    response.status(400).json({ error: error.message || "Не удалось прочитать поля PDF." });
  } finally {
    if (request.file) await rm(request.file.path, { force: true });
  }
});

app.post("/api/forms/fill", upload.single("file"), async (request, response) => {
  try {
    const document = await PDFDocument.load(await readFile(request.file.path));
    const values = JSON.parse(request.body.values || "{}");
    const form = document.getForm();
    for (const field of form.getFields()) {
      if (!(field.getName() in values)) continue;
      const value = values[field.getName()];
      if (field.constructor.name === "PDFTextField") field.setText(String(value));
      else if (field.constructor.name === "PDFCheckBox") value ? field.check() : field.uncheck();
      else if (field.constructor.name === "PDFDropdown") field.select(String(value));
      else if (field.constructor.name === "PDFRadioGroup") field.select(String(value));
    }
    form.flatten();
    const bytes = await document.save();
    response.type("application/pdf").set("content-disposition", 'attachment; filename="filled-form.pdf"').send(Buffer.from(bytes));
  } catch (error) {
    response.status(400).json({ error: error.message || "Не удалось заполнить PDF-форму." });
  } finally {
    if (request.file) await rm(request.file.path, { force: true });
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    response.status(413).json({ error: "Файл больше допустимых 50 МБ." });
    return;
  }
  response.status(400).json({ error: error.message || "Некорректный запрос." });
});

app.listen(port, localOnly, () => {
  console.log(`Файло запущен: http://${localOnly}:${port}`);
});
