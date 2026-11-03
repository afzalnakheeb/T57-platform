/** @type {import('next').NextConfig} */
const week = 'public, max-age=604800, stale-while-revalidate=86400';
module.exports = {
  experimental: {
    // The encrypted pitch decks and investor videos are read at request time by their routes.
    outputFileTracingIncludes: { '/decks/[deck]': ['./decks/*.enc'], '/videos/file/[name]': ['./private-videos/*.enc'] },
  },
  // Photos, films and fonts change rarely, so browsers keep them for a week.
  async headers() {
    return ['/img/:path*', '/video/:path*', '/fonts/:path*'].map(source => ({ source, headers: [{ key: 'Cache-Control', value: week }] }));
  },
  // Addresses people guess, sent to the page that answers them.
  async redirects() {
    return [
      { source: '/who-we-serve/banks', destination: '/who-we-serve/financiers', permanent: false },
      { source: '/:lang(ar|ms|tr|hi)/who-we-serve/banks', destination: '/:lang/who-we-serve/financiers', permanent: false },
    ];
  },
};
