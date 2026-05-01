export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export function extensionFor(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The image could not be loaded.'));
    };
    image.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: OutputFormat, quality = 0.86): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The browser could not export this image.'))), type, quality);
  });
}

export function drawImageToCanvas(image: HTMLImageElement, width = image.naturalWidth, height = image.naturalHeight): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function reencodeImage(file: File, type: OutputFormat, quality = 0.86, width?: number, height?: number): Promise<{ blob: Blob; image: HTMLImageElement; canvas: HTMLCanvasElement }> {
  const image = await loadImage(file);
  const canvas = drawImageToCanvas(image, width, height);
  return { blob: await canvasToBlob(canvas, type, quality), image, canvas };
}
