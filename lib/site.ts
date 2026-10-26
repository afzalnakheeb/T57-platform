import fs from 'node:fs';
import path from 'node:path';

// Pages built by prototype/build.py, one per sitemap v7 route.
export type Faq = { q: string; a: string };
export type PageInfo = {
  route: string; section: string; name: string; h1: string; answer: string;
  title: string; description: string; faqs: Faq[];
};

export const SITE = 'https://t57.ai';
const dir = path.join(process.cwd(), 'content');
export const pages: Record<string, PageInfo> = JSON.parse(fs.readFileSync(path.join(dir, 'pages.json'), 'utf8'));
export const byRoute: Record<string, string> = Object.fromEntries(Object.entries(pages).map(([id, p]) => [p.route, id]));
export const markup = (id: string) => fs.readFileSync(path.join(dir, 'pages', `${id}.html`), 'utf8');
export const chrome = (part: 'top' | 'bottom') => fs.readFileSync(path.join(dir, `chrome-${part}.html`), 'utf8');

export function metadataFor(id: string) {
  const p = pages[id];
  const url = `${SITE}${p.route}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description: p.description, url, siteName: 'T57.ai', type: 'website' },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description },
  };
}

// Structured data for search, answer and generative engines: the organization,
// the page and its place in the site, and its questions and answers.
export function jsonLd(id: string) {
  const p = pages[id];
  const url = `${SITE}${p.route}`;
  // Home, then each level of the route that is a built page (e.g. Home > Why T57 > RFQ Bidding)
  const crumbs = [{ name: 'Home', url: SITE + '/' }];
  const parts = p.route.split('/').filter(Boolean);
  parts.forEach((_, k) => {
    const r = '/' + parts.slice(0, k + 1).join('/'), cid = byRoute[r];
    if (cid) crumbs.push({ name: pages[cid].name, url: `${SITE}${r}` });
  });
  const graph: object[] = [
    {
      '@type': 'Organization', '@id': `${SITE}/#org`, name: 'T57.ai', url: SITE, logo: `${SITE}/icon-512.png`,
      email: 'hello@t57.ai',
      description: 'AI-native digital trade platform for food. T57 connects verified producers, buyers, banks and logistics on one trade record. Finance, escrow and insurance come from licensed partners.',
    },
    {
      '@type': 'WebPage', '@id': `${url}#page`, url, name: p.title, description: p.description,
      isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'T57.ai', url: SITE, publisher: { '@id': `${SITE}/#org` } },
      about: { '@id': `${SITE}/#org` },
      abstract: p.answer,
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero .std'] },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
    },
  ];
  if (p.faqs.length) {
    graph.push({
      '@type': 'FAQPage', '@id': `${url}#faq`,
      mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
