import { jsPDF } from 'jspdf';
import { downloadBlob } from '../utils/files';
import { loadImage } from '../utils/image';
import { escapeHtml } from '../utils/format';
import { setStatus } from './common';

export function bindImageToPdf() {
  const root = document.querySelector<HTMLElement>('[data-tool-root]'); if (!root) return;
  const input = root.querySelector<HTMLInputElement>('[data-file-input]')!; const action = root.querySelector<HTMLButtonElement>('[data-action]')!; const list = root.querySelector<HTMLElement>('[data-file-list]')!; let files: File[] = [];
  input.addEventListener('change', () => { files = [...(input.files || [])].filter((f) => f.type.startsWith('image/')); list.innerHTML = files.length ? files.map((file) => `<li><i class="fa-regular fa-file-image" aria-hidden="true"></i> ${escapeHtml(file.name)}</li>`).join('') : '<li>No images selected</li>'; action.disabled = files.length === 0; setStatus(root, files.length ? `${files.length} image(s) ready.` : 'Choose images to begin.'); });
  action.addEventListener('click', async () => { if (!files.length) return; action.disabled = true; setStatus(root, 'Generating PDF in your browser...'); try { const size = (root.querySelector('#page-size') as HTMLSelectElement).value; let pdf: jsPDF | null = null; for (const file of files) { const image = await loadImage(file); const orientation = image.naturalWidth > image.naturalHeight ? 'landscape' : 'portrait'; const page = size === 'a4' ? 'a4' : size === 'letter' ? 'letter' : [image.naturalWidth, image.naturalHeight] as [number, number]; if (!pdf) pdf = new jsPDF({ orientation, unit: 'px', format: page }); else pdf.addPage(page, orientation); const width = pdf.internal.pageSize.getWidth(); const height = pdf.internal.pageSize.getHeight(); const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight); const w = image.naturalWidth * scale; const h = image.naturalHeight * scale; const x = (width - w) / 2; const y = (height - h) / 2; const dataUrl = await fileToDataUrl(file); pdf.addImage(dataUrl, file.type === 'image/png' ? 'PNG' : 'JPEG', x, y, w, h); } const blob = pdf!.output('blob'); downloadBlob(blob, 'images.pdf'); setStatus(root, 'PDF generated and downloaded.'); } catch (err) { setStatus(root, (err as Error).message, true); } finally { action.disabled = false; } });
}

function fileToDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read an image for the PDF.')); reader.readAsDataURL(file); }); }
