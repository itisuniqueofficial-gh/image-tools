import { escapeHtml } from './format';

const baseUrl = 'https://image.itisuniqueofficial.com';

export type SeoData = {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function setSeo(data: SeoData): void {
  document.title = data.title;
  const canonical = `${baseUrl}${data.path === '/' ? '' : data.path}`;
  setMeta('description', data.description);
  setMeta('og:title', data.title, 'property');
  setMeta('og:description', data.description, 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('og:url', canonical, 'property');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', data.title);
  setMeta('twitter:description', data.description);
  setLink('canonical', canonical);
  document.querySelectorAll('script[data-json-ld]').forEach((node) => node.remove());
  if (data.jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.jsonLd = 'true';
    script.textContent = JSON.stringify(data.jsonLd);
    document.head.append(script);
  }
}

function setMeta(name: string, content: string, attr = 'name'): void {
  let meta = document.head.querySelector(`meta[${attr}="${escapeHtml(name)}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, name);
    document.head.append(meta);
  }
  meta.content = content;
}

function setLink(rel: string, href: string): void {
  let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.append(link);
  }
  link.href = href;
}

export function websiteSchema() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Image Tools', url: baseUrl, potentialAction: { '@type': 'SearchAction', target: `${baseUrl}/tools?q={search_term_string}`, 'query-input': 'required name=search_term_string' } };
}

export function appSchema(name: string, description: string, path: string) {
  return { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name, description, url: `${baseUrl}${path}`, applicationCategory: 'MultimediaApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) };
}
