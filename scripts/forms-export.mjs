// Exports website form submissions from the private Vercel Blob store to a CSV file.
// Run with the store token in the environment (vercel env pull, then):
//   node scripts/forms-export.mjs [kind] > submissions.csv
// kind is optional: join, demo, partner, contact, support or subscribe.
import { list, get } from '@vercel/blob';

const kind = process.argv[2] || '';
const rows = [];
let cursor;
do {
  const page = await list({ prefix: `forms/${kind}`, cursor });
  for (const b of page.blobs) {
    const r = await get(b.pathname, { access: 'private' });
    rows.push(JSON.parse(await new Response(r.stream).text()));
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
console.log(cols.map(cell).join(','));
for (const r of rows.sort((a, b) => a.at.localeCompare(b.at))) console.log(cols.map((c) => cell(r[c])).join(','));
console.error(`${rows.length} submission(s)`);
