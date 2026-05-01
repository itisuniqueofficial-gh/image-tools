import { escapeHtml, formatBytes } from '../utils/format';

export function setStatus(root: ParentNode, message: string, error = false) {
  const status = root.querySelector<HTMLElement>('[data-status]');
  if (status) { status.textContent = message; status.style.color = error ? '#b91c1c' : '#3154be'; }
}

export function setPreview(root: ParentNode, blob: Blob) {
  const preview = root.querySelector<HTMLElement>('[data-preview]');
  if (!preview) return '';
  const old = preview.dataset.url;
  if (old) URL.revokeObjectURL(old);
  const url = URL.createObjectURL(blob);
  preview.dataset.url = url;
  preview.innerHTML = `<img class="max-h-full max-w-full object-contain" src="${url}" alt="Processed image preview">`;
  return url;
}

export function fileInfo(file: File) { return `${escapeHtml(file.name)} · ${formatBytes(file.size)}`; }

export function setStats(root: ParentNode, stats: [string, string][]) {
  const el = root.querySelector<HTMLElement>('[data-stats]');
  if (el) el.innerHTML = stats.map(([label, value]) => `<div class="result-box"><strong class="block text-gray-900">${value}</strong><span class="text-sm text-gray-500">${label}</span></div>`).join('');
}
