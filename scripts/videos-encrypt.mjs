// Encrypts one private video (or its poster) for private-videos/, because this repository is public.
//
//   VIDEO_KEY=<base64 32 bytes> node scripts/videos-encrypt.mjs <input file> <name, e.g. investor-pitch.mp4>
//
// The output is private-videos/<name>.enc: a 16-byte IV, then the file under AES-256-CTR with VIDEO_KEY.
// CTR lets app/videos/file/[name]/route.ts decrypt any byte range, so the video streams and seeks.
import fs from 'node:fs';
import crypto from 'node:crypto';

const [input, name] = process.argv.slice(2);
const key = Buffer.from(process.env.VIDEO_KEY || '', 'base64');
if (!input || !name || key.length !== 32) {
  console.error('usage: VIDEO_KEY=<base64 32 bytes> node scripts/videos-encrypt.mjs <input file> <name>');
  process.exit(1);
}
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
const body = Buffer.concat([cipher.update(fs.readFileSync(input)), cipher.final()]);
fs.mkdirSync(new URL('../private-videos/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL(`../private-videos/${name}.enc`, import.meta.url), Buffer.concat([iv, body]));
console.log(`private-videos/${name}.enc: ${(body.length / 1048576).toFixed(1)} MB`);
