import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Pages built by prototype/build.py, one per sitemap v7 route.
export type Faq = { q: string; a: string };
// A T57 Insights article (prototype/blog.py): its author, publication date and cover image.
export type Post = { author: string; role: string; date: string; topic: string; image: string; minutes: number };
export type PageInfo = {
  route: string; section: string; name: string; h1: string; answer: string;
  title: string; description: string; faqs: Faq[]; parent?: string; post?: Post;
};

// The live address: t57.ai redirects to www.t57.ai in Vercel, so canonical links use www.
export const SITE = 'https://www.t57.ai';
const OG = { url: `${SITE}/og.png`, width: 1200, height: 630, alt: 'T57: trade food with trust, from farm to buyer.' };
const dir = path.join(process.cwd(), 'content');
// English is the default at the root; each other language lives under /<lang> with its own built pages
// (prototype/build.py writes content/<lang>/ for every page that is fully translated).
export type Lang = 'en' | 'ar' | 'ms' | 'tr' | 'hi';
export const LANGS: Lang[] = ['en', 'ar', 'ms', 'tr', 'hi'];
const base = (lang: Lang) => (lang === 'en' ? dir : path.join(dir, lang));
const load = (lang: Lang): Record<string, PageInfo> => JSON.parse(fs.readFileSync(path.join(base(lang), 'pages.json'), 'utf8'));
export const pagesIn: Record<Lang, Record<string, PageInfo>> = { en: load('en'), ar: load('ar'), ms: load('ms'), tr: load('tr'), hi: load('hi') };
export const pages = pagesIn.en;
const routes = (lang: Lang) => Object.fromEntries(Object.entries(pagesIn[lang]).map(([id, p]) => [p.route, id]));
export const byRouteIn: Record<Lang, Record<string, string>> = { en: routes('en'), ar: routes('ar'), ms: routes('ms'), tr: routes('tr'), hi: routes('hi') };
export const byRoute = byRouteIn.en;
export const markup = (id: string, lang: Lang = 'en') => fs.readFileSync(path.join(base(lang), 'pages', `${id}.html`), 'utf8');
// Changes whenever the site script changes, so browsers never run an old copy.
export const assetVersion = crypto.createHash('sha1').update(fs.readFileSync(path.join(process.cwd(), 'public', 'proto', 'worlds.js'))).digest('hex').slice(0, 10);
// The same for the T57 AI assistant's script and its stylesheet.
export const assistantVersion = crypto.createHash('sha1').update(['assistant.js', 'assistant.css'].map((f) => fs.readFileSync(path.join(process.cwd(), 'public', 'assistant', f), 'utf8')).join('')).digest('hex').slice(0, 10);
// The header and footer. Each link in the language switch points at this page in that language when it exists,
// otherwise at that language's home page.
export function chrome(part: 'top' | 'bottom', lang: Lang = 'en', id?: string) {
  const html = fs.readFileSync(path.join(base(lang), `chrome-${part}.html`), 'utf8');
  if (part !== 'top' || !id) return html;
  return html.replace(/(<a class="lang-sw" href=")[^"]*(" hreflang="([a-z]+)")/g, (m, a, b, l: Lang) => {
    const alt = pagesIn[l]?.[id];
    return alt ? `${a}${alt.route}${b}` : m;
  });
}
export const dirOf = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr');

export function metadataFor(id: string, lang: Lang = 'en') {
  const p = pagesIn[lang][id];
  const url = `${SITE}${p.route}`;
  const languages: Record<string, string> = {};
  for (const l of LANGS) if (pagesIn[l][id]) languages[l] = `${SITE}${pagesIn[l][id].route}`;
  if (Object.keys(languages).length > 1) languages['x-default'] = `${SITE}${pages[id].route}`;
  const a = p.post;
  const og = a ? { url: `${SITE}${a.image}`, width: 1200, alt: p.name } : OG;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url, ...(languages['x-default'] ? { languages } : {}) },
    openGraph: a
      ? { title: p.title, description: p.description, url, siteName: 'T57.ai', type: 'article' as const, publishedTime: a.date, authors: [a.author], section: a.topic, images: [og] }
      : { title: p.title, description: p.description, url, siteName: 'T57.ai', type: 'website' as const, images: [og], locale: lang === 'ar' ? 'ar_SA' : lang === 'ms' ? 'ms_MY' : lang === 'tr' ? 'tr_TR' : lang === 'hi' ? 'hi_IN' : 'en_US' },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: [og.url] },
  };
}

// Structured data for search, answer and generative engines: the organization,
// the page and its place in the site, and its questions and answers.
export function jsonLd(id: string, lang: Lang = 'en') {
  const p = pagesIn[lang][id];
  const url = `${SITE}${p.route}`;
  // The trail follows the English site structure; each step is shown in this language when it is translated.
  const shown = (cid: string) => pagesIn[lang][cid] || pages[cid];
  // Home, then each level of the route that is a built page (e.g. Home > Why T57 > RFQ Bidding).
  // A page whose group does not sit in its route (e.g. Escrow under Trust & Payments) names its parent.
  const trail = (cid: string): { name: string; url: string }[] => {
    const q = pages[cid];
    const step = (c: string) => ({ name: shown(c).name, url: `${SITE}${shown(c).route}` });
    if (q.parent) return [...trail(q.parent), step(cid)];
    const parts = q.route.split('/').filter(Boolean);
    return parts.map((_, k) => '/' + parts.slice(0, k + 1).join('/')).filter(r => byRoute[r]).map(r => step(byRoute[r]));
  };
  const crumbs = [{ name: shown('home').name, url: `${SITE}${shown('home').route}` }, ...(id === 'home' ? [] : trail(id))];
  const graph: object[] = [
    {
      '@type': 'Organization', '@id': `${SITE}/#org`, name: 'T57', alternateName: ['T57.ai', 'تي 57'], url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png`, width: 512, height: 512 },
      email: 'hello@t57.ai', telephone: '+966569712222',
      areaServed: 'Worldwide',
      // A Saudi initiative: started in Madinah, headquarters moving to Riyadh (city only, no street address).
      foundingLocation: { '@type': 'Place', name: 'Madinah, Saudi Arabia' },
      address: { '@type': 'PostalAddress', addressLocality: 'Riyadh', addressCountry: 'SA' },
      founder: { '@type': 'Person', name: 'Afzal Hussain Mohammed Nakheeb', jobTitle: 'Founder and Chairman', url: `${SITE}/about/leadership`, sameAs: ['https://www.linkedin.com/in/afzalhussain/', 'https://afzalnakheeb.com'] },
      knowsAbout: ['digital food trade', 'agri trade finance', 'food security', 'halal food trade', 'trade documentation'],
      description: 'T57 is an AI-native digital trade platform for food. Started in Madinah, Saudi Arabia, it puts verified farmers, processors, traders, buyers, banks and logistics firms on one trade record, from quote to payment. T57 does not lend, hold funds or own goods; finance, escrow and insurance come through licensed partners.',
    },
    { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'T57', alternateName: 'T57.ai', url: SITE, inLanguage: LANGS, publisher: { '@id': `${SITE}/#org` } },
    {
      '@type': 'WebPage', '@id': `${url}#page`, url, name: p.title, description: p.description, inLanguage: lang,
      isPartOf: { '@id': `${SITE}/#site` },
      about: { '@id': `${SITE}/#org` },
      abstract: p.answer,
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero .std'] },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
    },
  ];
  if (p.post) {
    const a = p.post;
    graph.push({
      '@type': 'BlogPosting', '@id': `${url}#article`, mainEntityOfPage: { '@id': `${url}#page` },
      headline: p.h1, description: p.description, abstract: p.answer, image: { '@type': 'ImageObject', url: `${SITE}${a.image}` },
      datePublished: a.date, dateModified: a.date, articleSection: a.topic, timeRequired: `PT${a.minutes}M`, inLanguage: lang,
      author: { '@type': 'Person', name: a.author, jobTitle: a.role, url: `${SITE}/about/leadership`, worksFor: { '@id': `${SITE}/#org` } },
      publisher: { '@id': `${SITE}/#org` },
      isPartOf: { '@type': 'Blog', '@id': `${SITE}/resources/blog#blog`, name: 'T57 Insights', url: `${SITE}/resources/blog` },
    });
  }
  if (p.faqs.length) {
    graph.push({
      '@type': 'FAQPage', '@id': `${url}#faq`,
      mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
