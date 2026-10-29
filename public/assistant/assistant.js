// T57 AI: the floating assistant on every page. It asks /api/assistant, which answers from the site's own pages.
// The conversation lasts for the visit (sessionStorage), so it survives moving between pages.
// Two launcher designs are on preview for sign-off: "mark" (an AI mark in the honeycomb shape) and "logo" (the T57 mark
// plus "AI"). Add ?ai=logo or ?ai=mark to any address to switch; the choice is remembered in this browser.
(() => {
  if (window.__t57ai || location.pathname.startsWith('/decks')) return;
  window.__t57ai = true;
  const ar = document.documentElement.lang === 'ar' || location.pathname === '/ar' || location.pathname.startsWith('/ar/');
  const L = ar ? {
    open: 'اسأل T57 AI', title: 'T57 AI', sub: 'إجابات من صفحات t57.ai', close: 'إغلاق', reset: 'محادثة جديدة',
    hello: 'مرحبًا بك. اسألني عن T57: العضوية والأسعار، والتمويل والضمان عبر الشركاء، والأسواق، وكيف يعمل سجل التجارة الموحّد.',
    ph: 'اكتب سؤالك…', send: 'إرسال', note: 'قد يخطئ الذكاء الاصطناعي. للتفاصيل المهمة راسلنا على hello@t57.ai',
    err: 'تعذّر الاتصال الآن. حاول مرة أخرى أو راسلنا على hello@t57.ai.', thinking: 'يكتب…',
    ask: ['ما هي T57؟', 'كيف أنضم وكم التكلفة؟', 'كيف يتم التمويل والضمان؟', 'ما الأسواق التي تغطيها T57؟'],
  } : {
    open: 'Ask T57 AI', title: 'T57 AI', sub: 'Answers from the pages of t57.ai', close: 'Close', reset: 'New chat',
    hello: 'Welcome. Ask me anything about T57: membership and pricing, finance and escrow through partners, our markets, or how one trade record works.',
    ph: 'Ask a question…', send: 'Send', note: 'AI can make mistakes. For anything important, email hello@t57.ai',
    err: 'T57 AI could not be reached. Please try again, or email hello@t57.ai.', thinking: 'Writing…',
    ask: ['What is T57?', 'How do I join, and what does it cost?', 'How do finance and escrow work?', 'Which markets does T57 cover?'],
  };

  let look = 'mark';
  try {
    const q = new URLSearchParams(location.search).get('ai');
    if (q === 'logo' || q === 'mark') localStorage.setItem('t57-ai-look', q);
    look = localStorage.getItem('t57-ai-look') || 'mark';
  } catch (e) {}

  const KEY = 't57-ai';
  let state = { open: false, msgs: [] };
  try { state = Object.assign(state, JSON.parse(sessionStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ open: state.open, msgs: state.msgs.slice(-24) })); } catch (e) {} };

  // The AI mark: a honeycomb cell (the brand's hexagon motif) holding the letters AI.
  const MARK = '<svg class="ai-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3.5 34.3 11.75v16.5L20 36.5 5.7 28.25v-16.5Z" fill="none" stroke="#39c4c4" stroke-width="2.4" stroke-linejoin="round"/><text x="20" y="25.2" text-anchor="middle" font-family="Roboto, system-ui, sans-serif" font-size="13.5" font-weight="700" fill="currentColor" letter-spacing=".5">AI</text></svg>';
  const LOGO = '<span class="ai-logo" aria-hidden="true"><img src="/favicon.svg" alt="" width="26" height="26"><b>AI</b></span>';
  const badge = look === 'logo' ? LOGO : MARK;

  const css = document.createElement('link');
  const me = document.querySelector('script[src*="/assistant/assistant.js"]');
  css.rel = 'stylesheet'; css.href = '/assistant/assistant.css' + (me ? new URL(me.src).search : '');
  document.head.appendChild(css);

  const root = document.createElement('div');
  root.className = 't57ai look-' + look; root.dir = ar ? 'rtl' : 'ltr'; root.lang = ar ? 'ar' : 'en';
  root.innerHTML = `
    <button class="ai-launch" type="button" aria-haspopup="dialog" aria-expanded="false">${badge}<span class="ai-launch-t">${L.open}</span></button>
    <section class="ai-panel" role="dialog" aria-modal="false" aria-label="${L.title}" hidden>
      <header class="ai-head">${badge}<div><b>${L.title}</b><span>${L.sub}</span></div>
        <button class="ai-ic ai-reset" type="button" title="${L.reset}" aria-label="${L.reset}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button class="ai-ic ai-close" type="button" title="${L.close}" aria-label="${L.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </header>
      <div class="ai-log" aria-live="polite"></div>
      <form class="ai-form"><label class="ai-sr" for="ai-q">${L.ph}</label>
        <textarea id="ai-q" rows="1" maxlength="1000" placeholder="${L.ph}" autocomplete="off"></textarea>
        <button class="ai-send" type="submit" aria-label="${L.send}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </form>
      <p class="ai-note">${L.note}</p>
    </section>`;
  document.body.appendChild(root);
  const $ = s => root.querySelector(s);
  const launch = $('.ai-launch'), panel = $('.ai-panel'), log = $('.ai-log'), form = $('.ai-form'), box = $('#ai-q');

  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // A small, safe Markdown: links to this site (or email), bold, lists and paragraphs. Everything else is plain text.
  const inline = s => esc(s)
    .replace(/\[([^\]]+)\]\(((?:\/(?!\/)[^\s)]*)|(?:https:\/\/(?:www\.)?t57\.ai[^\s)]*)|(?:mailto:[^\s)]+))\)/g, (m, t, h) => `<a href="${h.replace(/^https:\/\/(www\.)?t57\.ai/, '') || '/'}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])([\w.+-]+@t57\.ai)\b/g, '$1<a href="mailto:$2">$2</a>');
  function md(text) {
    const out = []; let list = null;
    for (const raw of text.split('\n')) {
      const line = raw.trim(), item = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (item) { if (!list) { list = /^\d/.test(line) ? 'ol' : 'ul'; out.push(`<${list}>`); } out.push(`<li>${inline(item[1])}</li>`); continue; }
      if (list) { out.push(`</${list}>`); list = null; }
      if (line) out.push(`<p>${inline(line.replace(/^#+\s*/, ''))}</p>`);
    }
    if (list) out.push(`</${list}>`);
    return out.join('');
  }

  function bubble(role, text) {
    const d = document.createElement('div');
    d.className = 'ai-m ai-' + role;
    if (role === 'user') d.textContent = text; else d.innerHTML = md(text);
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    return d;
  }
  function render() {
    log.innerHTML = '';
    bubble('assistant', L.hello);
    state.msgs.forEach(m => bubble(m.role, m.content));
    if (!state.msgs.length) {
      const c = document.createElement('div'); c.className = 'ai-chips';
      L.ask.forEach(q => { const b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.onclick = () => ask(q); c.appendChild(b); });
      log.appendChild(c);
    }
  }

  function setOpen(on, focus) {
    state.open = on; save();
    panel.hidden = !on; root.classList.toggle('on', on);
    launch.setAttribute('aria-expanded', String(on));
    if (on) { render(); if (focus) setTimeout(() => box.focus(), 30); } else if (focus) launch.focus();
  }

  let busy = false;
  async function ask(q) {
    q = q.trim(); if (!q || busy) return;
    busy = true; root.classList.add('busy');
    const chips = log.querySelector('.ai-chips'); chips && chips.remove();
    state.msgs.push({ role: 'user', content: q }); save();
    bubble('user', q);
    const a = bubble('assistant', ''); a.classList.add('wait'); a.innerHTML = `<p class="ai-dots" aria-label="${L.thinking}"><i></i><i></i><i></i></p>`;
    let text = '';
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: state.msgs, lang: ar ? 'ar' : 'en', path: location.pathname }),
      });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); throw new Error(j.text || L.err); }
      const rd = res.body.getReader(), dec = new TextDecoder(); let buf = '';
      for (;;) {
        const { value, done } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let n; while ((n = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, n); buf = buf.slice(n + 1); if (!line) continue;
          const o = JSON.parse(line);
          if (o.replace) text = o.replace; else if (o.error) text = text ? text + '\n\n' + o.t : o.t; else if (o.t) text += o.t;
          a.classList.remove('wait'); a.innerHTML = md(text); log.scrollTop = log.scrollHeight;
        }
      }
      if (!text) throw new Error(L.err);
    } catch (e) {
      text = text || (e && e.message) || L.err;
      a.classList.remove('wait'); a.innerHTML = md(text);
    }
    state.msgs.push({ role: 'assistant', content: text }); save();
    busy = false; root.classList.remove('busy');
    box.focus();
  }

  launch.addEventListener('click', () => setOpen(!state.open, true));
  $('.ai-close').addEventListener('click', () => setOpen(false, true));
  $('.ai-reset').addEventListener('click', () => { if (busy) return; state.msgs = []; save(); render(); box.focus(); });
  form.addEventListener('submit', e => { e.preventDefault(); const q = box.value; box.value = ''; grow(); ask(q); });
  const grow = () => { box.style.height = 'auto'; box.style.height = Math.min(box.scrollHeight, 120) + 'px'; };
  box.addEventListener('input', grow);
  box.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && state.open) setOpen(false, true); });
  // A link in an answer opens its page. On a phone the chat closes so the page can be read; on larger screens it stays open.
  log.addEventListener('click', e => { if (e.target.closest('a[href^="/"]') && innerWidth < 640) { state.open = false; save(); } });
  if (state.open) setOpen(true, false);
})();
