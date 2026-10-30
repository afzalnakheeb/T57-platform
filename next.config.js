/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    // The encrypted pitch decks and investor videos are read at request time by their routes.
    outputFileTracingIncludes: { '/decks/[deck]': ['./decks/*.enc'], '/videos/file/[name]': ['./private-videos/*.enc'] },
  },
};
