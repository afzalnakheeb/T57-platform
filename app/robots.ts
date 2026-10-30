import { SITE } from '../lib/site';

// Previews stay out of search; production welcomes search and AI crawlers.
export default function robots() {
  if (process.env.VERCEL_ENV !== 'production') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [
      // The investor videos page is private: crawlers stay out, and the page also says noindex.
      { userAgent: '*', allow: '/', disallow: '/videos' },
      { userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'], allow: '/', disallow: '/videos' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
