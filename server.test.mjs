import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { Document, Packer, Paragraph } from "docx";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import sharp from "sharp";

const port = 43891;
const origin = `http://127.0.0.1:${port}`;
let server;
let sourcePdf;

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error("Локальный сервер завершился до запуска.");
    try {
      const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Не удалось запустить тестовый сервер.");
}

async function postTool(tool, files, fields = {}) {
  const form = new FormData();
  for (const [name, bytes, type] of files) {
    form.append("files", new Blob([bytes], { type }), name);
  }
  for (const [name, value] of Object.entries(fields)) form.append(name, String(value));
  const response = await fetch(`${origin}/api/tools/${tool}`, { method: "POST", body: form });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function extractPdfText(bytes) {
  const loadingTask = getDocument({
    data: new Uint8Array(bytes),
    standardFontDataUrl: `${origin}/node_modules/pdfjs-dist/standard_fonts/`,
  });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    pages.push((await page.getTextContent()).items.map((item) => item.str).join(" "));
  }
  await loadingTask.destroy();
  return pages;
}

before(async () => {
  server = spawn(process.execPath, ["server.mjs"], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
    },
    stdio: "ignore",
  });
  await waitForServer();
  const document = await PDFDocument.create();
  for (const text of ["FIRST PAGE", "SECOND PAGE", "THIRD PAGE"]) {
    const page = document.addPage();
    page.drawText(text, { x: 40, y: 700 });
  }
  sourcePdf = Buffer.from(await document.save());
});

after(() => {
  server?.kill("SIGTERM");
});

test("local health endpoint reports installed OCR and Office tools", async () => {
  const response = await fetch(`${origin}/api/health`);
  const health = await response.json();
  assert.equal(health.ok, true);
  assert.equal(health.tools.soffice, true);
  assert.equal(health.tools.ocrmypdf, true);
  assert.equal(health.tools.qpdf, true);
  assert.equal(health.russianOcr, true);
});

test("server transforms PDF page order and rotation", async () => {
  const ordered = await postTool("organize", [["sample.pdf", sourcePdf, "application/pdf"]], { order: "3, 1" });
  assert.deepEqual(await extractPdfText(ordered), ["THIRD PAGE", "FIRST PAGE"]);

  const rotated = await postTool("rotate", [["sample.pdf", sourcePdf, "application/pdf"]], { angle: "90" });
  const document = await PDFDocument.load(rotated);
  assert.deepEqual(document.getPages().map((page) => page.getRotation().angle), [90, 90, 90]);
});

test("PDF comparison reports additions and removals", async () => {
  const revised = await PDFDocument.create();
  revised.addPage().drawText("FIRST PAGE");
  revised.addPage().drawText("REVISED PAGE");
  const report = await postTool("compare", [
    ["before.pdf", sourcePdf, "application/pdf"],
    ["after.pdf", Buffer.from(await revised.save()), "application/pdf"],
  ]);
  const text = report.toString("utf8");
  assert.match(text, /- SECOND PAGE/);
  assert.match(text, /\+ REVISED PAGE/);
});

test("PDF page numbering and watermark are written to the output", async () => {
  const numbered = await postTool("page-numbers", [["sample.pdf", sourcePdf, "application/pdf"]], { format: "total" });
  assert.match((await extractPdfText(numbered))[0], /1 \/ 3/);

  const marked = await postTool("watermark", [["sample.pdf", sourcePdf, "application/pdf"]], { text: "COPY", opacity: "25" });
  const loadingTask = getDocument({ data: new Uint8Array(marked) });
  const pdf = await loadingTask.promise;
  const operators = await (await pdf.getPage(1)).getOperatorList();
  assert.ok(operators.fnArray.includes(OPS.paintImageXObject));
  await loadingTask.destroy();

  const signature = await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><path d="M10 80 Q80 5 120 60 T290 40" fill="none" stroke="black" stroke-width="8"/></svg>')).png().toBuffer();
  const signed = await postTool("sign", [["sample.pdf", sourcePdf, "application/pdf"]], {
    signature: `data:image/png;base64,${signature.toString("base64")}`,
  });
  assert.equal((await PDFDocument.load(signed)).getPageCount(), 3);
});

test("merge, split, and compressed PDFs preserve the requested content", async () => {
  const merged = await postTool("merge", [
    ["first.pdf", sourcePdf, "application/pdf"],
    ["second.pdf", sourcePdf, "application/pdf"],
  ]);
  assert.equal((await PDFDocument.load(merged)).getPageCount(), 6);

  const split = await postTool("split", [["sample.pdf", sourcePdf, "application/pdf"]], { range: "1-2" });
  assert.deepEqual(await extractPdfText(split), ["FIRST PAGE", "SECOND PAGE"]);

  const compressed = await postTool("compress", [["sample.pdf", sourcePdf, "application/pdf"]], { quality: "60" });
  assert.deepEqual(await extractPdfText(compressed), ["FIRST PAGE", "SECOND PAGE", "THIRD PAGE"]);
});

test("image conversion tools create valid images and PDFs", async () => {
  const archiveBytes = await postTool("pdf-to-images", [["sample.pdf", sourcePdf, "application/pdf"]], {
    format: "jpg",
    scale: "1",
  });
  const archive = await JSZip.loadAsync(archiveBytes);
  const imageFile = archive.file("sample-001.jpg");
  assert.ok(imageFile);
  assert.equal((await sharp(await imageFile.async("nodebuffer")).metadata()).format, "jpeg");

  const png = await sharp({ create: { width: 20, height: 30, channels: 4, background: "#fff" } }).png().toBuffer();
  const converted = await postTool("images-to-pdf", [
    ["one.png", png, "image/png"],
    ["two.png", png, "image/png"],
  ]);
  assert.equal((await PDFDocument.load(converted)).getPageCount(), 2);
});

test("password protection can be removed with the supplied password", async () => {
  const encrypted = await postTool("protect", [["sample.pdf", sourcePdf, "application/pdf"]], { password: "secret123" });
  const clear = await postTool("unlock", [["locked.pdf", encrypted, "application/pdf"]], { password: "secret123" });
  assert.deepEqual(await extractPdfText(clear), ["FIRST PAGE", "SECOND PAGE", "THIRD PAGE"]);
});

test("interactive PDF form fields are listed and filled", async () => {
  const document = await PDFDocument.create();
  document.addPage();
  const field = document.getForm().createTextField("full_name");
  field.addToPage(document.getPages()[0]);
  const pdf = Buffer.from(await document.save());

  const inspect = new FormData();
  inspect.append("file", new Blob([pdf], { type: "application/pdf" }), "form.pdf");
  const fieldsResponse = await fetch(`${origin}/api/forms/fields`, { method: "POST", body: inspect });
  assert.deepEqual((await fieldsResponse.json()).fields.map((item) => item.name), ["full_name"]);

  const fill = new FormData();
  fill.append("file", new Blob([pdf], { type: "application/pdf" }), "form.pdf");
  fill.append("values", JSON.stringify({ full_name: "Ada Lovelace" }));
  const filledResponse = await fetch(`${origin}/api/forms/fill`, { method: "POST", body: fill });
  assert.equal(filledResponse.status, 200);
  assert.match((await extractPdfText(Buffer.from(await filledResponse.arrayBuffer())))[0], /Ada Lovelace/);
});

test("Office and PDF conversions create usable local documents", async () => {
  const word = new Document({ sections: [{ children: [new Paragraph("LOCAL OFFICE TEST")] }] });
  const docx = Buffer.from(await Packer.toBuffer(word));
  const officePdf = await postTool("office-to-pdf", [["sample.docx", docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]]);
  assert.match((await extractPdfText(officePdf))[0], /LOCAL OFFICE TEST/);

  const wordOutput = await postTool("pdf-to-docx", [["sample.pdf", sourcePdf, "application/pdf"]]);
  const wordZip = await JSZip.loadAsync(wordOutput);
  assert.match(await wordZip.file("word/document.xml").async("string"), /FIRST PAGE/);

  const workbookOutput = await postTool("pdf-to-xlsx", [["sample.pdf", sourcePdf, "application/pdf"]]);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(workbookOutput);
  assert.match(workbook.worksheets[0].getCell("A1").text, /FIRST PAGE/);

  const slidesOutput = await postTool("pdf-to-pptx", [["sample.pdf", sourcePdf, "application/pdf"]]);
  const presentation = await JSZip.loadAsync(slidesOutput);
  assert.ok(presentation.file("ppt/slides/slide3.xml"));
});

test("PDF to Markdown and HTML to PDF work on the local server", async () => {
  const markdown = await postTool("pdf-to-markdown", [["sample.pdf", sourcePdf, "application/pdf"]]);
  assert.match(markdown.toString("utf8"), /## Страница 1[\s\S]*FIRST PAGE/);

  const html = Buffer.from("<!doctype html><html><body><h1>LOCAL HTML TEST</h1></body></html>");
  const converted = await postTool("html-to-pdf", [["page.html", html, "text/html"]]);
  assert.match((await extractPdfText(converted))[0], /LOCAL HTML TEST/);
});

test("OCR, redaction, repair, and PDF/A produce valid PDFs", async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="220"><rect width="100%" height="100%" fill="white"/><text x="30" y="140" font-size="100" font-family="Arial">HELLO OCR</text></svg>');
  const image = await sharp(svg).png().toBuffer();
  const scan = await PDFDocument.create();
  const embedded = await scan.embedPng(image);
  const page = scan.addPage([embedded.width, embedded.height]);
  page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  const scannedPdf = Buffer.from(await scan.save());
  const searchable = await postTool("ocr", [["scan.pdf", scannedPdf, "application/pdf"]], { language: "eng" });
  assert.match((await extractPdfText(searchable))[0].toUpperCase(), /HELLO OCR/);

  const repaired = await postTool("repair", [["sample.pdf", sourcePdf, "application/pdf"]]);
  assert.equal((await PDFDocument.load(repaired)).getPageCount(), 3);

  const redacted = await postTool("redact", [["sample.pdf", sourcePdf, "application/pdf"]], {
    page: 1, x: 10, y: 10, width: 20, height: 10,
  });
  assert.equal((await PDFDocument.load(redacted)).getPageCount(), 3);

  const archival = await postTool("pdfa", [["sample.pdf", sourcePdf, "application/pdf"]]);
  assert.equal((await PDFDocument.load(archival)).getPageCount(), 3);
});
