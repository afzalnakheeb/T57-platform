import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Investor videos shared by access code at /videos. The pitch is encrypted by scripts/videos-encrypt.mjs,
// because this repository is public, and served as a plain static file (public/video/pitch/investor-pitch.enc);
// the page hands its key only to a visitor holding the access-code cookie, and the browser decrypts it.
// That plays on every browser and lets the visitor save the MP4. The poster is served by app/videos/file/[name].
//   VIDEO_ACCESS_CODE  the code T57 sends to investors (changing it signs everyone out)
//   VIDEO_KEY          optional, 32 random bytes, base64: decrypts the private files and signs the cookie;
//                      without it both use a key derived from VIDEO_ACCESS_CODE, so use a long code
export type Film = { id: string; title: string; summary: string; length: string; src: string; poster: string; captions?: string; note?: string };

export const FEATURED: Film = {
  id: 'investor-pitch', title: 'The T57 investor pitch', length: '2:48',
  summary: 'The problem, the platform, the five founding markets, the revenue plan and the raise, narrated by our founder.',
  src: '/video/pitch/investor-pitch.enc', poster: '/videos/file/investor-pitch.jpg',
  note: 'Confidential. For qualified investors only. Forecasts and returns are the management base case: illustrative, not a promise.',
};

// Afzal (30 Oct): the page shows the investor pitch only. Add films here to list them under it.
export const FILMS: Film[] = [];

// The only files /videos/file/<name> will serve.
export const PRIVATE_FILES: Record<string, string> = { 'investor-pitch.jpg': 'image/jpeg' };

export const COOKIE = 't57_videos';
// The pitch key comes from VIDEO_KEY when set, else from the access code itself through scrypt, which is
// slow on purpose: the encrypted file sits in a public repository, so the code is the only lock on it.
const SALT = 't57-investor-videos-v1';
let derived: { code: string; key: Buffer } | null = null;
const key = () => {
  const k = Buffer.from(process.env.VIDEO_KEY || '', 'base64');
  if (k.length === 32) return k;
  const code = (process.env.VIDEO_ACCESS_CODE || '').trim();
  if (!code) return null;
  if (derived?.code !== code) derived = { code, key: codeKey(code) };
  return derived.key;
};
export const codeKey = (code: string) => crypto.scryptSync(code, SALT, 32, { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });
// The key the browser needs to decrypt the pitch; only ever sent to a visitor with access.
export const pitchKey = () => key()!.toString('base64');
export const configured = () => Boolean(process.env.VIDEO_ACCESS_CODE);
// Only the file route bundles private-videos/, so this must not look for the files on disk.
export const pitchReady = () => Boolean(key());

// The cookie proves the visitor entered the current code, without holding the code itself.
const signer = () => key()!;
export const token = () => crypto.createHmac('sha256', signer()).update(`videos:${process.env.VIDEO_ACCESS_CODE}`).digest('base64url');

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
export const hasAccess = (cookie?: string) => configured() && !!cookie && same(cookie, token());
export const codeMatches = (code: string) => configured() && same(code.trim(), process.env.VIDEO_ACCESS_CODE!.trim());

// File layout (scripts/videos-encrypt.mjs): 16-byte IV, then the file under AES-256-CTR.
const file = (name: string) => path.join(process.cwd(), 'private-videos', `${name}.enc`);
export const fileSize = (name: string) => fs.statSync(file(name)).size - 16;

// Decrypts bytes start..end (inclusive). CTR advances the counter once per 16-byte block, so a range
// starts from the IV plus the block number and drops the bytes before `start` inside that block.
export function readRange(name: string, start: number, end: number) {
  const fd = fs.openSync(file(name), 'r');
  try {
    const iv = Buffer.alloc(16);
    fs.readSync(fd, iv, 0, 16, 0);
    const block = Math.floor(start / 16), skip = start % 16;
    const counter = Buffer.from(iv);
    let carry = block;
    for (let i = 15; i >= 0 && carry > 0; i--) {
      const sum = counter[i] + (carry % 256);
      counter[i] = sum & 255;
      carry = Math.floor(carry / 256) + (sum >> 8);
    }
    const buf = Buffer.alloc(end - block * 16 + 1);
    fs.readSync(fd, buf, 0, buf.length, 16 + block * 16);
    const decipher = crypto.createDecipheriv('aes-256-ctr', key()!, counter);
    return Buffer.concat([decipher.update(buf), decipher.final()]).subarray(skip);
  } finally {
    fs.closeSync(fd);
  }
}
