import { categories, tools } from '../data/tools';

const wrap = 'ui-container';
const card = 'ui-card';

export function toolsPage() {
  return { seo: { title: 'All Image Tools | Browser-Based Image Utilities', description: 'Search all free image tools for compression, resizing, cropping, conversion, PDF workflows, privacy cleanup, and creative edits.', path: '/tools' }, html: `<section class="ui-section"><div class="${wrap}"><span class="ui-kicker"><i class="fa-solid fa-toolbox" aria-hidden="true"></i> Complete toolkit</span><h1 class="ui-page-title mt-5">All Image Tools</h1><p class="ui-lead mt-3 max-w-2xl">Find fast image utilities grouped by task. Most implemented tools run directly in your browser.</p><input class="tool-control mt-6" id="tool-search" type="search" placeholder="Search tools, formats, or categories" aria-label="Search image tools"></div></section><section class="pb-14"><div class="${wrap}" id="tools-list">${categories.map((category) => `<div class="mt-10 first:mt-0"><h2 class="ui-section-title mb-5">${category}</h2><div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">${tools.filter((tool) => tool.category === category).map((tool) => toolCard(tool)).join('')}</div></div>`).join('')}</div></section>` };
}

function toolCard(tool: typeof tools[number]) { return `<article class="tool-card ${card} flex min-h-full flex-col gap-3" data-search="${[tool.name, tool.description, tool.category, ...tool.tags].join(' ').toLowerCase()}"><span class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600"><i class="fa-solid ${tool.icon.includes(' ') ? 'fa-image' : tool.icon}" aria-hidden="true"></i></span><h3 class="text-lg font-semibold text-gray-900">${tool.name}</h3><span class="ui-badge text-xs text-gray-600">${tool.category}</span><p class="ui-text">${tool.description}</p><a data-link class="btn btn-secondary mt-auto" href="/${tool.slug}">Open Tool</a></article>`; }

export function bindToolsPage() { const input = document.querySelector('#tool-search') as HTMLInputElement | null; input?.addEventListener('input', () => { const q = input.value.trim().toLowerCase(); document.querySelectorAll<HTMLElement>('.tool-card').forEach((card) => card.classList.toggle('hidden', q.length > 0 && !card.dataset.search?.includes(q))); }); }
