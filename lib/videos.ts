import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Investor videos shared by access code at /videos. Private files (the investor pitch) are kept in
// private-videos/<name>.enc, encrypted by scripts/videos-encrypt.mjs, because this repository is public.
// The server decrypts them only for a visitor holding the access-code cookie. Public site films are linked as they are.
//   VIDEO_ACCESS_CODE  the code T57 sends to investors (changing it signs everyone out)
//   VIDEO_KEY          optional, 32 random bytes, base64: decrypts the private files and signs the cookie;
//                      without it both use a key derived from VIDEO_ACCESS_CODE, so use a long code
export type Film = { id: string; title: string; summary: string; length: string; src: string; poster: string; captions?: string; note?: string };

export const FEATURED: Film = {
  id: 'investor-pitch', title: 'The T57 investor pitch', length: '2:48',
  summary: 'The problem, the platform, the five founding markets, the revenue plan and the raise, narrated by our founder.',
  src: '/videos/file/investor-pitch.mp4', poster: '/videos/file/investor-pitch.jpg',
  note: 'Confidential. For qualified investors only. Forecasts and returns are the management base case: illustrative, not a promise.',
};

// The redone site films (English, with captions). They are the same files the site pages use.
export const FILMS: Film[] = [
  { id: 'what-is-t57', title: 'What is T57', length: '0:32', src: '/video/what-is-t57.en.mp4', poster: '/video/what-is-t57.en.jpg', captions: '/video/what-is-t57.en.vtt',
    summary: 'One trade record that everyone works on, in thirty seconds.' },
  { id: 'platform', title: 'The platform', length: '0:32', src: '/video/platform.en.mp4', poster: '/video/platform.en.jpg', captions: '/video/platform.en.vtt',
    summary: 'The layers that connect members, data, AI and partners on one platform.' },
  { id: 'trade-lifecycle', title: 'A trade, start to finish', length: '0:28', src: '/video/trade-lifecycle.en.mp4', poster: '/video/trade-lifecycle.en.jpg', captions: '/video/trade-lifecycle.en.vtt',
    summary: 'Every step of a food trade, from request to payment, on one shared record.' },
  { id: 'markets', title: 'Five markets, both ways', length: '0:22', src: '/video/markets.en.mp4', poster: '/video/markets.en.jpg', captions: '/video/markets.en.vtt',
    summary: 'Five founding markets linked both ways, open online worldwide, growing to 101 markets by 2036.' },
  { id: 'finance-a-trade', title: 'Finance a trade', length: '0:28', src: '/video/finance-a-trade.en.mp4', poster: '/video/finance-a-trade.en.jpg', captions: '/video/finance-a-trade.en.vtt',
    summary: 'Turn a verified trade into finance offers from licensed partners, tracked to settlement.' },
  { id: 'escrow', title: 'Escrow payments', length: '0:28', src: '/video/escrow.en.mp4', poster: '/video/escrow.en.jpg', captions: '/video/escrow.en.vtt',
    summary: 'The buyer pays in, and the seller is paid as each agreed milestone is met.' },
  { id: 'request-to-quote', title: 'Request to quote', length: '0:26', src: '/video/request-to-quote.en.mp4', poster: '/video/request-to-quote.en.jpg', captions: '/video/request-to-quote.en.vtt',
    summary: 'Post one request and compare verified quotes side by side.' },
  { id: 'member-verified', title: 'Every member verified', length: '0:27', src: '/video/member-verified.en.mp4', poster: '/video/member-verified.en.jpg', captions: '/video/member-verified.en.vtt',
    summary: 'Business, people, documents, sanctions and site checks before anyone trades.' },
  { id: 'join-the-club', title: 'Join the club', length: '0:27', src: '/video/join-the-club.en.mp4', poster: '/video/join-the-club.en.jpg', captions: '/video/join-the-club.en.vtt',
    summary: 'Apply, get verified, receive your T57 Passport and post your first request.' },
  { id: 'ai-native', title: 'AI-native, with a person behind it', length: '0:30', src: '/video/ai-native.en.mp4', poster: '/video/ai-native.en.jpg', captions: '/video/ai-native.en.vtt',
    summary: 'How T57 uses AI to match, check and forecast, with a person behind every decision.' },
  { id: 'name-story', title: 'The name T57', length: '0:27', src: '/video/name-story.en.mp4', poster: '/video/name-story.en.jpg', captions: '/video/name-story.en.vtt',
    summary: 'Trade built on trust, five industries and seven outcomes.' },
];

// The only files /videos/file/<name> will serve.
export const PRIVATE_FILES: Record<string, string> = { 'investor-pitch.mp4': 'video/mp4', 'investor-pitch.jpg': 'image/jpeg' };

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
