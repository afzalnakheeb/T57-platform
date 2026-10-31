import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

// Deck folders: a set of decks and films on /decks/<folder>, opened with the folder's own PIN instead of
// the general deck access code. A share link can carry the PIN (/decks/<folder>?pin=…), so the recipient
// opens the folder in one click; the PIN is then moved into a cookie and dropped from the address bar.
// The files sit encrypted in this public repository and are decrypted with the folder's key:
//   <pinEnv>  the folder PIN (changing it signs everyone out and changes the share link)
//   <keyEnv>  32 random bytes, base64: decrypts the folder's files and signs its cookie
// Decks are built with scripts/decks-build.mjs (DECK_KEY set to the folder key) into decks/<id>.enc.
// Films are encrypted as public/video/<folder>/<id>.enc (16-byte counter, then AES-256-CTR) and
// decrypted by the visitor's browser with the key, which the page hands only to a visitor with access.
export type FolderItem =
  | { kind: 'deck'; id: string; title: string; summary: string; meta: string }
  | { kind: 'film'; id: string; title: string; summary: string; meta: string; src: string };
export type Folder = { id: string; title: string; summary: string; eyebrow: string; pinEnv: string; keyEnv: string; items: FolderItem[] };

export const FOLDERS: Folder[] = [
  {
    id: 'africa', eyebrow: 'Folder · Africa',
    title: 'The Africa Programme',
    summary: 'How T57 helps Africa feed itself and connect to the world: the programme deck and a short film.',
    pinEnv: 'DECK_AFRICA_PIN', keyEnv: 'DECK_AFRICA_KEY',
    items: [
      { kind: 'deck', id: 'africa-deck', title: 'Africa feeds Africa, then feeds the world',
        summary: 'The USD 150M Africa Programme: how it works, the pilot in three to five countries, scale to all 54, the link to the world, budgets, returns and governance.',
        meta: '27 slides plus appendix' },
      { kind: 'film', id: 'africa-film', title: 'Africa can feed itself', src: '/video/africa/africa-film.enc',
        summary: 'A 97-second film on how T57 can help Africa end hunger and build food security, from pilot to continent to the world.',
        meta: '1:37 · English' },
    ],
  },
];
export const folderById = (id: string) => FOLDERS.find((f) => f.id === id);
export const itemById = (id: string) => {
  for (const f of FOLDERS) for (const i of f.items) if (i.id === id) return { folder: f, item: i };
  return null;
};

const keyOf = (f: Folder) => {
  const k = Buffer.from(process.env[f.keyEnv] || '', 'base64');
  return k.length === 32 ? k : null;
};
const pinOf = (f: Folder) => (process.env[f.pinEnv] || '').trim();
export const folderReady = (f: Folder) => Boolean(keyOf(f) && pinOf(f));
export const folderKey = (f: Folder) => keyOf(f)!.toString('base64');
export const folderPin = (f: Folder) => pinOf(f);

export const folderCookie = (f: Folder) => `t57_folder_${f.id}`;
export const folderToken = (f: Folder) => crypto.createHmac('sha256', keyOf(f)!).update(`folder:${f.id}:${pinOf(f)}`).digest('base64url');

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
export const folderAccess = (f: Folder, cookie?: string) => folderReady(f) && !!cookie && same(cookie, folderToken(f));
export const pinMatches = (f: Folder, pin: string) => folderReady(f) && same(pin.trim(), pinOf(f));

// Same file layout as lib/decks.ts: 12-byte IV, 16-byte GCM tag, then the gzipped page, encrypted.
export function folderDeckHtml(f: Folder, id: string) {
  const buf = fs.readFileSync(path.join(process.cwd(), 'decks', `${id}.enc`));
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyOf(f)!, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return zlib.gunzipSync(Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()])).toString('utf8');
}
