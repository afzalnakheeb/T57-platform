import { SITE } from '../lib/site';

// Previews stay out of search; production welcomes search and AI crawlers.
export default function robots() {
  if (process.env.VERCEL_ENV !== 'production') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [
      // Search and AI crawlers are all welcome. The private investor videos page is kept out of search by its own
      // noindex, so it is not named here.
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
