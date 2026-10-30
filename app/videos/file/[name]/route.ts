import { cookies } from 'next/headers';
import { COOKIE, PRIVATE_FILES, fileSize, hasAccess, readRange } from '../../../../lib/videos';

// One private video file, decrypted for a visitor who has entered the access code at /videos.
// Answers byte ranges so the player can stream and seek; each answer is capped to stay under the
// function response limit, and the player asks for the next range on its own.
export const dynamic = 'force-dynamic';
type Ctx = { params: { name: string } };

const PRIVATE = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'same-origin' };
const CHUNK = 3 * 1024 * 1024;

export function GET(req: Request, { params }: Ctx) {
  const type = PRIVATE_FILES[params.name];
  if (!type || !hasAccess(cookies().get(COOKIE)?.value)) return new Response('Not found', { status: 404, headers: PRIVATE });
  const size = fileSize(params.name);
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
  if (!m && size <= CHUNK) {
    return new Response(readRange(params.name, 0, size - 1), { headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes', ...PRIVATE } });
  }
  let start = 0, end = size - 1;
  if (m && m[1]) { start = Number(m[1]); if (m[2]) end = Math.min(Number(m[2]), size - 1); }
  else if (m && m[2]) start = Math.max(0, size - Number(m[2]));
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, ...PRIVATE } });
  }
  end = Math.min(end, start + CHUNK - 1);
  return new Response(readRange(params.name, start, end), {
    status: 206,
    headers: { 'Content-Type': type, 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', ...PRIVATE },
  });
}
