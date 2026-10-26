import { SITE, pages } from '../lib/site';

export default function sitemap() {
  return Object.values(pages).map((p) => ({
    url: `${SITE}${p.route}`,
    changeFrequency: 'monthly' as const,
    priority: p.route === '/' ? 1 : p.route === '/who-we-serve' ? 0.9 : 0.8,
  }));
}
