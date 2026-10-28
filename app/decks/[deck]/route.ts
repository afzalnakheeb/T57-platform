import { cookies, headers } from 'next/headers';
import { COOKIE, cleared, codeMatches, configured, deckById, deckHtml, failed, hasAccess, lockedFor, token, type Deck } from '../../../lib/decks';

// One pitch deck: the deck itself for a visitor who has entered the access code, else the access-code page.
export const dynamic = 'force-dynamic';
type Ctx = { params: { deck: string } };

const PRIVATE = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'same-origin',
};
const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...PRIVATE } });
const notFound = () => new Response('Not found', { status: 404, headers: PRIVATE });
const visitor = () => (headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

export function GET(_req: Request, { params }: Ctx) {
  const deck = deckById(params.deck);
  if (!deck) return notFound();
  if (hasAccess(cookies().get(COOKIE)?.value)) return html(deckHtml(deck.id));
  return html(gate(deck, configured() ? '' : 'off'));
}

export async function POST(req: Request, { params }: Ctx) {
  const deck = deckById(params.deck);
  if (!deck) return notFound();
  if (!configured()) return html(gate(deck, 'off'), 503);
  const ip = visitor();
  const wait = lockedFor(ip);
  if (wait) return html(gate(deck, 'locked', wait), 429);
  const code = String((await req.formData()).get('code') || '');
  if (!codeMatches(code)) {
    failed(ip);
    await new Promise((r) => setTimeout(r, 700));
    const now = lockedFor(ip);
    return html(gate(deck, now ? 'locked' : 'wrong', now), now ? 429 : 401);
  }
  cleared(ip);
  // One code opens every deck on the page; the cookie lasts a week or until the code changes.
  cookies().set(COOKIE, token(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/decks', maxAge: 7 * 24 * 3600 });
  return new Response(null, { status: 303, headers: { Location: `/decks/${deck.id}`, ...PRIVATE } });
}

const TEXT = {
  en: {
    eyebrow: 'Pitch deck · Private',
    lead: 'This presentation is shared privately. Enter the access code you received from T57 to open it.',
    label: 'Access code', button: 'Open the deck', back: 'All pitch decks',
    wrong: 'That code is not right. Please check it and try again.',
    locked: (m: number) => `Too many attempts. Please try again in ${m} minute${m === 1 ? '' : 's'}.`,
    off: 'Access is not open yet. Please contact T57.',
    help: 'No code? Write to', other: 'Arabic version',
  },
  ar: {
    eyebrow: 'عرض تقديمي · خاص',
    lead: 'هذا العرض مشارَك بشكل خاص. أدخل رمز الدخول الذي وصلك من T57 لفتحه.',
    label: 'رمز الدخول', button: 'افتح العرض', back: 'جميع العروض',
    wrong: 'الرمز غير صحيح. يرجى التحقق منه والمحاولة مرة أخرى.',
    locked: (m: number) => `محاولات كثيرة. يرجى المحاولة بعد ${m} دقيقة.`,
    off: 'الدخول غير متاح بعد. يرجى التواصل مع T57.',
    help: 'ليس لديك رمز؟ راسلنا على', other: 'English version',
  },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function gate(deck: Deck, state: '' | 'wrong' | 'locked' | 'off', minutes = 0) {
  const t = TEXT[deck.lang];
  const ar = deck.lang === 'ar';
  const other = deck.id === 'ksa' ? 'ksa-ar' : 'ksa';
  const msg = state === 'wrong' ? t.wrong : state === 'locked' ? t.locked(minutes) : state === 'off' ? t.off : '';
  const font = ar
    ? 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&family=Noto+Kufi+Arabic:wght@600;700&display=swap'
    : 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
  return `<!doctype html>
<html lang="${deck.lang}" dir="${ar ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b1340">
<title>${esc(ar ? 'T57 · عرض خاص' : 'T57 · Private deck')}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${font}">
<style>
:root{--night:#0b1340;--indigo:#2f2e7d;--imperial:#02246c;--cyan:#39c4c4;--amber:#f8b716;--sapphire:#5b5fef}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%}
body{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;color:#fff;
  font-family:${ar ? "'IBM Plex Sans Arabic','Noto Kufi Arabic'," : ''}Roboto,system-ui,sans-serif;
  background:radial-gradient(circle at 85% 10%,rgba(91,95,239,.45),rgba(91,95,239,0) 55%),radial-gradient(circle at 10% 95%,rgba(0,139,140,.35),rgba(0,139,140,0) 55%),linear-gradient(160deg,var(--indigo),var(--imperial) 55%,var(--night))}
body::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.12;background:
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none' stroke='%23f8b716' stroke-width='1.2'%3E%3Cpolygon points='85.5,85.5 34.5,85.5 34.5,34.5 85.5,34.5'/%3E%3Cpolygon points='60,96 24,60 60,24 96,60'/%3E%3C/g%3E%3C/svg%3E")}
main{position:relative;width:100%;max-width:460px;padding:40px 36px 32px;border-radius:20px;background:rgba(11,19,64,.72);border:1px solid rgba(248,183,22,.4);box-shadow:0 30px 90px rgba(2,10,40,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.logo{display:block;width:150px;height:auto;margin-bottom:28px}
.eyebrow{display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:${ar ? '0' : '.2em'};text-transform:uppercase;color:var(--amber)}
.eyebrow::before{content:"";width:36px;height:2px;background:var(--amber)}
h1{margin:0 0 12px;font-family:${ar ? "'Noto Kufi Arabic'," : ''}Roboto,system-ui,sans-serif;font-size:26px;line-height:1.3;font-weight:700}
p{margin:0;color:rgba(255,255,255,.82);font-size:16px;line-height:1.6}
form{margin-top:28px;display:grid;gap:10px}
label{font-size:14px;font-weight:500;color:rgba(255,255,255,.85)}
input{width:100%;height:56px;padding:0 18px;border-radius:10px;border:1.5px solid rgba(255,255,255,.28);background:rgba(255,255,255,.06);color:#fff;font:600 22px/1 Roboto,system-ui,sans-serif;letter-spacing:.3em;text-align:center;direction:ltr}
input:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px rgba(248,183,22,.25)}
button{height:52px;margin-top:6px;border:0;border-radius:10px;background:var(--amber);color:var(--indigo);font:700 16px/1 inherit;font-family:inherit;cursor:pointer;transition:background .15s}
button:hover{background:#ffc93d}
button:focus-visible{outline:2px solid #fff;outline-offset:3px}
.msg{margin-top:4px;padding:10px 14px;border-radius:8px;background:rgba(212,88,68,.16);border:1px solid rgba(212,88,68,.6);color:#ffd9d2;font-size:14px;line-height:1.5}
.lock{display:inline-flex;vertical-align:-3px;margin-inline-end:8px;color:var(--cyan)}
.foot{margin-top:24px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;font-size:14px}
a{color:var(--cyan);text-decoration:none}
a:hover{text-decoration:underline}
.help{margin-top:20px;font-size:13px;color:rgba(255,255,255,.6)}
.conf{margin-top:28px;font-size:12px;letter-spacing:.08em;color:rgba(255,255,255,.5);text-align:center}
</style>
</head>
<body>
<main>
<img class="logo" src="/img/t57-logo-light.png" alt="T57" width="150" height="37">
<p class="eyebrow">${esc(t.eyebrow)}</p>
<h1>${esc(deck.title)}</h1>
<p>${esc(t.lead)}</p>
<form method="post" action="/decks/${deck.id}">
<label for="code"><span class="lock"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>${esc(t.label)}</label>
<input id="code" name="code" type="password" inputmode="numeric" autocomplete="one-time-code" required autofocus maxlength="64"${state === 'off' ? ' disabled' : ''}>
${msg ? `<div class="msg" role="alert">${esc(msg)}</div>` : ''}
<button type="submit"${state === 'off' ? ' disabled' : ''}>${esc(t.button)}</button>
</form>
<div class="foot"><a href="/decks">${ar ? '→' : '←'} ${esc(t.back)}</a><a href="/decks/${other}" lang="${ar ? 'en' : 'ar'}">${esc(t.other)}</a></div>
<p class="help">${esc(t.help)} <a href="mailto:afzal@t57.ai">afzal@t57.ai</a></p>
</main>
<p class="conf">${ar ? 'T57 · خاص وسري' : 'T57 · STRICTLY PRIVATE AND CONFIDENTIAL'}</p>
</body>
</html>`;
}
