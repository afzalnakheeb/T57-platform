// Packs one hand-built HTML deck (a single page with img/ and vo/ files beside it) for a deck folder.
//
//   DECK_KEY=<folder key> node scripts/decks-pack.mjs <page.html> <deck id> <folder id>
//
// Images are put into the page as data URIs. Narration files (data-vo="vo/NN.mp3") are encrypted one by
// one into public/video/<folder>/<deck id>-NN.enc (16-byte counter, then AES-256-CTR, as for films), and
// the page fetches and decrypts them in the browser with the folder key, which it holds only once served
// to a visitor with access. The page itself becomes decks/<deck id>.enc (same layout as decks-build.mjs).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const [file, id, folder] = process.argv.slice(2);
if (!file || !id || !folder) {
  console.error('usage: DECK_KEY=<folder key> node scripts/decks-pack.mjs <page.html> <deck id> <folder id>');
  process.exit(1);
}
const key = Buffer.from(process.env.DECK_KEY || '', 'base64');
if (key.length !== 32) { console.error('DECK_KEY must be 32 bytes, base64'); process.exit(1); }

const dir = path.dirname(file);
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
let html = fs.readFileSync(file, 'utf8');

// Images, wherever the page names them: attributes and script strings alike.
const uris = {};
html = html.replace(/(["'])(img\/[^"']+)\1/g, (_, q, ref) => {
  uris[ref] ||= `data:${mime[path.extname(ref).toLowerCase()]};base64,${fs.readFileSync(path.join(dir, ref)).toString('base64')}`;
  return q + uris[ref] + q;
});

// Narration, encrypted for the browser.
const out = path.join('public', 'video', folder);
fs.mkdirSync(out, { recursive: true });
const voice = {};
for (const [, ref] of html.matchAll(/data-vo="(vo\/[^"]+)"/g)) {
  if (voice[ref]) continue;
  const name = `${id}-${path.basename(ref, path.extname(ref))}.enc`;
  const iv = crypto.randomBytes(16);
  const c = crypto.createCipheriv('aes-256-ctr', key, iv);
  fs.writeFileSync(path.join(out, name), Buffer.concat([iv, c.update(fs.readFileSync(path.join(dir, ref))), c.final()]));
  voice[ref] = `/video/${folder}/${name}`;
}
const loader = `<script>(async()=>{
const map=${JSON.stringify(voice)};
const k=await crypto.subtle.importKey('raw',Uint8Array.from(atob(${JSON.stringify(key.toString('base64'))}),c=>c.charCodeAt(0)),'AES-CTR',false,['decrypt']);
await Promise.all(Object.entries(map).map(async([ref,src])=>{try{
const buf=await (await fetch(src)).arrayBuffer();
const mp3=await crypto.subtle.decrypt({name:'AES-CTR',counter:new Uint8Array(buf,0,16),length:128},k,new Uint8Array(buf,16));
const url=URL.createObjectURL(new Blob([mp3],{type:'audio/mpeg'}));
document.querySelectorAll('[data-vo="'+ref+'"]').forEach(s=>s.dataset.vo=url);
}catch(e){}}));
})()</script>`;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${html.replace(/^<meta charset="utf-8">\n?/, '')}
${loader}
</body>
</html>`;

const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const body = Buffer.concat([cipher.update(zlib.gzipSync(Buffer.from(page), { level: 9 })), cipher.final()]);
fs.mkdirSync('decks', { recursive: true });
fs.writeFileSync(path.join('decks', `${id}.enc`), Buffer.concat([iv, cipher.getAuthTag(), body]));
console.log(`decks/${id}.enc: ${Object.keys(uris).length} images, ${Object.keys(voice).length} narration files, ${(page.length / 1024).toFixed(0)} KB page`);
