import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Pages built by prototype/build.py, one per sitemap v7 route.
export type Faq = { q: string; a: string };
export type PageInfo = {
  route: string; section: string; name: string; h1: string; answer: string;
  title: string; description: string; faqs: Faq[]; parent?: string;
};

// The live address: t57.ai redirects to www.t57.ai in Vercel, so canonical links use www.
export const SITE = 'https://www.t57.ai';
const OG = { url: `${SITE}/og.png`, width: 1200, height: 630, alt: 'T57: trade food with trust, from farm to buyer.' };
const dir = path.join(process.cwd(), 'content');
export const pages: Record<string, PageInfo> = JSON.parse(fs.readFileSync(path.join(dir, 'pages.json'), 'utf8'));
export const byRoute: Record<string, string> = Object.fromEntries(Object.entries(pages).map(([id, p]) => [p.route, id]));
export const markup = (id: string) => fs.readFileSync(path.join(dir, 'pages', `${id}.html`), 'utf8');
// Changes whenever the site script changes, so browsers never run an old copy.
export const assetVersion = crypto.createHash('sha1').update(fs.readFileSync(path.join(process.cwd(), 'public', 'proto', 'worlds.js'))).digest('hex').slice(0, 10);
export const chrome = (part: 'top' | 'bottom') => fs.readFileSync(path.join(dir, `chrome-${part}.html`), 'utf8');

export function metadataFor(id: string) {
  const p = pages[id];
  const url = `${SITE}${p.route}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description: p.description, url, siteName: 'T57.ai', type: 'website', images: [OG] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: [OG.url] },
  };
}

// Structured data for search, answer and generative engines: the organization,
// the page and its place in the site, and its questions and answers.
export function jsonLd(id: string) {
  const p = pages[id];
  const url = `${SITE}${p.route}`;
  // Home, then each level of the route that is a built page (e.g. Home > Why T57 > RFQ Bidding).
  // A page whose group does not sit in its route (e.g. Escrow under Trust & Payments) names its parent.
  const trail = (cid: string): { name: string; url: string }[] => {
    const q = pages[cid];
    if (q.parent) return [...trail(q.parent), { name: q.name, url: `${SITE}${q.route}` }];
    const parts = q.route.split('/').filter(Boolean);
    return parts.map((_, k) => '/' + parts.slice(0, k + 1).join('/')).filter(r => byRoute[r]).map(r => ({ name: pages[byRoute[r]].name, url: `${SITE}${r}` }));
  };
  const crumbs = [{ name: 'Home', url: SITE + '/' }, ...(id === 'home' ? [] : trail(id))];
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
