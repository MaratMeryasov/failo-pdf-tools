import * as pdfjsLib from "./node_modules/pdfjs-dist/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs";
window.pdfjsLib = pdfjsLib;
await import("./app.js");
