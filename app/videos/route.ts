import { cookies, headers } from 'next/headers';
import { cleared, failed, lockedFor } from '../../lib/decks';
import { SITE } from '../../lib/site';
import { COOKIE, FEATURED, FILMS, codeMatches, configured, hasAccess, pitchReady, token, type Film } from '../../lib/videos';

// Investor videos: the film library for a visitor who has entered the access code, else the access-code page.
// Not linked from the site and kept out of search; the private files are served by ./file/[name]/route.ts.
export const dynamic = 'force-dynamic';

const PRIVATE = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'same-origin',
};
const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...PRIVATE } });
const visitor = () => (headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

export function GET() {
  if (hasAccess(cookies().get(COOKIE)?.value)) return html(page(library()));
  return html(page(gate(configured() ? '' : 'off')));
}

export async function POST(req: Request) {
  if (!configured()) return html(page(gate('off')), 503);
  // Wrong codes share the per-visitor limit of the pitch decks: 5 tries, then a 15-minute wait.
  const ip = visitor();
  const wait = lockedFor(ip);
  if (wait) return html(page(gate('locked', wait)), 429);
  const code = String((await req.formData()).get('code') || '');
  if (!codeMatches(code)) {
    failed(ip);
    await new Promise((r) => setTimeout(r, 700));
    const now = lockedFor(ip);
    return html(page(gate(now ? 'locked' : 'wrong', now)), now ? 429 : 401);
  }
  cleared(ip);
  // The cookie lasts a week or until the code changes.
  cookies().set(COOKIE, token(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/videos', maxAge: 7 * 24 * 3600 });
  return new Response(null, { status: 303, headers: { Location: '/videos', ...PRIVATE } });
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lock = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

function gate(state: '' | 'wrong' | 'locked' | 'off', minutes = 0) {
  const msg = state === 'wrong' ? 'That code is not right. Please check it and try again.'
    : state === 'locked' ? `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
    : state === 'off' ? 'Access is not open yet. Please contact T57.' : '';
  const off = state === 'off' ? ' disabled' : '';
  return `<main class="gate">
<img class="logo" src="/img/t57-logo-light.png" alt="T57" width="150" height="37">
<p class="eyebrow">Investor videos · Private</p>
<h1>Watch T57 in under three minutes</h1>
<p>These films are shared privately with investors. Enter the access code you received from T57 to watch them.</p>
<form method="post" action="/videos">
<label for="code"><span class="lock">${lock}</span>Access code</label>
<input id="code" name="code" type="password" inputmode="numeric" autocomplete="one-time-code" required autofocus maxlength="64"${off}>
${msg ? `<div class="msg" role="alert">${esc(msg)}</div>` : ''}
<button type="submit"${off}>Watch the videos</button>
</form>
<p class="help">No code? Write to <a href="mailto:afzal@t57.ai">afzal@t57.ai</a></p>
</main>
<p class="conf">T57 · STRICTLY PRIVATE AND CONFIDENTIAL</p>`;
}

// The message T57 sends with the link. The access code is left out on purpose: it goes separately,
// so a forwarded message alone does not open the page.
const SHARE_TEXT = (pitch: boolean) => `T57 is building the AI-native trade system for food: one verified record from farm to buyer, with licensed finance partners, starting in five markets.\n\n${pitch ? 'Our three-minute investor pitch and short films are here.' : 'Our short investor films are here.'} The page is private; I will send you the access code separately.`;
const SHARE_URL = `${SITE}/videos`;
const SHARE_SUBJECT = 'T57 investor pitch: private videos';

function share(pitch: boolean) {
  const msg = `${SHARE_TEXT(pitch)}\n\n${SHARE_URL}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  const mail = `mailto:?subject=${encodeURIComponent(SHARE_SUBJECT)}&body=${encodeURIComponent(msg)}`;
  return `<section class="share" aria-labelledby="share-h">
<div><h2 id="share-h">Share with an investor</h2><p>Sends the link with a short introduction. Send the access code separately.</p></div>
<div class="share-btns">
<a class="sb wa" href="${wa}" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>WhatsApp</a>
<a class="sb" href="${mail}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>Email</a>
<button class="sb" type="button" id="copy"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span>Copy link and message</span></button>
</div>
<script>(()=>{const b=document.getElementById('copy'),t=b.querySelector('span'),m=${JSON.stringify(msg).replace(/</g, '\\u003c')};
b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(m)}catch(e){const a=document.createElement('textarea');a.value=m;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}
t.textContent='Copied. Paste it anywhere';setTimeout(()=>t.textContent='Copy link and message',2500)})})()</script>
</section>`;
}

const card = (f: Film) => `<article class="film">
<video controls playsinline preload="none" poster="${f.poster}" aria-label="${esc(f.title)}"><source src="${f.src}" type="video/mp4">${f.captions ? `<track kind="captions" src="${f.captions}" srclang="en" label="English" default>` : ''}</video>
<div class="meta"><h3>${esc(f.title)}</h3><span class="len">${f.length}</span></div>
<p>${esc(f.summary)}</p>
</article>`;

function library() {
  const f = FEATURED;
  const pitch = pitchReady();
  return `<header class="top"><a href="/" aria-label="T57 home"><img src="/img/t57-logo-light.png" alt="T57" width="120" height="30"></a><span class="tag">${lock} Private · Investors only</span></header>
<main class="lib">
<p class="eyebrow">Investor videos</p>
<h1>T57, in our own words</h1>
<p class="lede">${pitch ? 'Start with the investor pitch. The short films below show the platform, the markets and how a trade runs, is paid and is financed.' : 'Short films on the platform, the markets and how a trade runs, is paid and is financed. The investor pitch will be added here soon.'}</p>
${pitch ? `<section class="featured" aria-labelledby="pitch">
<video controls playsinline preload="metadata" poster="${f.poster}" controlslist="nodownload" oncontextmenu="return false"><source src="${f.src}" type="video/mp4"></video>
<div class="about">
<span class="badge">Investor pitch · ${f.length}</span>
<h2 id="pitch">${esc(f.title)}</h2>
<p>${esc(f.summary)}</p>
<p class="note">${esc(f.note!)}</p>
<a class="cta" href="mailto:afzal@t57.ai?subject=T57%20investor%20pitch">Talk to the founder</a>
</div>
</section>` : ''}
${share(pitch)}
<h2 class="more">More films</h2>
<div class="grid">${FILMS.map(card).join('\n')}</div>
<p class="foot">Questions? Write to <a href="mailto:afzal@t57.ai">afzal@t57.ai</a> or call <a href="tel:+966569712222">+966 56 971 22 22</a>.</p>
</main>
<p class="conf">T57 · STRICTLY PRIVATE AND CONFIDENTIAL · Please do not share this page or its code.</p>
<script>document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>document.querySelectorAll('video').forEach(o=>{if(o!==v)o.pause()})))</script>`;
}

function page(body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b1340">
<title>T57 · Investor videos</title>
<meta name="description" content="T57's three-minute investor pitch and short films. Private: access code required.">
<meta property="og:type" content="website">
<meta property="og:url" content="${SHARE_URL}">
<meta property="og:title" content="T57 · Investor videos">
<meta property="og:description" content="Our three-minute investor pitch and short films. Private: access code required.">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
<style>
:root{--night:#0b1340;--indigo:#2f2e7d;--imperial:#02246c;--cyan:#39c4c4;--amber:#f8b716;--sapphire:#5b5fef}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%}
html{background:var(--night)}
body{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:32px 16px;color:#fff;font-family:Roboto,system-ui,sans-serif;
  background:radial-gradient(circle at 85% 10%,rgba(91,95,239,.45),rgba(91,95,239,0) 55%),radial-gradient(circle at 10% 95%,rgba(0,139,140,.35),rgba(0,139,140,0) 55%),linear-gradient(160deg,var(--indigo),var(--imperial) 55%,var(--night))}
body::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.12;background:
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none' stroke='%23f8b716' stroke-width='1.2'%3E%3Cpolygon points='85.5,85.5 34.5,85.5 34.5,34.5 85.5,34.5'/%3E%3Cpolygon points='60,96 24,60 60,24 96,60'/%3E%3C/g%3E%3C/svg%3E")}
a{color:var(--cyan);text-decoration:none}
a:hover{text-decoration:underline}
.eyebrow{display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--amber)}
.eyebrow::before{content:"";width:36px;height:2px;background:var(--amber)}
p{margin:0;color:rgba(255,255,255,.82);font-size:16px;line-height:1.6}
.lock{display:inline-flex;vertical-align:-3px;margin-inline-end:8px;color:var(--cyan)}
.conf{position:relative;margin-top:28px;font-size:12px;letter-spacing:.08em;color:rgba(255,255,255,.5);text-align:center}
/* Access-code page */
.gate{position:relative;width:100%;max-width:460px;margin-block:auto;padding:40px 36px 32px;border-radius:20px;background:rgba(11,19,64,.72);border:1px solid rgba(248,183,22,.4);box-shadow:0 30px 90px rgba(2,10,40,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.gate .logo{display:block;width:150px;height:auto;margin-bottom:28px}
.gate h1{margin:0 0 12px;font-size:26px;line-height:1.3;font-weight:700}
form{margin-top:28px;display:grid;gap:10px}
label{font-size:14px;font-weight:500;color:rgba(255,255,255,.85)}
input{width:100%;height:56px;padding:0 18px;border-radius:10px;border:1.5px solid rgba(255,255,255,.28);background:rgba(255,255,255,.06);color:#fff;font:600 22px/1 Roboto,system-ui,sans-serif;letter-spacing:.3em;text-align:center}
input:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px rgba(248,183,22,.25)}
button,.cta{height:52px;margin-top:6px;border:0;border-radius:10px;background:var(--amber);color:var(--indigo);font:700 16px/1 Roboto,system-ui,sans-serif;cursor:pointer;transition:background .15s}
button:hover,.cta:hover{background:#ffc93d;text-decoration:none}
button:focus-visible,.cta:focus-visible{outline:2px solid #fff;outline-offset:3px}
.msg{margin-top:4px;padding:10px 14px;border-radius:8px;background:rgba(212,88,68,.16);border:1px solid rgba(212,88,68,.6);color:#ffd9d2;font-size:14px;line-height:1.5}
.help{margin-top:20px;font-size:13px;color:rgba(255,255,255,.6)}
/* Library */
.top{position:relative;width:100%;max-width:1200px;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:clamp(32px,6vw,64px)}
.top img{display:block;width:120px;height:auto}
.tag{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;border:1px solid rgba(248,183,22,.5);font-size:13px;font-weight:500;color:rgba(255,255,255,.85)}
.tag svg{color:var(--amber)}
.lib{position:relative;width:100%;max-width:1200px}
.lib h1{margin:0 0 12px;font-size:clamp(32px,5vw,52px);line-height:1.1;letter-spacing:-.02em;font-weight:700}
.lede{max-width:640px}
.featured{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:clamp(20px,3vw,36px);align-items:center;margin-top:40px;padding:clamp(16px,2vw,24px);border-radius:20px;background:rgba(11,19,64,.6);border:1px solid rgba(248,183,22,.4);box-shadow:0 30px 90px rgba(2,10,40,.45)}
video{display:block;width:100%;aspect-ratio:16/9;border-radius:12px;background:#0b1340;object-fit:cover}
.badge{display:inline-flex;padding:4px 12px;border-radius:999px;background:var(--amber);color:var(--indigo);font-size:13px;font-weight:700;letter-spacing:.04em}
.about h2{margin:14px 0 10px;font-size:clamp(24px,2.6vw,32px);line-height:1.2}
.about .note{margin-top:14px;font-size:13px;line-height:1.5;color:rgba(255,255,255,.6)}
.cta{display:inline-flex;align-items:center;padding:0 22px;margin-top:20px}
.more{margin:clamp(48px,7vw,80px) 0 20px;font-size:24px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:24px}
.film{padding:14px 14px 20px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);transition:border-color .2s}
.film:hover{border-color:rgba(248,183,22,.7)}
.film .meta{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:14px 4px 6px}
.film h3{margin:0;font-size:18px;line-height:1.3}
.film .len{flex:none;font-size:13px;color:var(--cyan)}
.film p{margin:0 4px;font-size:15px;line-height:1.55;color:rgba(255,255,255,.75)}
.share{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;margin-top:24px;padding:22px 24px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16)}
.share h2{margin:0 0 4px;font-size:20px}
.share p{font-size:14px;color:rgba(255,255,255,.7)}
.share-btns{display:flex;flex-wrap:wrap;gap:10px}
.sb{display:inline-flex;align-items:center;gap:8px;height:44px;margin:0;padding:0 18px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font:500 15px/1 Roboto,system-ui,sans-serif;cursor:pointer;text-decoration:none}
.sb:hover{background:rgba(255,255,255,.16);border-color:#fff;text-decoration:none}
.sb.wa{background:#25d366;border-color:#25d366;color:#0b1340}
.sb.wa:hover{background:#3be37a}
.foot{margin-top:48px;font-size:14px;color:rgba(255,255,255,.65)}
@media (max-width:820px){.featured{grid-template-columns:1fr}.tag{font-size:12px}}
</style>
</head>
<body>
${body}
</body>
</html>`;
}
