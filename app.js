(() => {
  const toolDefinitions = {
    merge: {
      title: "Объединить PDF",
      description: "Объедините несколько PDF в один документ.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 2,
      maximum: 10,
      action: "Объединить",
      server: true,
    },
    split: {
      title: "Разделить PDF",
      description: "Выберите нужные страницы и сохраните их отдельным PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Разделить PDF",
      server: true,
    },
    compress: {
      title: "Сжать PDF",
      description: "Настройте качество страниц, чтобы уменьшить размер PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Сжать PDF",
      server: true,
    },
    "pdf-to-images": {
      title: "PDF в изображения",
      description: "Преобразуйте страницы PDF в изображения JPG или PNG.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Конвертировать",
      server: true,
    },
    "images-to-pdf": {
      title: "Изображения в PDF",
      description: "Разместите изображения в нужном порядке и создайте PDF.",
      accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
      extensions: ["jpg", "jpeg", "png"],
      minimum: 1,
      maximum: 10,
      action: "Создать PDF",
      server: true,
    },
    rotate: {
      title: "Повернуть PDF",
      description: "Поверните страницы документа и сохраните результат.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Повернуть PDF",
      server: true,
    },
    organize: {
      title: "Упорядочить страницы",
      description: "Укажите порядок страниц в новом PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Сохранить порядок",
      server: true,
    },
    watermark: {
      title: "Добавить водяной знак",
      description: "Добавьте полупрозрачную надпись на страницы PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Добавить знак",
      server: true,
    },
    "page-numbers": {
      title: "Добавить номера страниц",
      description: "Добавьте нумерацию страниц в PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Пронумеровать",
      server: true,
    },
    sign: {
      title: "Подписать PDF",
      description: "Нарисуйте подпись. Она будет добавлена внизу страницы.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Подписать PDF",
      server: true,
    },
    ocr: {
      title: "Распознать текст в PDF",
      description: "Добавьте текстовый слой к отсканированному PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Распознать текст",
      server: true,
    },
    "office-to-pdf": {
      title: "Office в PDF",
      description: "Преобразуйте документ, таблицу или презентацию в PDF.",
      accept: ".doc,.docx,.odt,.rtf,.ppt,.pptx,.odp,.xls,.xlsx,.ods",
      extensions: ["doc", "docx", "odt", "rtf", "ppt", "pptx", "odp", "xls", "xlsx", "ods"],
      minimum: 1,
      maximum: 1,
      action: "Преобразовать в PDF",
      server: true,
    },
    "pdf-to-docx": {
      title: "PDF в Word",
      description: "Извлеките текст PDF в документ DOCX.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Скачать DOCX",
      server: true,
    },
    "pdf-to-pptx": {
      title: "PDF в PowerPoint",
      description: "Создайте слайд из каждой страницы PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Скачать PPTX",
      server: true,
    },
    "pdf-to-xlsx": {
      title: "PDF в Excel",
      description: "Перенесите строки текста из PDF в таблицу Excel.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Скачать XLSX",
      server: true,
    },
    "pdf-to-markdown": {
      title: "PDF в Markdown",
      description: "Извлеките текст документа в файл Markdown.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Скачать Markdown",
      server: true,
    },
    summarize: {
      title: "Краткая сводка",
      description: "Составьте краткую сводку PDF с помощью локальной AI-модели.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Составить сводку",
      server: true,
    },
    translate: {
      title: "Перевести PDF",
      description: "Переведите текст документа локальной AI-моделью.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Перевести",
      server: true,
    },
    compare: {
      title: "Сравнить PDF",
      description: "Сравните текст двух документов и скачайте список изменений.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 2,
      maximum: 2,
      action: "Сравнить документы",
      server: true,
    },
    repair: {
      title: "Восстановить PDF",
      description: "Попробуйте восстановить структуру повреждённого PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Восстановить PDF",
      server: true,
    },
    protect: {
      title: "Защитить PDF паролем",
      description: "Зашифруйте PDF паролем для открытия.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Защитить PDF",
      server: true,
    },
    unlock: {
      title: "Снять пароль с PDF",
      description: "Введите пароль, чтобы сохранить незашифрованную копию документа.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Снять пароль",
      server: true,
    },
    pdfa: {
      title: "Преобразовать в PDF/A",
      description: "Создайте версию PDF/A для долгосрочного хранения.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Создать PDF/A",
      server: true,
    },
    "html-to-pdf": {
      title: "HTML в PDF",
      description: "Преобразуйте HTML-файл в PDF.",
      accept: ".html,.htm,text/html",
      extensions: ["html", "htm"],
      minimum: 1,
      maximum: 1,
      action: "Создать PDF",
      server: true,
    },
    redact: {
      title: "Скрыть данные в PDF",
      description: "Закройте чёрным прямоугольником выбранную область страницы.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Скрыть область",
      server: true,
    },
    crop: {
      title: "Обрезать страницы PDF",
      description: "Задайте поля обрезки для страниц документа.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Обрезать PDF",
      server: true,
    },
    forms: {
      title: "Заполнить PDF-форму",
      description: "Посмотрите доступные поля, заполните их и сохраните PDF.",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
      minimum: 1,
      maximum: 1,
      action: "Заполнить форму",
      server: true,
    },
  };

  const dialog = document.querySelector(".tool-dialog");
  const input = document.querySelector("#file-input");
  const dropZone = document.querySelector(".drop-zone");
  const fileList = document.querySelector(".file-list");
  const options = document.querySelector(".tool-options");
  const description = document.querySelector(".dialog-description");
  const title = document.querySelector("#dialog-title");
  const primaryButton = document.querySelector(".primary-button");
  const secondaryButton = document.querySelector(".secondary-button");
  const status = document.querySelector(".status-message");
  const toast = document.querySelector(".toast");
  let activeTool = null;
  let selectedFiles = [];
  let busy = false;
  let formFieldsLoaded = false;
  let toastTimer;

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
  };

  const setStatus = (message, success = false) => {
    status.textContent = message;
    status.classList.toggle("success", success);
  };

  const extensionOf = (file) => file.name.split(".").pop().toLowerCase();

  function validateFile(file) {
    const extension = extensionOf(file);
    if (!toolDefinitions[activeTool].extensions.includes(extension)) {
      return `${file.name}: этот формат не подходит.`;
    }
    if (file.size === 0)     return `${file.name}: файл пустой.`;
    if (file.size > 50 * 1024 * 1024)     return `${file.name}: файл больше 50 МБ.`;
    return "";
  }

  function updatePrimaryButton() {
    const definition = toolDefinitions[activeTool];
    const enoughFiles = selectedFiles.length >= definition.minimum &&
      (activeTool !== "forms" || formFieldsLoaded);
    primaryButton.disabled = !enoughFiles || busy;
    primaryButton.innerHTML = busy
      ? "Выполняется…"
      : `${definition.action} <span>→</span>`;
    input.disabled = busy;
    document.querySelector(".dialog-close").disabled = busy;
    secondaryButton.disabled = busy;
    document.querySelectorAll(".remove-file").forEach((button) => {
      button.disabled = busy;
    });
    options.querySelectorAll("input, select, button").forEach((control) => {
      control.disabled = busy;
    });
  }

  function renderFiles() {
    fileList.replaceChildren();
    for (const [index, file] of selectedFiles.entries()) {
      const row = document.createElement("div");
      row.className = "file-row";
      const badge = document.createElement("span");
      badge.className = "file-badge";
      badge.textContent = extensionOf(file).slice(0, 4).toUpperCase();
      const name = document.createElement("span");
      name.className = "file-name";
      name.title = file.name;
      name.textContent = file.name;
      const size = document.createElement("span");
      size.className = "file-size";
      size.textContent = formatSize(file.size);
      const remove = document.createElement("button");
      remove.className = "remove-file";
      remove.type = "button";
      remove.setAttribute("aria-label", `Убрать ${file.name}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderFiles();
        updatePrimaryButton();
      });
      row.append(badge, name, size, remove);
      fileList.append(row);
    }
    updatePrimaryButton();
  }

  function addFiles(files) {
    const definition = toolDefinitions[activeTool];
    const candidates = Array.from(files);
    if (definition.maximum === 1 && candidates.length > 1) {
      setStatus("Для этой операции можно добавить только один файл.");
      candidates.splice(1);
    } else {
      setStatus("");
    }
    for (const file of candidates) {
      const error = validateFile(file);
      if (error) {
        setStatus(error);
        continue;
      }
      if (definition.maximum === 1) selectedFiles = [];
      if (definition.maximum && selectedFiles.length >= definition.maximum) {
        setStatus(`Для этой операции можно добавить не более ${definition.maximum} файлов.`);
        break;
      }
      if (activeTool !== "compare" && selectedFiles.some((existing) => existing.name === file.name && existing.size === file.size)) {
        setStatus(`${file.name} уже в списке.`);
        continue;
      }
      selectedFiles.push(file);
    }
    renderFiles();
    if (activeTool === "forms" && selectedFiles.length) loadFormFields(selectedFiles[0]);
  }

  async function loadFormFields(file) {
    const formData = new FormData();
    formData.append("file", file);
    setStatus("Читаю поля PDF…");
    try {
      const response = await fetch("/api/forms/fields", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось прочитать поля формы.");
      formFieldsLoaded = true;
      const hint = options.querySelector(".form-hint");
      options.querySelectorAll(".form-field").forEach((field) => field.remove());
      if (!result.fields.length) {
        hint.textContent = "В этом PDF нет интерактивных полей для заполнения.";
        setStatus("");
        updatePrimaryButton();
        return;
      }
      hint.textContent = `Найдено полей: ${result.fields.length}. Заполните нужные поля.`;
      for (const field of result.fields) {
        const label = document.createElement("label");
        label.className = "option-label form-field";
        label.append(document.createElement("span"));
        label.firstChild.textContent = field.name;
        const control = document.createElement(field.type === "PDFCheckBox" ? "input" : "input");
        control.type = field.type === "PDFCheckBox" ? "checkbox" : "text";
        control.dataset.formField = field.name;
        control.setAttribute("aria-label", field.name);
        label.append(control);
        options.insertBefore(label, hint);
      }
      setStatus("");
      updatePrimaryButton();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось прочитать поля формы.");
    }
  }

  function setOptions(tool) {
    options.replaceChildren();
    if (tool === "protect" || tool === "unlock") {
      options.innerHTML = `
        <label class="option-label" for="pdf-password"><span>Пароль</span><input id="pdf-password" type="password" autocomplete="new-password" placeholder="Введите пароль"></label>
        <span class="option-hint">${tool === "protect" ? "Для защиты используйте пароль длиной не менее 6 символов." : "Пароль не отправляется в интернет; он используется только на этом компьютере."}</span>`;
    } else if (tool === "ocr") {
      options.innerHTML = `
        <label class="option-label" for="ocr-language"><span>Язык текста</span><select id="ocr-language"><option value="rus+eng">Русский и английский</option><option value="eng">Английский</option></select></label>
        <span class="option-hint">Для OCR нужны локально установленные Tesseract, OCRmyPDF и языковые данные.</span>`;
    } else if (tool === "translate") {
      options.innerHTML = `
        <label class="option-label" for="translate-language"><span>Перевести на</span><select id="translate-language"><option>Русский</option><option>English</option><option>Español</option><option>Français</option><option>Deutsch</option><option>中文</option></select></label>
        <span class="option-hint">Перевод сохраняется в текстовом файле без исходной вёрстки. Требуется локальная AI-модель Ollama.</span>`;
    } else if (tool === "compare") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Добавьте исходную и исправленную версии. Сравнивается текстовый слой PDF.";
      options.append(hint);
    } else if (tool === "pdf-to-docx" || tool === "pdf-to-xlsx" || tool === "pdf-to-pptx") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = tool === "pdf-to-pptx"
        ? "Каждая страница станет слайдом-картинкой, текст слайда нельзя редактировать."
        : "Это извлечение текста; исходная вёрстка документа может измениться.";
      options.append(hint);
    } else if (tool === "pdf-to-markdown") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Будет создан файл Markdown с текстом документа и заголовками страниц.";
      options.append(hint);
    } else if (tool === "summarize") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Сводка создаётся на этом компьютере через Ollama. Если PDF — скан, сначала выполните OCR.";
      options.append(hint);
    } else if (tool === "repair") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Результат зависит от повреждения. Для восстановления нужна локальная программа qpdf.";
      options.append(hint);
    } else if (tool === "pdfa") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Нужны Ghostscript и ICC-профиль; см. инструкцию по запуску локального сервера.";
      options.append(hint);
    } else if (tool === "html-to-pdf") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Поддерживается HTML-файл. Внешние изображения и стили могут не попасть в результат.";
      options.append(hint);
    } else if (tool === "redact") {
      options.innerHTML = `
        <label class="option-label" for="redact-page"><span>Страница</span><input id="redact-page" type="number" min="1" value="1"></label>
        <label class="option-label" for="redact-x"><span>Отступ слева, мм</span><input id="redact-x" type="number" min="0" value="20"></label>
        <label class="option-label" for="redact-y"><span>Отступ сверху, мм</span><input id="redact-y" type="number" min="0" value="20"></label>
        <label class="option-label" for="redact-width"><span>Ширина, мм</span><input id="redact-width" type="number" min="1" value="50"></label>
        <label class="option-label" for="redact-height"><span>Высота, мм</span><input id="redact-height" type="number" min="1" value="15"></label>
        <span class="option-hint">Страница будет растрирована, чтобы закрытый текст нельзя было восстановить выделением.</span>`;
    } else if (tool === "crop") {
      options.innerHTML = `
        <label class="option-label" for="crop-left"><span>Слева, мм</span><input id="crop-left" type="number" min="0" value="0"></label>
        <label class="option-label" for="crop-top"><span>Сверху, мм</span><input id="crop-top" type="number" min="0" value="0"></label>
        <label class="option-label" for="crop-right"><span>Справа, мм</span><input id="crop-right" type="number" min="0" value="0"></label>
        <label class="option-label" for="crop-bottom"><span>Снизу, мм</span><input id="crop-bottom" type="number" min="0" value="0"></label>
        <span class="option-hint">Поля применяются ко всем страницам.</span>`;
    } else if (tool === "forms") {
      const hint = document.createElement("span");
      hint.className = "option-hint form-hint";
      hint.textContent = "Добавьте PDF с интерактивными полями, чтобы показать их здесь.";
      options.append(hint);
    } else if (tool === "split") {
      options.innerHTML = `
        <label class="option-label" for="page-range"><span>Страницы</span><input id="page-range" type="text" placeholder="например, 1-3, 5"></label>
        <span class="option-hint">Можно указать отдельные страницы и диапазоны: 1-3, 5, 8-10.</span>`;
    } else if (tool === "rotate") {
      options.innerHTML = `
        <label class="option-label" for="rotation-angle"><span>Поворот</span><select id="rotation-angle"><option value="90">На 90° по часовой стрелке</option><option value="180">На 180°</option><option value="270">На 90° против часовой стрелки</option></select></label>`;
    } else if (tool === "organize") {
      options.innerHTML = `
        <label class="option-label" for="page-order"><span>Порядок страниц</span><input id="page-order" type="text" placeholder="например, 3, 1, 2"></label>
        <span class="option-hint">Укажите номера страниц в нужном порядке. Те, которых нет в списке, будут удалены.</span>`;
    } else if (tool === "watermark") {
      options.innerHTML = `
        <label class="option-label" for="watermark-text"><span>Текст</span><input id="watermark-text" type="text" maxlength="60" placeholder="например, КОПИЯ"></label>
        <label class="option-label" for="watermark-opacity"><span>Прозрачность <strong id="opacity-value">25%</strong></span><input id="watermark-opacity" type="range" min="10" max="70" value="25"></label>`;
      options.querySelector("#watermark-opacity").addEventListener("input", (event) => {
        options.querySelector("#opacity-value").textContent = `${event.target.value}%`;
      });
    } else if (tool === "page-numbers") {
      options.innerHTML = `
        <label class="option-label" for="number-format"><span>Формат</span><select id="number-format"><option value="number">1, 2, 3…</option><option value="total">1 / 10</option></select></label>`;
    } else if (tool === "sign") {
      options.innerHTML = `
        <span class="option-hint">Нарисуйте подпись в поле. В PDF она добавится как изображение, а не как электронная подпись с сертификатом.</span>
        <canvas class="signature-pad" width="900" height="280" aria-label="Поле для рисунка подписи"></canvas>
        <button class="signature-clear" type="button">Очистить подпись</button>`;
      setupSignaturePad(options.querySelector(".signature-pad"));
      options.querySelector(".signature-clear").addEventListener("click", () => {
        const canvas = options.querySelector(".signature-pad");
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      });
    } else if (tool === "compress") {
      options.innerHTML = `
        <label class="option-label" for="compression-quality"><span>Качество <strong id="quality-value">60%</strong></span><input id="compression-quality" type="range" min="25" max="90" value="60"></label>
        <span class="option-hint">Сжатие выполняется локально. Текст и векторная графика в документе сохраняются.</span>`;
      options.querySelector("#compression-quality").addEventListener("input", (event) => {
        options.querySelector("#quality-value").textContent = `${event.target.value}%`;
      });
    } else if (tool === "pdf-to-images") {
      options.innerHTML = `
        <label class="option-label" for="image-format"><span>Формат</span><select id="image-format"><option value="jpg">JPG — файл меньше</option><option value="png">PNG — без потери качества</option></select></label>
        <label class="option-label" for="image-scale"><span>Качество</span><select id="image-scale"><option value="1">Обычное</option><option value="1.5">Высокое</option><option value="2">Максимальное</option></select></label>`;
    } else if (tool === "images-to-pdf") {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Порядок страниц будет таким же, как в списке файлов.";
      options.append(hint);
    } else {
      const hint = document.createElement("span");
      hint.className = "option-hint";
      hint.textContent = "Файлы будут объединены в порядке списка.";
      options.append(hint);
    }
  }

  function openTool(tool) {
    activeTool = tool;
    selectedFiles = [];
    formFieldsLoaded = false;
    const definition = toolDefinitions[tool];
    title.textContent = definition.title;
    description.textContent = definition.description;
    input.accept = definition.accept;
    input.multiple = definition.maximum !== 1;
    document.querySelector(".file-types").textContent =
      tool === "images-to-pdf" ? "JPG или PNG · до 50 МБ каждый" : "PDF · до 50 МБ каждый";
    setOptions(tool);
    renderFiles();
    setStatus("");
    dialog.showModal();
  }

  function safeFilename(name, suffix, extension) {
    const base = name.replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]/g, "_").slice(0, 80) || "document";
    return `${base}-${suffix}.${extension}`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function parsePageRanges(raw, pageCount) {
    const text = raw.trim();
    if (!text) throw new Error("Укажи номера страниц.");
    const pages = new Set();
    for (const part of text.split(",")) {
      const range = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!range) throw new Error(`Не получилось разобрать «${part.trim()}». Проверь номера страниц.`);
      const start = Number(range[1]);
      const end = Number(range[2] || range[1]);
      if (start < 1 || end < start || end > pageCount) {
        throw new Error(`В документе ${pageCount} стр. Проверьте диапазон ${part.trim()}.`);
      }
      for (let page = start; page <= end; page += 1) pages.add(page - 1);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  function parsePageOrder(raw, pageCount) {
    const items = raw.split(",").map((item) => item.trim());
    if (items.length === 0 || items.some((item) => !/^\d+$/.test(item))) {
      throw new Error("Укажите номера страниц через запятую.");
    }
    const pages = items.map(Number);
    if (pages.some((page) => page < 1 || page > pageCount) || new Set(pages).size !== pages.length) {
      throw new Error(`Укажите разные номера от 1 до ${pageCount}.`);
    }
    return pages.map((page) => page - 1);
  }

  function setupSignaturePad(canvas) {
    const context = canvas.getContext("2d");
    context.strokeStyle = "#28263b";
    context.lineWidth = 7;
    context.lineCap = "round";
    context.lineJoin = "round";
    let drawing = false;
    const pointFromEvent = (event) => {
      const bounds = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
        y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
      };
    };
    canvas.addEventListener("pointerdown", (event) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const point = pointFromEvent(event);
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(point.x + 0.1, point.y + 0.1);
      context.stroke();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      const point = pointFromEvent(event);
      context.lineTo(point.x, point.y);
      context.stroke();
    });
    const stopDrawing = () => { drawing = false; };
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
  }

  function createWatermarkImage(text, opacity) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 240;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Не удалось подготовить водяной знак.");
    context.globalAlpha = opacity;
    context.fillStyle = "#555";
    context.font = "bold 120px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 40);
    return canvas.toDataURL("image/png");
  }

  async function ensurePdfLibraries() {
    if (!window.PDFLib?.PDFDocument || !window.pdfjsLib) {
      throw new Error("Не удалось загрузить обработчик PDF. Проверь подключение к интернету и перезагрузи страницу.");
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs";
    return window.PDFLib.PDFDocument;
  }

  async function mergePdfs(PDFDocument) {
    const merged = await PDFDocument.create();
    for (const file of selectedFiles) {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const copied = await merged.copyPages(source, source.getPageIndices());
      copied.forEach((page) => merged.addPage(page));
    }
    downloadBlob(new Blob([await merged.save()], { type: "application/pdf" }), "merged-document.pdf");
  }

  async function splitPdf(PDFDocument) {
    const source = await PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const indices = parsePageRanges(options.querySelector("#page-range").value, source.getPageCount());
    const output = await PDFDocument.create();
    const copied = await output.copyPages(source, indices);
    copied.forEach((page) => output.addPage(page));
    downloadBlob(
      new Blob([await output.save()], { type: "application/pdf" }),
      safeFilename(selectedFiles[0].name, "pages", "pdf"),
    );
  }

  function canvasBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Не удалось сохранить изображение. Попробуй другой формат."));
      }, type, quality);
    });
  }

  async function loadPdfPage(pdf, pageNumber, scale) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Браузер не смог обработать страницу.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    return { canvas, page };
  }

  async function pdfToImages() {
    const loadingTask = window.pdfjsLib.getDocument({ data: await selectedFiles[0].arrayBuffer() });
    const pdf = await loadingTask.promise;
    const format = options.querySelector("#image-format").value;
    const scale = Number(options.querySelector("#image-scale").value);
    const files = [];
    const base = selectedFiles[0].name.replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]/g, "_").slice(0, 70);
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setStatus(`Обработка страницы ${pageNumber} из ${pdf.numPages}…`);
      const { canvas, page } = await loadPdfPage(pdf, pageNumber, scale);
      const blob = await canvasBlob(canvas, format === "jpg" ? "image/jpeg" : "image/png", 0.92);
      files.push({ name: `${base || "document"}-${String(pageNumber).padStart(3, "0")}.${format}`, blob });
      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
    }
    await loadingTask.destroy();
    if (files.length === 1) {
      downloadBlob(files[0].blob, files[0].name);
      return;
    }
    if (!window.JSZip) {
      throw new Error("Не удалось собрать изображения в архив. Проверь подключение к интернету и попробуй ещё раз.");
    }
    const zip = new window.JSZip();
    files.forEach(({ name, blob }) => zip.file(name, blob));
    downloadBlob(
      await zip.generateAsync({ type: "blob" }),
      safeFilename(selectedFiles[0].name, "images", "zip"),
    );
  }

  async function compressPdf(PDFDocument) {
    const sourceFile = selectedFiles[0];
    const loadingTask = window.pdfjsLib.getDocument({ data: await sourceFile.arrayBuffer() });
    const pdf = await loadingTask.promise;
    const quality = Number(options.querySelector("#compression-quality").value) / 100;
    const output = await PDFDocument.create();
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setStatus(`Сжатие страницы ${pageNumber} из ${pdf.numPages}…`);
      const { canvas, page } = await loadPdfPage(pdf, pageNumber, 0.8);
      const imageBytes = new Uint8Array(await (await canvasBlob(canvas, "image/jpeg", quality)).arrayBuffer());
      const image = await output.embedJpg(imageBytes);
      const outputPage = output.addPage([page.view[2] - page.view[0], page.view[3] - page.view[1]]);
      outputPage.drawImage(image, { x: 0, y: 0, width: outputPage.getWidth(), height: outputPage.getHeight() });
      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
    }
    await loadingTask.destroy();
    const result = await output.save();
    const blob = new Blob([result], { type: "application/pdf" });
    const change = Math.round((1 - blob.size / sourceFile.size) * 100);
    downloadBlob(blob, safeFilename(sourceFile.name, "compressed", "pdf"));
    const outcome = change > 0
      ? `Размер PDF уменьшен на ${change}%.`
      : "PDF обработан, но его размер не уменьшился.";
    setStatus(outcome, true);
  }

  async function imagesToPdf(PDFDocument) {
    const document = await PDFDocument.create();
    for (const file of selectedFiles) {
      const bytes = await file.arrayBuffer();
      const image = extensionOf(file) === "png" ? await document.embedPng(bytes) : await document.embedJpg(bytes);
      const page = document.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    downloadBlob(
      new Blob([await document.save()], { type: "application/pdf" }),
      "images-document.pdf",
    );
  }

  async function rotatePdf(PDFDocument) {
    const document = await PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const angle = Number(options.querySelector("#rotation-angle").value);
    document.getPages().forEach((page) => {
      const rotation = page.getRotation().angle;
      page.setRotation(window.PDFLib.degrees((rotation + angle) % 360));
    });
    downloadBlob(
      new Blob([await document.save()], { type: "application/pdf" }),
      safeFilename(selectedFiles[0].name, "rotated", "pdf"),
    );
  }

  async function organizePdf(PDFDocument) {
    const source = await PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const order = parsePageOrder(options.querySelector("#page-order").value, source.getPageCount());
    const output = await PDFDocument.create();
    const pages = await output.copyPages(source, order);
    pages.forEach((page) => output.addPage(page));
    downloadBlob(
      new Blob([await output.save()], { type: "application/pdf" }),
      safeFilename(selectedFiles[0].name, "ordered", "pdf"),
    );
  }

  async function watermarkPdf(PDFDocument) {
    const text = options.querySelector("#watermark-text").value.trim();
    if (!text) throw new Error("Введите текст водяного знака.");
    const opacity = Number(options.querySelector("#watermark-opacity").value) / 100;
    const document = await PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const image = await document.embedPng(createWatermarkImage(text, opacity));
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
    downloadBlob(
      new Blob([await document.save()], { type: "application/pdf" }),
      safeFilename(selectedFiles[0].name, "watermarked", "pdf"),
    );
  }

  async function addPageNumbers(PDFDocument) {
    const document = await PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const pages = document.getPages();
    const format = options.querySelector("#number-format").value;
    const font = await document.embedFont(window.PDFLib.StandardFonts.Helvetica);
    pages.forEach((page, index) => {
      const label = format === "total" ? `${index + 1} / ${pages.length}` : String(index + 1);
      const fontSize = 11;
      const width = page.getWidth();
      page.drawText(label, {
        x: width - label.length * fontSize * 0.55 - 28,
        y: 18,
        size: fontSize,
        font,
        color: window.PDFLib.rgb(0.3, 0.3, 0.35),
      });
    });
    downloadBlob(
      new Blob([await document.save()], { type: "application/pdf" }),
      safeFilename(selectedFiles[0].name, "numbered", "pdf"),
    );
  }

  async function signPdf(PDFDocument) {
    const canvas = options.querySelector(".signature-pad");
    const context = canvas.getContext("2d");
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasSignature = pixels.some((value, index) => index % 4 === 3 && value > 0);
    if (!hasSignature) throw new Error("Нарисуйте подпись в поле выше.");
    const document = await PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const signature = await document.embedPng(canvas.toDataURL("image/png"));
    for (const page of document.getPages()) {
      const { width } = page.getSize();
      const signatureWidth = Math.min(width * 0.32, 170);
      const signatureHeight = signatureWidth * signature.height / signature.width;
      page.drawImage(signature, {
        x: width - signatureWidth - 36,
        y: 34,
        width: signatureWidth,
        height: signatureHeight,
      });
    }
    downloadBlob(
      new Blob([await document.save()], { type: "application/pdf" }),
      safeFilename(selectedFiles[0].name, "signed", "pdf"),
    );
  }

  async function runServerTool() {
    const formData = new FormData();
    for (const file of selectedFiles) formData.append("files", file);
    const fields = {};
    options.querySelectorAll("input, select").forEach((control) => {
      if (!control.id) return;
      if (control.type === "range" && !["compression-quality", "watermark-opacity"].includes(control.id)) return;
      fields[control.id.replace(/^(?:pdf-|ocr-|translate-|redact-|crop-)/, "")] =
        control.type === "checkbox" ? control.checked : control.value;
    });
    if (activeTool === "protect" || activeTool === "unlock") fields.password = options.querySelector("#pdf-password").value;
    if (activeTool === "ocr") fields.language = options.querySelector("#ocr-language").value;
    if (activeTool === "translate") fields.language = options.querySelector("#translate-language").value;
    if (activeTool === "rotate") fields.angle = options.querySelector("#rotation-angle").value;
    if (activeTool === "organize") fields.order = options.querySelector("#page-order").value;
    if (activeTool === "split") fields.range = options.querySelector("#page-range").value;
    if (activeTool === "page-numbers") fields.format = options.querySelector("#number-format").value;
    if (activeTool === "watermark") fields.opacity = options.querySelector("#watermark-opacity").value;
    if (activeTool === "compress") fields.quality = options.querySelector("#compression-quality").value;
    if (activeTool === "pdf-to-images") {
      fields.format = options.querySelector("#image-format").value;
      fields.scale = options.querySelector("#image-scale").value;
    }
    if (activeTool === "sign") fields.signature = options.querySelector(".signature-pad").toDataURL("image/png");
    if (activeTool === "redact") {
      fields.page = options.querySelector("#redact-page").value;
      fields.x = options.querySelector("#redact-x").value;
      fields.y = options.querySelector("#redact-y").value;
      fields.width = options.querySelector("#redact-width").value;
      fields.height = options.querySelector("#redact-height").value;
    }
    if (activeTool === "crop") {
      for (const side of ["left", "top", "right", "bottom"]) {
        fields[side] = options.querySelector(`#crop-${side}`).value;
      }
    }
    if (activeTool === "forms") {
      const values = {};
      options.querySelectorAll("[data-form-field]").forEach((control) => {
        values[control.dataset.formField] = control.type === "checkbox" ? control.checked : control.value;
      });
      formData.set("values", JSON.stringify(values));
    } else {
      Object.entries(fields).forEach(([name, value]) => formData.append(name, value));
    }
    const endpoint = activeTool === "forms" ? "/api/forms/fill" : `/api/tools/${activeTool}`;
    const response = await fetch(endpoint, { method: "POST", body: formData });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "Сервер не смог обработать файл.");
    }
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    const plainName = disposition.match(/filename="([^"]+)"/i)?.[1];
    const filename = encodedName
      ? decodeURIComponent(encodedName)
      : plainName ? decodeURIComponent(plainName) : "result";
    downloadBlob(blob, filename);
  }

  async function runTool() {
    if (busy) return;
    busy = true;
    setStatus("Обработка файлов…");
    updatePrimaryButton();
    try {
      if (toolDefinitions[activeTool].server) {
        await runServerTool();
        setStatus("Готово. Файл скачивается.", true);
        showToast("Готовый файл появится в загрузках.");
        return;
      }
      const PDFDocument = await ensurePdfLibraries();
      if (activeTool === "merge") await mergePdfs(PDFDocument);
      else if (activeTool === "split") await splitPdf(PDFDocument);
      else if (activeTool === "compress") await compressPdf(PDFDocument);
      else if (activeTool === "pdf-to-images") await pdfToImages();
      else if (activeTool === "images-to-pdf") await imagesToPdf(PDFDocument);
      else if (activeTool === "rotate") await rotatePdf(PDFDocument);
      else if (activeTool === "organize") await organizePdf(PDFDocument);
      else if (activeTool === "watermark") await watermarkPdf(PDFDocument);
      else if (activeTool === "page-numbers") await addPageNumbers(PDFDocument);
      else if (activeTool === "sign") await signPdf(PDFDocument);
      if (activeTool !== "compress") {
        setStatus("Готово. Файл скачивается.", true);
      }
      showToast("Готовый файл появится в загрузках.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось обработать файлы.");
    } finally {
      busy = false;
      updatePrimaryButton();
    }
  }

  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => openTool(button.dataset.tool));
  });
  input.addEventListener("change", () => {
    if (input.files) addFiles(input.files);
    input.value = "";
  });
  for (const eventName of ["dragenter", "dragover"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("drag-over");
    });
  }
  for (const eventName of ["dragleave", "drop"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("drag-over");
    });
  }
  dropZone.addEventListener("drop", (event) => {
    if (event.dataTransfer?.files) addFiles(event.dataTransfer.files);
  });
  primaryButton.addEventListener("click", runTool);
  secondaryButton.addEventListener("click", () => dialog.close());
  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && !busy) dialog.close();
  });
  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  async function updateServerStatus() {
    const serverStatus = document.querySelector("#server-status");
    if (!serverStatus) return;
    try {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Сервер не отвечает.");
      const health = await response.json();
      const missing = [];
      if (!health.tools.soffice) missing.push("LibreOffice (Office и HTML)");
      if (!health.tools.ocrmypdf || !health.tools.tesseract || !health.russianOcr) {
        missing.push("OCR и языковые данные Tesseract");
      }
      if (!health.tools.qpdf) missing.push("qpdf (защита и восстановление)");
      if (!health.tools.pdftoppm || !health.tools.gs) missing.push("Poppler и Ghostscript");
      if (missing.length) {
        serverStatus.textContent = `Не установлено: ${missing.join("; ")}. См. README.md.`;
      } else if (!health.ollama) {
        serverStatus.textContent = "PDF-инструменты готовы. Для сводки и перевода запустите Ollama.";
      } else if (!health.modelReady) {
        serverStatus.textContent = `PDF-инструменты готовы. Для AI загрузите модель: ollama pull ${health.model}.`;
      } else {
        serverStatus.textContent = `Локальные инструменты готовы; AI работает через ${health.model}.`;
      }
      serverStatus.classList.toggle("ready", missing.length === 0);
      serverStatus.classList.toggle("warning", missing.length > 0);
    } catch {
      serverStatus.textContent = "Чтобы использовать локальные инструменты, запустите сервер: npm start — затем откройте http://127.0.0.1:4173.";
      serverStatus.classList.add("warning");
    }
  }

  updateServerStatus();
})();
