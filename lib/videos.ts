import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Investor videos shared by access code at /videos. Private files (the investor pitch) are kept in
// private-videos/<name>.enc, encrypted by scripts/videos-encrypt.mjs, because this repository is public.
// The server decrypts them only for a visitor holding the access-code cookie. Public site films are linked as they are.
//   VIDEO_ACCESS_CODE  the code T57 sends to investors (changing it signs everyone out)
//   VIDEO_KEY          32 random bytes, base64: decrypts the private files and signs the cookie
export type Film = { id: string; title: string; summary: string; length: string; src: string; poster: string; note?: string };

export const FEATURED: Film = {
  id: 'investor-pitch', title: 'The T57 investor pitch', length: '2:48',
  summary: 'The problem, the platform, the five founding markets, the revenue plan and the raise, narrated by our founder.',
  src: '/videos/file/investor-pitch.mp4', poster: '/videos/file/investor-pitch.jpg',
  note: 'Confidential. For qualified investors only. Forecasts and returns are the management base case: illustrative, not a promise.',
};

export const FILMS: Film[] = [
  { id: 'brand-film', title: 'Why T57', length: '1:01', src: '/video/brand-film.mp4', poster: '/video/brand-film.jpg',
    summary: 'Why food trade breaks, and how one verified trade record fixes it.' },
  { id: 'platform', title: 'The platform', length: '0:41', src: '/video/platform.mp4', poster: '/video/platform.jpg',
    summary: 'The layers that connect members, data, AI and partners on one platform.' },
  { id: 'markets', title: 'Five markets, both ways', length: '0:40', src: '/video/markets.mp4', poster: '/video/markets.jpg',
    summary: 'Five founding markets linked both ways, open online worldwide, growing to 101 markets by 2036.' },
  { id: 'finance-a-trade', title: 'Finance a trade', length: '0:36', src: '/video/finance-a-trade.mp4', poster: '/video/finance-a-trade.jpg',
    summary: 'Turn a verified trade into finance offers from licensed partners, tracked to settlement.' },
  { id: 'ai-native', title: 'AI-native, with a person behind it', length: '0:40', src: '/video/ai-native.mp4', poster: '/video/ai-native.jpg',
    summary: 'How T57 uses AI to match, check and forecast, with a person behind every decision.' },
  { id: 'name-story', title: 'The name T57', length: '0:28', src: '/video/name-story.mp4', poster: '/video/name-story.jpg',
    summary: 'Trade built on trust, five industries and seven outcomes.' },
];

// The only files /videos/file/<name> will serve.
export const PRIVATE_FILES: Record<string, string> = { 'investor-pitch.mp4': 'video/mp4', 'investor-pitch.jpg': 'image/jpeg' };

export const COOKIE = 't57_videos';
const key = () => {
  const k = Buffer.from(process.env.VIDEO_KEY || '', 'base64');
  return k.length === 32 ? k : null;
};
export const configured = () => Boolean(key() && process.env.VIDEO_ACCESS_CODE);

// The cookie proves the visitor entered the current code, without holding the code itself.
export const token = () => crypto.createHmac('sha256', key()!).update(`videos:${process.env.VIDEO_ACCESS_CODE}`).digest('base64url');

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
