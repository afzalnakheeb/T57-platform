// Builds one self-contained web player for a T57 slide deck, then encrypts it for decks/.
//
//   node scripts/decks-build.mjs <deck folder> <deck id> <assets folder> [--plain out.html]
//
// <deck folder> holds project/deck.json and project/slides/<id>.html, as downloaded from the deck
// (the slide format: one <section> per slide on a 1920×1080 canvas, inline styles only).
// <assets folder> holds the images the slides name: project/ds/... paths, and _blob/<id>.<ext> files.
// The output is decks/<deck id>.enc: the player page, AES-256-GCM encrypted with DECK_KEY
// (base64, 32 bytes), so the deck never sits in this public repository in readable form.
// app/decks/[deck]/route.ts decrypts it only for a visitor who has entered the access code.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [src, id, assetsDir, ...rest] = process.argv.slice(2);
if (!src || !id || !assetsDir) {
  console.error('usage: node scripts/decks-build.mjs <deck folder> <deck id> <assets folder> [--plain out.html]');
  process.exit(1);
}
const plainOut = rest[0] === '--plain' ? rest[1] : null;

const deck = JSON.parse(fs.readFileSync(path.join(src, 'project', 'deck.json'), 'utf8'));
const rtl = /[؀-ۿ]/.test(deck.title);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Images: each distinct file is stored once, as a data URI the player puts back into every <img> that names it.
const assets = {};
const mime = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
function asset(ref) {
  let file = ref.startsWith('/_blob/') ? null : path.join(assetsDir, ref);
  if (!file) {
    const blob = ref.slice('/_blob/'.length);
    const dir = path.join(assetsDir, '_blob');
    const hit = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => f.startsWith(blob + '.'));
    if (!hit) throw new Error(`missing image ${ref}`);
    file = path.join(dir, hit);
  }
  if (!fs.existsSync(file)) throw new Error(`missing image ${ref}`);
  const data = fs.readFileSync(file);
  const key = crypto.createHash('sha1').update(data).digest('hex').slice(0, 12);
  assets[key] ||= `data:${mime[path.extname(file).toLowerCase()]};base64,${data.toString('base64')}`;
  return key;
}

const slides = deck.order.map((sid) => {
  let html = fs.readFileSync(path.join(src, 'project', 'slides', `${sid}.html`), 'utf8').trim();
  html = html.replace(/<aside>[\s\S]*?<\/aside>/g, ''); // speaker notes stay with the presenter
  // A live embed becomes a sandboxed frame whose page loads when its slide is shown.
  html = html.replace(/<x-embed([^>]*)>([\s\S]*?)<\/x-embed>/g, (_, attrs, page) =>
    `<iframe class="x-embed" sandbox="allow-scripts" title="" tabindex="-1" data-page="${esc(page.trim())}"${attrs}></iframe>`);
  html = html.replace(/<img([^>]*?)\ssrc="([^"]+)"/g, (_, before, ref) => `<img${before} data-asset="${asset(ref)}"`);
  return html;
});

const fonts = Object.values(deck.faces || {}).map((f) => f.href).filter(Boolean);
const title = deck.title;
const page = fs.readFileSync(new URL('./decks-player.html', import.meta.url), 'utf8')
  .replace('{{LANG}}', rtl ? 'ar' : 'en')
  .replace('{{DIR}}', rtl ? 'rtl' : 'ltr')
  .replace('{{TITLE}}', esc(title))
  .replace('{{FONTS}}', fonts.map((h) => `<link rel="stylesheet" href="${esc(h)}">`).join('\n'))
  .replace('{{SLIDES}}', () => slides.join('\n'))
  .replace('{{ASSETS}}', () => JSON.stringify(assets).replace(/</g, '\\u003c'));

if (plainOut) fs.writeFileSync(plainOut, page);

const key = Buffer.from(process.env.DECK_KEY || '', 'base64');
if (key.length !== 32) {
  if (plainOut) process.exit(0);
  console.error('DECK_KEY must be 32 bytes, base64');
  process.exit(1);
}
// File layout: 12-byte IV, 16-byte GCM tag, then the ciphertext of the gzipped page.
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const body = Buffer.concat([cipher.update(await gzip(Buffer.from(page))), cipher.final()]);
fs.mkdirSync(new URL('../decks/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL(`../decks/${id}.enc`, import.meta.url), Buffer.concat([iv, cipher.getAuthTag(), body]));
console.log(`decks/${id}.enc: ${slides.length} slides, ${Object.keys(assets).length} images, ${(page.length / 1024).toFixed(0)} KB`);

async function gzip(buf) {
  const zlib = await import('node:zlib');
  return zlib.gzipSync(buf, { level: 9 });
}
