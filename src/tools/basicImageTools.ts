import { downloadBlob, validateImageFile } from '../utils/files';
import { canvasToBlob, drawImageToCanvas, extensionFor, loadImage, OutputFormat } from '../utils/image';
import { formatBytes, slugFileName } from '../utils/format';
import { fileInfo, setPreview, setStats, setStatus } from './common';

type State = { file?: File; blob?: Blob; filename?: string; image?: HTMLImageElement; sourceUrl?: string; outputUrl?: string };

declare global {
  interface Window {
    Cropper?: new (element: HTMLImageElement, options?: Record<string, unknown>) => { destroy: () => void; getCroppedCanvas: (options?: Record<string, unknown>) => HTMLCanvasElement; setData: (data: { x?: number; y?: number; width?: number; height?: number }) => void; getData: (rounded?: boolean) => { x: number; y: number; width: number; height: number } };
  }
}

export function bindCompressor() { bindImageTool(async (root, state) => {
  const quality = Number((root.querySelector('#quality') as HTMLInputElement).value) / 100;
  const selected = (root.querySelector('#format') as HTMLSelectElement).value;
  const type = (selected === 'same' ? normalizeType(state.file!.type) : selected) as OutputFormat;
  const canvas = drawImageToCanvas(state.image!);
  const blob = await canvasToBlob(canvas, type, quality);
  state.blob = blob; state.filename = slugFileName(state.file!.name, 'compressed', extensionFor(type)); setPreview(root, blob);
  const saved = Math.max(0, Math.round((1 - blob.size / state.file!.size) * 100));
  setStats(root, [['Original', formatBytes(state.file!.size)], ['Output', formatBytes(blob.size)], ['Saved', `${saved}%`]]);
}, ['image/jpeg','image/png','image/webp']); }

export function bindResizer() { let ratio = 1; bindImageTool(async (root, state) => {
  const w = Number((root.querySelector('#width') as HTMLInputElement).value); const h = Number((root.querySelector('#height') as HTMLInputElement).value);
  const type = normalizeType(state.file!.type); const canvas = drawImageToCanvas(state.image!, w, h); const blob = await canvasToBlob(canvas, type, .9);
  state.blob = blob; state.filename = slugFileName(state.file!.name, 'resized', extensionFor(type)); setPreview(root, blob); setStats(root, [['Original', `${state.image!.naturalWidth}×${state.image!.naturalHeight}`], ['Output', `${canvas.width}×${canvas.height}`], ['Size', formatBytes(blob.size)]]);
}, undefined, (root, state) => { ratio = state.image!.naturalWidth / state.image!.naturalHeight; const w = root.querySelector('#width') as HTMLInputElement; const h = root.querySelector('#height') as HTMLInputElement; w.value = String(state.image!.naturalWidth); h.value = String(state.image!.naturalHeight); w.oninput = () => { if ((root.querySelector('#ratio') as HTMLInputElement).checked) h.value = String(Math.round(Number(w.value) / ratio)); }; h.oninput = () => { if ((root.querySelector('#ratio') as HTMLInputElement).checked) w.value = String(Math.round(Number(h.value) * ratio)); }; }); }

export function bindCropper() { let cropper: InstanceType<NonNullable<typeof window.Cropper>> | null = null; bindImageTool(async (root, state) => {
  const x = Number((root.querySelector('#crop-x') as HTMLInputElement).value); const y = Number((root.querySelector('#crop-y') as HTMLInputElement).value); const w = Number((root.querySelector('#crop-w') as HTMLInputElement).value); const h = Number((root.querySelector('#crop-h') as HTMLInputElement).value);
  cropper?.setData({ x, y, width: w, height: h });
  const canvas = cropper?.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' }) || cropWithCanvas(state.image!, x, y, w, h);
  const type = normalizeType(state.file!.type); const blob = await canvasToBlob(canvas, type, .9); state.blob = blob; state.filename = slugFileName(state.file!.name, 'cropped', extensionFor(type)); state.outputUrl = setPreview(root, blob); const data = cropper?.getData(true) || { x, y, width: w, height: h }; setStats(root, [['Crop', `${Math.round(data.width)}×${Math.round(data.height)}`], ['X/Y', `${Math.round(data.x)}, ${Math.round(data.y)}`], ['Size', formatBytes(blob.size)]]);
}, undefined, (root, state) => { cropper?.destroy(); cropper = null; const cropW = root.querySelector('#crop-w') as HTMLInputElement; const cropH = root.querySelector('#crop-h') as HTMLInputElement; cropW.value = String(Math.round(state.image!.naturalWidth * .8)); cropH.value = String(Math.round(state.image!.naturalHeight * .8)); const img = root.querySelector<HTMLImageElement>('[data-source-preview] img'); const init = () => { if (!img || !window.Cropper) return; cropper?.destroy(); cropper = new window.Cropper(img, { viewMode: 1, autoCropArea: .8, responsive: true, background: false, crop(event: CustomEvent) { const detail = event.detail as { x: number; y: number; width: number; height: number }; (root.querySelector('#crop-x') as HTMLInputElement).value = String(Math.max(0, Math.round(detail.x))); (root.querySelector('#crop-y') as HTMLInputElement).value = String(Math.max(0, Math.round(detail.y))); cropW.value = String(Math.max(1, Math.round(detail.width))); cropH.value = String(Math.max(1, Math.round(detail.height))); } }); }; if (img) { if (img.complete) init(); else img.addEventListener('load', init, { once: true }); } }); const reset = document.querySelector<HTMLButtonElement>('[data-reset]'); reset?.addEventListener('click', () => { cropper?.destroy(); cropper = null; }); }

export function bindConverter(fixed?: OutputFormat, accept?: string[]) { bindImageTool(async (root, state) => {
  const selected = fixed || (root.querySelector('#format') as HTMLSelectElement).value as OutputFormat; const canvas = drawImageToCanvas(state.image!); if (selected === 'image/jpeg') { const ctx = canvas.getContext('2d')!; ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  const blob = await canvasToBlob(canvas, selected, .9); state.blob = blob; state.filename = slugFileName(state.file!.name, `converted`, extensionFor(selected)); setPreview(root, blob); setStats(root, [['Input', extensionFor(state.file!.type).toUpperCase()], ['Output', extensionFor(selected).toUpperCase()], ['Size', formatBytes(blob.size)]]);
}, accept); }

export function bindEnhancer() { bindImageTool(async (root, state) => {
  const b = Number((root.querySelector('#brightness') as HTMLInputElement).value); const c = Number((root.querySelector('#contrast') as HTMLInputElement).value); const s = Number((root.querySelector('#saturation') as HTMLInputElement).value); const sharp = Number((root.querySelector('#sharpness') as HTMLInputElement).value);
  const canvas = drawImageToCanvas(state.image!); const ctx = canvas.getContext('2d')!; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`; ctx.drawImage(state.image!,0,0,canvas.width,canvas.height); if (sharp > 0) sharpen(ctx, canvas.width, canvas.height, sharp / 100);
  const type = normalizeType(state.file!.type); const blob = await canvasToBlob(canvas, type, .9); state.blob = blob; state.filename = slugFileName(state.file!.name, 'enhanced', extensionFor(type)); setPreview(root, blob); setStats(root, [['Brightness', `${b}%`], ['Contrast', `${c}%`], ['Saturation', `${s}%`]]);
}); }

export function bindRotator() { bindImageTool(async (root, state) => {
  const angle = Number((root.querySelector('#angle') as HTMLSelectElement).value); const radians = angle * Math.PI / 180; const swap = angle === 90 || angle === 270; const canvas = document.createElement('canvas'); canvas.width = swap ? state.image!.naturalHeight : state.image!.naturalWidth; canvas.height = swap ? state.image!.naturalWidth : state.image!.naturalHeight; const ctx = canvas.getContext('2d')!; ctx.translate(canvas.width/2, canvas.height/2); ctx.rotate(radians); ctx.drawImage(state.image!, -state.image!.naturalWidth/2, -state.image!.naturalHeight/2);
  const type = normalizeType(state.file!.type); const blob = await canvasToBlob(canvas, type, .9); state.blob = blob; state.filename = slugFileName(state.file!.name, 'rotated', extensionFor(type)); setPreview(root, blob); setStats(root, [['Angle', `${angle}°`], ['Output', `${canvas.width}×${canvas.height}`], ['Size', formatBytes(blob.size)]]);
}); }

export function bindWatermark() { bindImageTool(async (root, state) => {
  const text = (root.querySelector('#watermark') as HTMLInputElement).value || 'Image Tools'; const canvas = drawImageToCanvas(state.image!); const ctx = canvas.getContext('2d')!; const size = Math.max(20, Math.round(canvas.width / 18)); ctx.font = `700 ${size}px sans-serif`; ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.strokeStyle = 'rgba(15,23,42,.45)'; ctx.lineWidth = Math.max(2, size / 12); ctx.textAlign = 'right'; ctx.strokeText(text, canvas.width - size, canvas.height - size); ctx.fillText(text, canvas.width - size, canvas.height - size);
  const type = normalizeType(state.file!.type); const blob = await canvasToBlob(canvas, type, .9); state.blob = blob; state.filename = slugFileName(state.file!.name, 'watermarked', extensionFor(type)); setPreview(root, blob); setStats(root, [['Watermark', text], ['Output', extensionFor(type).toUpperCase()], ['Size', formatBytes(blob.size)]]);
}); }

export function bindMetadataRemover() { bindImageTool(async (root, state) => { const type = normalizeType(state.file!.type); const canvas = drawImageToCanvas(state.image!); const blob = await canvasToBlob(canvas, type, .92); state.blob = blob; state.filename = slugFileName(state.file!.name, 'metadata-cleaned', extensionFor(type)); setPreview(root, blob); setStats(root, [['Original', formatBytes(state.file!.size)], ['Clean copy', formatBytes(blob.size)], ['Method', 'Canvas export']]); }); }

function bindImageTool(process: (root: HTMLElement, state: State) => Promise<void>, allowed?: string[], afterLoad?: (root: HTMLElement, state: State) => void) {
  const root = document.querySelector<HTMLElement>('[data-tool-root]'); if (!root) return; const state: State = {}; const input = root.querySelector<HTMLInputElement>('[data-file-input]')!; const action = root.querySelector<HTMLButtonElement>('[data-action]')!; const download = root.querySelector<HTMLButtonElement>('[data-download]')!; const reset = root.querySelector<HTMLButtonElement>('[data-reset]')!;
  input.addEventListener('change', async () => { const file = input.files?.[0]; if (!file) return; const error = validateImageFile(file, allowed); if (error) { setStatus(root, error, true); return; } try { cleanupUrls(state); state.file = file; state.image = await loadImage(file); state.sourceUrl = URL.createObjectURL(file); root.querySelector('[data-file-name]')!.textContent = fileInfo(file); root.querySelector<HTMLElement>('[data-source-preview]')!.innerHTML = `<img src="${state.sourceUrl}" alt="Selected image preview">`; action.disabled = false; download.disabled = true; afterLoad?.(root, state); setStatus(root, 'Image ready. Choose settings and process.'); } catch (err) { setStatus(root, (err as Error).message, true); } });
  action.addEventListener('click', async () => { if (!state.file) return; try { action.disabled = true; setStatus(root, 'Processing image...'); await process(root, state); download.disabled = false; setStatus(root, 'Processing complete. Download is ready.'); } catch (err) { setStatus(root, (err as Error).message, true); } finally { action.disabled = false; } });
  download.addEventListener('click', () => { if (state.blob && state.filename) downloadBlob(state.blob, state.filename); });
  reset.addEventListener('click', () => { input.value = ''; cleanupUrls(state); state.file = undefined; state.blob = undefined; state.image = undefined; root.querySelector('[data-file-name]')!.textContent = 'No file selected'; root.querySelector<HTMLElement>('[data-preview]')!.innerHTML = '<span>Output preview will appear here</span>'; root.querySelector<HTMLElement>('[data-source-preview]')!.innerHTML = '<span>Selected image preview</span>'; setStats(root, [['Original', '-'], ['Output', '-'], ['Result', '-']]); action.disabled = true; download.disabled = true; setStatus(root, 'Choose an image to begin.'); });
}

function normalizeType(type: string): OutputFormat { return type === 'image/png' || type === 'image/webp' ? type : 'image/jpeg'; }
function cropWithCanvas(image: HTMLImageElement, x: number, y: number, w: number, h: number) { const canvas = document.createElement('canvas'); canvas.width = Math.max(1, w); canvas.height = Math.max(1, h); const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas is not supported.'); ctx.drawImage(image, x, y, w, h, 0, 0, w, h); return canvas; }
function cleanupUrls(state: State) { if (state.sourceUrl) URL.revokeObjectURL(state.sourceUrl); if (state.outputUrl) URL.revokeObjectURL(state.outputUrl); state.sourceUrl = undefined; state.outputUrl = undefined; }
function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) { const image = ctx.getImageData(0,0,w,h); const d = image.data; const copy = new Uint8ClampedArray(d); for (let y=1;y<h-1;y++) for (let x=1;x<w-1;x++) { const i=(y*w+x)*4; for (let c=0;c<3;c++) { const v=copy[i+c]*(1+4*amount)-amount*(copy[i-4+c]+copy[i+4+c]+copy[i-w*4+c]+copy[i+w*4+c]); d[i+c]=Math.max(0,Math.min(255,v)); } } ctx.putImageData(image,0,0); }
