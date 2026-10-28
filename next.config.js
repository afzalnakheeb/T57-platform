/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    // The encrypted pitch decks are read at request time by app/decks/[deck]/route.ts.
    outputFileTracingIncludes: { '/decks/[deck]': ['./decks/*.enc'] },
  },
};
