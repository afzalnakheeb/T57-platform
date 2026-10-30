import { SITE, pagesIn } from '../lib/site';

export default function sitemap() {
  return [...Object.values(pagesIn.en), ...Object.values(pagesIn.ar), ...Object.values(pagesIn.ms)].map((p) => ({
    url: `${SITE}${p.route}`,
    changeFrequency: 'monthly' as const,
    priority: p.route === '/' || p.route === '/ar' || p.route === '/ms' ? 1 : p.route.split('/').length === 2 ? 0.9 : 0.8,
  }));
}
