export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function validateImageFile(file: File, allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif']): string | null {
  if (!allowed.includes(file.type)) return 'This file type is not supported by this browser-based tool.';
  if (file.size > 30 * 1024 * 1024) return 'Please choose an image smaller than 30 MB for reliable browser processing.';
  return null;
}
