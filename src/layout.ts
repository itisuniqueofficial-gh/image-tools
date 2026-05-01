import { tools } from './data/tools';

const navLinks = [
  ['/', 'Home'], ['/tools', 'Tools'], ['/image-compressor', 'Compress Image'], ['/image-resizer', 'Resize Image'], ['/image-converter', 'Convert Image'], ['/privacy', 'Privacy'], ['/faq', 'FAQ'], ['/contact', 'Contact'],
];

export function shell(content: string, path: string): string {
  return `${header(path)}<main id="main" class="site-main">${content}</main>${footer()}`;
}

function header(path: string): string {
  const links = navLinks.map(([href, label]) => `<a data-link href="${href}" ${path === href ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="site-header">
    <a class="skip-link" href="#main">Skip to content</a>
    <nav class="nav-wrap" aria-label="Primary navigation">
      <a data-link href="/" class="brand" aria-label="Image Tools home"><span class="brand-icon"><i class="fa-solid fa-image" aria-hidden="true"></i></span><span>Image Tools</span></a>
      <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
      <div class="nav-links">${links}</div>
    </nav>
  </header>`;
}

function footer(): string {
  const toolLinks = tools.slice(0, 6).map((tool) => `<a data-link href="/${tool.slug}"><i class="fa-solid ${tool.icon.includes(' ') ? 'fa-image' : tool.icon}" aria-hidden="true"></i>${tool.shortName}</a>`).join('');
  return `<footer class="footer">
    <div class="footer-grid site-container">
      <section><h2><i class="fa-solid fa-toolbox" aria-hidden="true"></i> Image Tools</h2><p>Free browser-based image utilities for everyday compression, conversion, editing, and privacy tasks.</p></section>
      <section><h2><i class="fa-solid fa-image" aria-hidden="true"></i> Tools</h2>${toolLinks}</section>
      <section><h2><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Resources</h2><a data-link href="/">Home</a><a data-link href="/tools">All Tools</a><a data-link href="/about">About</a><a data-link href="/faq">FAQ</a><a data-link href="/contact">Contact</a><a data-link href="/privacy">Privacy Policy</a><a data-link href="/terms">Terms</a></section>
      <section><h2><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Privacy</h2><p>Most tools process images directly in your browser. Files are not intentionally stored by this website.</p></section>
    </div>
    <div class="footer-bottom site-container">© 2026 Image Tools. All rights reserved.</div>
  </footer>`;
}

export function bindLayout(): void {
  const button = document.querySelector('.menu-toggle') as HTMLButtonElement | null;
  const links = document.querySelector('.nav-links');
  button?.addEventListener('click', () => {
    const open = links?.classList.toggle('open') ?? false;
    button.setAttribute('aria-expanded', String(open));
    button.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}" aria-hidden="true"></i>`;
  });
}
