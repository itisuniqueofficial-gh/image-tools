import { shell, bindLayout } from './layout';
import { setSeo } from './utils/seo';
import { homePage } from './pages/home';
import { toolsPage, bindToolsPage } from './pages/tools';
import { aboutPage, contactPage, faqPage, notFoundPage, privacyPage, termsPage } from './pages/static';
import { getTool } from './data/tools';
import { toolPage } from './pages/toolPage';
import { bindCompressor, bindConverter, bindCropper, bindEnhancer, bindMetadataRemover, bindResizer, bindRotator, bindWatermark } from './tools/basicImageTools';
import { bindImageToPdf } from './tools/imageToPdf';
import { bindPdfToImage } from './tools/pdfToImage';

export function renderRoute(): void {
  const app = document.querySelector('#app')!;
  const path = normalize(location.pathname);
  const page = resolve(path);
  setSeo(page.seo);
  app.innerHTML = shell(page.html, path);
  bindLayout();
  bindPage(path);
}

function resolve(path: string) {
  if (path === '/') return homePage();
  if (path === '/tools') return toolsPage();
  if (path === '/about') return aboutPage();
  if (path === '/faq') return faqPage();
  if (path === '/contact') return contactPage();
  if (path === '/privacy') return privacyPage();
  if (path === '/terms') return termsPage();
  const slug = path.slice(1); if (getTool(slug)) return toolPage(slug)!;
  return notFoundPage();
}

function bindPage(path: string) {
  const slug = path.slice(1);
  if (path === '/tools') bindToolsPage();
  if (slug === 'image-compressor') bindCompressor();
  if (slug === 'image-resizer') bindResizer();
  if (slug === 'image-cropper') bindCropper();
  if (slug === 'image-converter') bindConverter();
  if (slug === 'jpg-to-png') bindConverter('image/png', ['image/jpeg']);
  if (slug === 'png-to-jpg') bindConverter('image/jpeg', ['image/png']);
  if (slug === 'webp-converter') bindConverter('image/webp');
  if (slug === 'image-enhancer') bindEnhancer();
  if (slug === 'image-rotator') bindRotator();
  if (slug === 'image-watermark') bindWatermark();
  if (slug === 'metadata-remover') bindMetadataRemover();
  if (slug === 'image-to-pdf') bindImageToPdf();
  if (slug === 'pdf-to-image') bindPdfToImage();
}

function normalize(path: string) { return path.length > 1 ? path.replace(/\/$/, '') : path; }
