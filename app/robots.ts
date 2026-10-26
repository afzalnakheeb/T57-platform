import { SITE } from '../lib/site';

// Previews stay out of search; production welcomes search and AI crawlers.
export default function robots() {
  if (process.env.VERCEL_ENV !== 'production') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'], allow: '/' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
