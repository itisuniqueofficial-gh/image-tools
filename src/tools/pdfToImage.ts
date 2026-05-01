import { downloadBlob } from '../utils/files';
import { escapeHtml, formatBytes, slugFileName } from '../utils/format';
import { setStats, setStatus } from './common';

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (source: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (pageNumber: number) => Promise<{ getViewport: (options: { scale: number }) => { width: number; height: number }; render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } }> }> };
};

export function bindPdfToImage() {
  const root = document.querySelector<HTMLElement>('[data-tool-root]');
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>('[data-file-input]')!;
  const action = root.querySelector<HTMLButtonElement>('[data-action]')!;
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]')!;
  const output = root.querySelector<HTMLElement>('[data-pdf-output]')!;
  const preview = root.querySelector<HTMLElement>('[data-preview]')!;
  let file: File | undefined;
  let urls: string[] = [];

  input.addEventListener('change', () => {
    file = input.files?.[0];
    clearUrls();
    output.innerHTML = '';
    preview.innerHTML = '<span>Rendered PDF pages will appear here</span>';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatus(root, 'Please choose a PDF file.', true);
      action.disabled = true;
      return;
    }
    root.querySelector('[data-file-name]')!.textContent = `${escapeHtml(file.name)} · ${formatBytes(file.size)}`;
    action.disabled = false;
    setStats(root, [['Pages', '-'], ['Rendered', '0'], ['Format', 'PNG']]);
    setStatus(root, 'PDF ready. Render pages to continue.');
  });

  action.addEventListener('click', async () => {
    if (!file) return;
    action.disabled = true;
    setStatus(root, 'Loading PDF renderer...');
    try {
      clearUrls();
      output.innerHTML = '';
      const pdfjs = await loadPdfJs();
      const documentData = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: documentData }).promise;
      setStats(root, [['Pages', String(pdf.numPages)], ['Rendered', '0'], ['Format', 'PNG']]);
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        setStatus(root, `Rendering page ${pageNumber} of ${pdf.numPages}...`);
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: Math.min(2, window.devicePixelRatio || 1.5) });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is not supported in this browser.');
        await page.render({ canvasContext: context, viewport }).promise;
        const blob = await canvasToPng(canvas);
        const url = URL.createObjectURL(blob);
        urls.push(url);
        if (pageNumber === 1) preview.innerHTML = `<img class="max-h-full max-w-full object-contain" src="${url}" alt="PDF page 1 preview">`;
        const name = slugFileName(file.name, `page-${pageNumber}`, 'png');
        output.insertAdjacentHTML('beforeend', `<div class="ui-card-soft text-sm text-gray-600"><strong class="block text-gray-900">Page ${pageNumber}</strong><span>${formatBytes(blob.size)}</span><div class="mt-3"><button class="btn btn-secondary w-full" data-pdf-download="${pageNumber - 1}" data-name="${name}"><i class="fa-solid fa-download" aria-hidden="true"></i> Download PNG</button></div></div>`);
        setStats(root, [['Pages', String(pdf.numPages)], ['Rendered', String(pageNumber)], ['Format', 'PNG']]);
      }
      output.querySelectorAll<HTMLButtonElement>('[data-pdf-download]').forEach((button) => {
        button.addEventListener('click', async () => {
          const index = Number(button.dataset.pdfDownload);
          const response = await fetch(urls[index]);
          downloadBlob(await response.blob(), button.dataset.name || 'pdf-page.png');
        });
      });
      setStatus(root, 'PDF pages rendered. Download the PNG files you need.');
    } catch (error) {
      setStatus(root, (error as Error).message, true);
    } finally {
      action.disabled = false;
    }
  });

  reset.addEventListener('click', () => {
    input.value = '';
    file = undefined;
    clearUrls();
    root.querySelector('[data-file-name]')!.textContent = 'No file selected';
    preview.innerHTML = '<span>Rendered PDF pages will appear here</span>';
    output.innerHTML = '';
    setStats(root, [['Pages', '-'], ['Rendered', '-'], ['Format', '-']]);
    setStatus(root, 'Choose a PDF to begin.');
    action.disabled = true;
  });

  function clearUrls() {
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls = [];
  }
}

async function loadPdfJs(): Promise<PdfJs> {
  const dynamicImport = new Function('url', 'return import(url)') as (url: string) => Promise<PdfJs>;
  const pdfjs = await dynamicImport('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
  return pdfjs;
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export rendered page.')), 'image/png');
  });
}
