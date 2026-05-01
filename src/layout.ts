import { tools } from './data/tools';

const navLinks = [
  ['/', 'Home'], ['/tools', 'Tools'], ['/image-compressor', 'Compress Image'], ['/image-resizer', 'Resize Image'], ['/image-converter', 'Convert Image'], ['/privacy', 'Privacy'], ['/faq', 'FAQ'], ['/contact', 'Contact'],
];

export function shell(content: string, path: string): string {
  return `${header(path)}<main id="main" class="w-full">${content}</main>${footer()}`;
}

function header(path: string): string {
  const base = 'inline-flex items-center rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200';
  const active = 'border-indigo-200 bg-indigo-50 text-indigo-700';
  const links = navLinks.map(([href, label]) => `<a data-link href="${href}" class="${base} ${path === href ? active : ''}" ${path === href ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="site-header sticky top-0 z-40 border-b border-gray-200 bg-white">
    <a class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:border focus:border-gray-200 focus:bg-white focus:px-4 focus:py-2" href="#main">Skip to content</a>
    <nav class="navbar header-inner ui-container h-16" aria-label="Primary navigation">
      <a data-link href="/" class="logo brand-link text-lg font-semibold text-gray-900" aria-label="Image Tools home"><span class="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600"><i class="fa-solid fa-image" aria-hidden="true"></i></span><span>Image Tools</span></a>
      <button class="menu-toggle inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 xl:hidden" type="button" aria-label="Open menu" aria-expanded="false"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
      <div class="nav-menu nav-links hidden absolute left-0 right-0 top-20 flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 xl:static xl:flex xl:flex-row xl:flex-wrap xl:items-center xl:justify-end xl:border-0 xl:p-0">${links}</div>
    </nav>
  </header>`;
}

function footer(): string {
  const linkClass = 'flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-700 focus:outline-none focus:text-indigo-700';
  const toolLinks = tools.slice(0, 6).map((tool) => `<a class="${linkClass}" data-link href="/${tool.slug}"><i class="fa-solid ${tool.icon.includes(' ') ? 'fa-image' : tool.icon}" aria-hidden="true"></i>${tool.shortName}</a>`).join('');
  return `<footer class="mt-12 border-t border-gray-200 bg-white py-10 md:py-12">
    <div class="ui-container grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <section class="space-y-3"><h2 class="flex items-center gap-2 text-base font-semibold text-gray-900"><i class="fa-solid fa-toolbox text-indigo-600" aria-hidden="true"></i> Image Tools</h2><p class="text-sm leading-6 text-gray-500">Free browser-based image utilities for everyday compression, conversion, editing, and privacy tasks.</p></section>
      <section class="space-y-3"><h2 class="flex items-center gap-2 text-base font-semibold text-gray-900"><i class="fa-solid fa-image text-indigo-600" aria-hidden="true"></i> Tools</h2><div class="space-y-2">${toolLinks}</div></section>
      <section class="space-y-3"><h2 class="flex items-center gap-2 text-base font-semibold text-gray-900"><i class="fa-solid fa-circle-info text-indigo-600" aria-hidden="true"></i> Resources</h2><div class="space-y-2"><a class="${linkClass}" data-link href="/">Home</a><a class="${linkClass}" data-link href="/tools">All Tools</a><a class="${linkClass}" data-link href="/about">About</a><a class="${linkClass}" data-link href="/faq">FAQ</a><a class="${linkClass}" data-link href="/contact">Contact</a><a class="${linkClass}" data-link href="/privacy">Privacy Policy</a><a class="${linkClass}" data-link href="/terms">Terms</a></div></section>
      <section class="space-y-3"><h2 class="flex items-center gap-2 text-base font-semibold text-gray-900"><i class="fa-solid fa-shield-halved text-indigo-600" aria-hidden="true"></i> Privacy</h2><p class="text-sm leading-6 text-gray-500">Most tools process images directly in your browser. Files are not intentionally stored by this website.</p></section>
    </div>
    <div class="ui-container mt-8 border-t border-gray-200 pt-5 text-sm text-gray-500">© 2026 Image Tools. All rights reserved.</div>
  </footer>`;
}

export function bindLayout(): void {
  const button = document.querySelector('.menu-toggle') as HTMLButtonElement | null;
  const links = document.querySelector('.nav-links');
  button?.addEventListener('click', () => {
    const open = links?.classList.toggle('hidden') === false;
    links?.classList.toggle('flex', open);
    button.setAttribute('aria-expanded', String(open));
    button.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}" aria-hidden="true"></i>`;
  });
}
