// Encrypts one private video (or its poster) for private-videos/, because this repository is public.
//
//   VIDEO_KEY=<base64 32 bytes> node scripts/videos-encrypt.mjs <input file> <name, e.g. investor-pitch.mp4>
//   VIDEO_ACCESS_CODE=<code> node scripts/videos-encrypt.mjs ...   (key derived from the code, as lib/videos.ts does)
//
// The output is private-videos/<name>.enc: a 16-byte IV, then the file under AES-256-CTR with VIDEO_KEY.
// CTR lets app/videos/file/[name]/route.ts decrypt any byte range, so the video streams and seeks.
import fs from 'node:fs';
import crypto from 'node:crypto';

const [input, name] = process.argv.slice(2);
const code = (process.env.VIDEO_ACCESS_CODE || '').trim();
const key = process.env.VIDEO_KEY
  ? Buffer.from(process.env.VIDEO_KEY, 'base64')
  : code ? crypto.scryptSync(code, 't57-investor-videos-v1', 32, { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }) : Buffer.alloc(0);
if (!input || !name || key.length !== 32) {
  console.error('usage: VIDEO_KEY=<base64 32 bytes> (or VIDEO_ACCESS_CODE=<code>) node scripts/videos-encrypt.mjs <input file> <name>');
  process.exit(1);
}
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
const body = Buffer.concat([cipher.update(fs.readFileSync(input)), cipher.final()]);
fs.mkdirSync(new URL('../private-videos/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL(`../private-videos/${name}.enc`, import.meta.url), Buffer.concat([iv, body]));
console.log(`private-videos/${name}.enc: ${(body.length / 1048576).toFixed(1)} MB`);
