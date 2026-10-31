import { cookies, headers } from 'next/headers';
import { cleared, failed, lockedFor } from './decks';
import { SITE } from './site';
import {
  folderAccess, folderCookie, folderDeckHtml, folderKey, folderPin, folderReady, folderToken, pinMatches,
  type Folder, type FolderItem,
} from './folders';

// The pages of a deck folder (see lib/folders.ts), served by app/decks/[deck]/route.ts:
// /decks/<folder> is the PIN page or the folder itself, /decks/<item> one deck or film inside it.
const PRIVATE = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'same-origin',
};
const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...PRIVATE } });
const go = (to: string) => new Response(null, { status: 303, headers: { Location: to, ...PRIVATE } });
const visitor = () => (headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const has = (f: Folder) => folderAccess(f, cookies().get(folderCookie(f))?.value);

// Opens the folder for a week, or until its PIN changes.
function grant(f: Folder) {
  cookies().set(folderCookie(f), folderToken(f), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/decks', maxAge: 7 * 24 * 3600 });
}

// A wrong PIN, from the form or a link, counts toward the same per-visitor limit as the deck codes.
async function tryPin(f: Folder, pin: string) {
  if (!folderReady(f)) return html(gate(f, 'off'), 503);
  const ip = visitor();
  const wait = lockedFor(ip);
  if (wait) return html(gate(f, 'locked', wait), 429);
  if (!pinMatches(f, pin)) {
    failed(ip);
    await new Promise((r) => setTimeout(r, 700));
    const now = lockedFor(ip);
    return html(gate(f, now ? 'locked' : 'wrong', now), now ? 429 : 401);
  }
  cleared(ip);
  grant(f);
  return go(`/decks/${f.id}`);
}

export async function folderGET(req: Request, f: Folder) {
  const pin = new URL(req.url).searchParams.get('pin');
  if (pin !== null) return tryPin(f, pin);
  if (!folderReady(f)) return html(gate(f, 'off'));
  return html(has(f) ? folderPage(f) : gate(f, ''));
}

export async function folderPOST(req: Request, f: Folder) {
  return tryPin(f, String((await req.formData()).get('pin') || ''));
}

export function itemGET(f: Folder, item: FolderItem) {
  if (!folderReady(f) || !has(f)) return go(`/decks/${f.id}`);
  if (item.kind === 'deck') return html(folderDeckHtml(f, item.id));
  return html(filmPage(f, item));
}

const FONT = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
const CSS = `
:root{--night:#0b1340;--indigo:#2f2e7d;--imperial:#02246c;--cyan:#39c4c4;--amber:#f8b716;--copper:#d45844;--sapphire:#5b5fef}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%}
body{min-height:100vh;color:#fff;font-family:Roboto,system-ui,sans-serif;padding:32px 16px 48px;
  background:radial-gradient(circle at 85% 8%,rgba(91,95,239,.45),rgba(91,95,239,0) 55%),radial-gradient(circle at 8% 95%,rgba(212,88,68,.28),rgba(212,88,68,0) 55%),linear-gradient(160deg,var(--indigo),var(--imperial) 55%,var(--night))}
body::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.12;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cg fill='none' stroke='%23f8b716' stroke-width='1.2'%3E%3Cpath d='M0 14L12 2L24 14L36 2L48 14L60 2L72 14L84 2L96 14'/%3E%3Cpath d='M48 28L68 48L48 68L28 48Z'/%3E%3Cpath d='M0 82L12 94L24 82L36 94L48 82L60 94L72 82L84 94L96 82'/%3E%3C/g%3E%3C/svg%3E")}
body::after{content:"";position:fixed;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,var(--copper),var(--amber) 30%,var(--cyan) 70%,rgba(57,196,196,.15))}
.logo{display:block;width:150px;height:auto;margin-bottom:28px}
.eyebrow{display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--amber)}
.eyebrow::before{content:"";width:36px;height:2px;background:var(--amber)}
h1{margin:0 0 12px;font-size:clamp(26px,4vw,40px);line-height:1.2;font-weight:700}
p{margin:0;color:rgba(255,255,255,.82);font-size:16px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}
.conf{margin-top:28px;font-size:12px;letter-spacing:.08em;color:rgba(255,255,255,.5);text-align:center}
.gate{position:relative;max-width:460px;margin:8vh auto 0;padding:40px 36px 32px;border-radius:20px;background:rgba(11,19,64,.72);border:1px solid rgba(248,183,22,.4);box-shadow:0 30px 90px rgba(2,10,40,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.gate h1{font-size:26px}
form{margin-top:28px;display:grid;gap:10px}
label{font-size:14px;font-weight:500;color:rgba(255,255,255,.85)}
input{width:100%;height:56px;padding:0 18px;border-radius:10px;border:1.5px solid rgba(255,255,255,.28);background:rgba(255,255,255,.06);color:#fff;font:600 24px/1 Roboto,system-ui,sans-serif;letter-spacing:.4em;text-align:center}
input:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px rgba(248,183,22,.25)}
button,.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 20px;border:0;border-radius:10px;background:var(--amber);color:var(--indigo);font:700 15px/1 Roboto,system-ui,sans-serif;cursor:pointer;text-decoration:none}
button:hover,.btn:hover{background:#ffc93d;text-decoration:none}
.btn.ghost{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.22)}
.btn.ghost:hover{background:rgba(255,255,255,.14)}
.msg{margin-top:4px;padding:10px 14px;border-radius:8px;background:rgba(212,88,68,.16);border:1px solid rgba(212,88,68,.6);color:#ffd9d2;font-size:14px;line-height:1.5}
.lock{display:inline-flex;vertical-align:-3px;margin-inline-end:8px;color:var(--cyan)}
.help{margin-top:20px;font-size:13px;color:rgba(255,255,255,.6)}
.wrap{position:relative;max-width:1080px;margin:0 auto}
.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:40px;flex-wrap:wrap}
.top .logo{margin:0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:24px;margin-top:36px}
.card{display:flex;flex-direction:column;gap:12px;padding:30px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(12px);color:#fff;text-decoration:none;transition:border-color .2s,transform .2s,background .2s}
.card:hover{border-color:var(--amber);background:rgba(255,255,255,.09);transform:translateY(-3px);text-decoration:none}
.tag{display:inline-flex;align-self:flex-start;padding:4px 12px;border-radius:999px;background:var(--amber);color:var(--indigo);font:700 12px/20px Roboto,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.tag.film{background:var(--cyan)}
.card h2{margin:0;font-size:22px;line-height:1.3}
.card .meta{font-size:14px;color:rgba(255,255,255,.6)}
.card .open{margin-top:auto;padding-top:8px;color:var(--cyan);font-weight:500;font-size:15px}
.share{margin-top:40px;padding:28px 30px;border-radius:16px;background:rgba(248,183,22,.08);border:1px solid rgba(248,183,22,.45)}
.share h2{margin:0 0 6px;font-size:20px}
.linkrow{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.linkrow code{flex:1 1 320px;min-width:0;overflow-wrap:anywhere;padding:13px 16px;border-radius:10px;background:rgba(11,19,64,.6);border:1px solid rgba(255,255,255,.18);font:500 15px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#fff}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.player{position:relative;margin-top:28px;border-radius:14px;overflow:hidden;border:1px solid rgba(248,183,22,.35);box-shadow:0 30px 80px rgba(0,0,0,.45);background:#000;aspect-ratio:16/9}
.player video{display:block;width:100%;height:100%}
.loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:linear-gradient(160deg,var(--indigo),var(--night));text-align:center;padding:16px}
.loading[hidden]{display:none}
.spin{width:44px;height:44px;border-radius:50%;border:4px solid rgba(255,255,255,.18);border-top-color:var(--amber);animation:s 1s linear infinite}
.loading.err .spin{display:none}
@keyframes s{to{transform:rotate(360deg)}}
.back{display:inline-block;margin-top:28px;font-size:15px}
`;

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b1340">
<title>${esc(title)}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${FONT}">
<style>${CSS}</style>
</head>
<body>
${body}
<p class="conf">T57 · STRICTLY PRIVATE AND CONFIDENTIAL</p>
</body>
</html>`;
}

const LOCK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

function gate(f: Folder, state: '' | 'wrong' | 'locked' | 'off', minutes = 0) {
  const msg = state === 'wrong' ? 'That PIN is not right. Please check it and try again.'
    : state === 'locked' ? `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
    : state === 'off' ? 'This folder is not open yet. Please contact T57.' : '';
  const off = state === 'off' ? ' disabled' : '';
  return shell('T57 · Private folder', `<main class="gate">
<img class="logo" src="/img/t57-logo-light.png" alt="T57" width="150" height="37">
<p class="eyebrow">${esc(f.eyebrow)} · Private</p>
<h1>${esc(f.title)}</h1>
<p>This folder is shared privately. Enter the PIN you received from T57 to open it.</p>
<form method="post" action="/decks/${f.id}">
<label for="pin"><span class="lock">${LOCK}</span>Folder PIN</label>
<input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="one-time-code" required autofocus maxlength="32"${off}>
${msg ? `<div class="msg" role="alert">${esc(msg)}</div>` : ''}
<button type="submit"${off}>Open the folder</button>
</form>
<p class="help"><a href="/decks">← All pitch decks</a> · No PIN? Write to <a href="mailto:afzal@t57.ai">afzal@t57.ai</a></p>
</main>`);
}

function folderPage(f: Folder) {
  const link = `${SITE}/decks/${f.id}?pin=${encodeURIComponent(folderPin(f))}`;
  const msg = `${f.title}, from T57: ${f.summary}\n\nThis private link opens the folder directly:\n${link}`;
  const cards = f.items.map((i) => `<a class="card" href="/decks/${i.id}">
<span class="tag${i.kind === 'film' ? ' film' : ''}">${i.kind === 'film' ? 'Film' : 'Pitch deck'}</span>
<h2>${esc(i.title)}</h2>
<p>${esc(i.summary)}</p>
<span class="meta">${esc(i.meta)}</span>
<span class="open">${i.kind === 'film' ? 'Watch the film →' : 'Open the deck →'}</span>
</a>`).join('\n');
  return shell(`T57 · ${f.title}`, `<main class="wrap">
<div class="top"><img class="logo" src="/img/t57-logo-light.png" alt="T57" width="150" height="37"><a href="/decks">← All pitch decks</a></div>
<p class="eyebrow">${esc(f.eyebrow)}</p>
<h1>${esc(f.title)}</h1>
<p>${esc(f.summary)}</p>
<div class="grid">${cards}</div>
<section class="share" aria-labelledby="share-h">
<h2 id="share-h">Share this folder</h2>
<p>This link carries the folder’s PIN, so whoever receives it opens the folder in one click. Share it only with the people you mean to.</p>
<div class="linkrow"><code id="link">${esc(link)}</code><button type="button" id="copy">Copy link</button></div>
<div class="btns">
<a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Send on WhatsApp</a>
<a class="btn ghost" href="mailto:?subject=${encodeURIComponent(`T57 · ${f.title}`)}&body=${encodeURIComponent(msg)}">Send by email</a>
</div>
</section>
</main>
<script>(()=>{const b=document.getElementById('copy'),l=${JSON.stringify(link).replace(/</g, '\\u003c')};
b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(l)}catch(e){const r=document.createRange();r.selectNodeContents(document.getElementById('link'));const s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand('copy')}
b.textContent='Copied';setTimeout(()=>b.textContent='Copy link',2500)})})()</script>`);
}

// The film arrives encrypted (AES-256-CTR, the first 16 bytes are the counter); the browser decrypts it
// with the folder key on this page and plays it from memory, which also makes the Download button possible.
function filmPage(f: Folder, item: Extract<FolderItem, { kind: 'film' }>) {
  return shell(`T57 · ${item.title}`, `<main class="wrap">
<div class="top"><img class="logo" src="/img/t57-logo-light.png" alt="T57" width="150" height="37"><a href="/decks/${f.id}">← ${esc(f.title)}</a></div>
<p class="eyebrow">${esc(f.eyebrow)} · Film</p>
<h1>${esc(item.title)}</h1>
<p>${esc(item.summary)}</p>
<div class="player"><video id="v" controls playsinline preload="none" aria-label="${esc(item.title)}"></video>
<div class="loading" id="box"><div class="spin"></div><p id="st">Loading the film…</p></div></div>
<div class="btns" style="margin-top:16px"><a class="btn ghost" id="dl" href="#" download="T57-${esc(item.id)}.mp4" aria-disabled="true">Download MP4</a></div>
</main>
<script>(async()=>{
const v=document.getElementById('v'),box=document.getElementById('box'),st=document.getElementById('st'),dl=document.getElementById('dl');
dl.addEventListener('click',e=>{if(dl.hasAttribute('aria-disabled'))e.preventDefault()});
try{
const r=await fetch(${JSON.stringify(item.src)});if(!r.ok)throw new Error(r.status);
const total=+r.headers.get('content-length')||0,rd=r.body.getReader(),parts=[];let got=0;
for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;if(total)st.textContent='Loading the film… '+Math.round(got*100/total)+'%'}
const buf=await new Blob(parts).arrayBuffer();
const k=await crypto.subtle.importKey('raw',Uint8Array.from(atob(${JSON.stringify(folderKey(f))}),c=>c.charCodeAt(0)),'AES-CTR',false,['decrypt']);
const mp4=await crypto.subtle.decrypt({name:'AES-CTR',counter:new Uint8Array(buf,0,16),length:128},k,new Uint8Array(buf,16));
const url=URL.createObjectURL(new Blob([mp4],{type:'video/mp4'}));
v.src=url;v.preload='auto';box.hidden=true;dl.href=url;dl.removeAttribute('aria-disabled');
}catch(e){st.textContent='The film could not load. Please refresh the page, or write to afzal@t57.ai.';box.classList.add('err')}
})()</script>`);
}
