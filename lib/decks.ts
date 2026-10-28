import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

// Pitch decks shared by access code at /decks. Each deck is a self-contained web player built by
// scripts/decks-build.mjs and kept in decks/<id>.enc, encrypted, because this repository is public.
// The server decrypts a deck only for a visitor holding the access-code cookie.
//   DECK_ACCESS_CODE  the code T57 sends to recipients (changing it signs everyone out)
//   DECK_KEY          32 random bytes, base64: decrypts the decks and signs the cookie
export type Deck = { id: string; lang: 'en' | 'ar'; title: string; label: string; summary: string };

export const DECKS: Deck[] = [
  {
    id: 'ksa', lang: 'en', label: 'English',
    title: 'National Food Trade Infrastructure, Built in the Kingdom',
    summary: 'The Kingdom at the centre of the world’s food: the vision, the platform, the impact and the partnership.',
  },
  {
    id: 'ksa-ar', lang: 'ar', label: 'العربية',
    title: 'البنية التحتية الوطنية لتجارة الغذاء، تُبنى في المملكة',
    summary: 'المملكة في قلب تجارة الغذاء العالمية: الرؤية، والمنصة، والأثر، والشراكة.',
  },
];
export const deckById = (id: string) => DECKS.find((d) => d.id === id);

export const COOKIE = 't57_decks';
const key = () => {
  const k = Buffer.from(process.env.DECK_KEY || '', 'base64');
  return k.length === 32 ? k : null;
};
export const configured = () => Boolean(key() && process.env.DECK_ACCESS_CODE);

// The cookie proves the visitor entered the current code, without holding the code itself.
export const token = () => crypto.createHmac('sha256', key()!).update(`decks:${process.env.DECK_ACCESS_CODE}`).digest('base64url');

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
export const hasAccess = (cookie?: string) => configured() && !!cookie && same(cookie, token());
export const codeMatches = (code: string) => configured() && same(code.trim(), process.env.DECK_ACCESS_CODE!.trim());

// Wrong codes are limited per visitor: 5 tries, then a 15-minute wait. The count lives in this server
// instance's memory, so it slows guessing rather than making it impossible; a long code is the real guard.
const tries = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60 * 1000, MAX = 5;
export function lockedFor(ip: string) {
  const t = tries.get(ip);
  return t && t.n >= MAX && t.until > Date.now() ? Math.ceil((t.until - Date.now()) / 60000) : 0;
}
export function failed(ip: string) {
  const now = Date.now(), t = tries.get(ip);
  const next = !t || t.until < now ? { n: 1, until: now + WINDOW } : { n: t.n + 1, until: t.n + 1 >= MAX ? now + WINDOW : t.until };
  tries.set(ip, next);
  if (tries.size > 5000) tries.forEach((v, k) => { if (v.until < now) tries.delete(k); });
}
export const cleared = (ip: string) => tries.delete(ip);

// File layout (scripts/decks-build.mjs): 12-byte IV, 16-byte GCM tag, then the gzipped page, encrypted.
export function deckHtml(id: string) {
  const buf = fs.readFileSync(path.join(process.cwd(), 'decks', `${id}.enc`));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key()!, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return zlib.gunzipSync(Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()])).toString('utf8');
}
