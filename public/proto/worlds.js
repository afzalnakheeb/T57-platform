(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { green:'#008b8c', cyan:'#39c4c4', indigo:'#2f2e7d', amber:'#f8b716', night:'#0b1340', sapphire:'#8f93ff', mist:'#c9cdf0' };
  const WORLD_PETAL = { farmers:'agri', financiers:'finance' };
  const WORLD_NAME = { farmers:'Farmers & Producers', financiers:'Financiers & Investors' };

  /* ---------- Living scenes ---------- */
  function noise(i, s) { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); }

  function seedScene(ctx, w, h, t, px, py) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const horizon = h * 0.36, vx = w * (0.68 + (px - 0.5) * 0.06);
    const glow = ctx.createRadialGradient(vx, horizon, 0, vx, horizon, w * 0.6);
    glow.addColorStop(0, 'rgba(0,139,140,0.28)'); glow.addColorStop(1, 'rgba(11,19,64,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    const rows = 26, cols = 34, scan = (t * 0.00012) % 1.25;
    for (let r = rows; r >= 1; r--) {
      const z = r / rows, depth = 1 / (0.12 + z * 1.6);
      const y = horizon + (h - horizon) * (1 - z) ** 1.6 * 1.05;
      const rowP = 1 - z;
      const lit = Math.max(0, 1 - Math.abs(rowP - scan) * 9);
      for (let c = 0; c < cols; c++) {
        const off = (c - cols / 2 + 0.5) / cols;
        const x = vx + off * w * 2.1 * (y - horizon) / (h - horizon + 1);
        if (x < -20 || x > w + 20) continue;
        const delay = (r * 70 + noise(c, r) * 900);
        const g = Math.min(1, Math.max(0, (t - delay) / 1600));
        const height = (6 + noise(r, c) * 14) * depth * 1.4 * (1 - (1 - g) ** 3);
        const sway = Math.sin(t * 0.0014 + c * 0.6 + r * 0.3) * 2.2 * depth * 0.4;
        const a = (0.18 + 0.6 * (1 - z)) * (0.55 + lit * 0.9);
        ctx.strokeStyle = lit > 0.15 ? `rgba(57,196,196,${Math.min(1, a + 0.2)})` : `rgba(0,139,140,${a})`;
        ctx.lineWidth = Math.max(0.6, depth * 0.9);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway * 0.4, y - height * 0.5, x + sway, y - height); ctx.stroke();
        if (g > 0.6 && depth > 0.9) { ctx.fillStyle = `rgba(57,196,196,${a * 0.9})`; ctx.beginPath(); ctx.arc(x + sway, y - height, Math.max(0.8, depth * 0.9), 0, 6.283); ctx.fill(); }
      }
    }
    // AI scan line across the field
    const sy = horizon + (h - horizon) * Math.min(1, scan) ** 1.6 * 1.05;
    if (scan < 1) { const lg = ctx.createLinearGradient(0, sy, w, sy); lg.addColorStop(0, 'rgba(143,147,255,0)'); lg.addColorStop(0.5, 'rgba(143,147,255,0.55)'); lg.addColorStop(1, 'rgba(143,147,255,0)'); ctx.strokeStyle = lg; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(w, sy); ctx.stroke(); }
    // Forecast band above the horizon
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const x = w * 0.42 + (w * 0.58) * i / 60; const y = horizon - 40 - Math.sin(i / 8 + t * 0.0006) * 14 - i * 1.1; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = 'rgba(57,196,196,0.7)'; ctx.lineWidth = 1.5; ctx.stroke();
    // pointer light
    const pl = ctx.createRadialGradient(px * w, py * h, 0, px * w, py * h, 220); pl.addColorStop(0, 'rgba(57,196,196,0.12)'); pl.addColorStop(1, 'rgba(57,196,196,0)');
    ctx.fillStyle = pl; ctx.fillRect(0, 0, w, h);
  }

  function valueScene(ctx, w, h, t, px, py) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.75, h * 0.9, 0, w * 0.75, h * 0.9, w * 0.55);
    glow.addColorStop(0, 'rgba(248,183,22,0.16)'); glow.addColorStop(1, 'rgba(11,19,64,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    const n = Math.max(24, Math.round(w / 26)), base = h * 0.92, gap = w / n, bw = gap * 0.52;
    const tops = [];
    const hover = Math.floor(px * n);
    for (let i = 0; i < n; i++) {
      const trend = 0.22 + (i / n) * 0.5;
      const v = trend + Math.sin(i * 0.55 + t * 0.0004) * 0.06 + (noise(i, 3) - 0.5) * 0.12;
      const g = Math.min(1, Math.max(0, (t - i * 45) / 1200));
      const bh = v * h * 0.62 * (1 - (1 - g) ** 3);
      const x = i * gap + (gap - bw) / 2, y = base - bh;
      tops.push([x + bw / 2, y]);
      const right = i / n > 0.42;
      const grad = ctx.createLinearGradient(0, y, 0, base);
      grad.addColorStop(0, right ? 'rgba(47,46,125,0.95)' : 'rgba(47,46,125,0.55)'); grad.addColorStop(1, 'rgba(47,46,125,0.08)');
      ctx.fillStyle = grad; ctx.fillRect(x, y, bw, bh);
      const released = (i % 7 === 3) && g >= 1;
      ctx.fillStyle = released || i === hover ? C.amber : 'rgba(57,196,196,0.8)';
      ctx.fillRect(x, y, bw, i === hover ? 3 : 2);
    }
    // index line
    ctx.beginPath(); tops.forEach(([x, y], i) => i ? ctx.lineTo(x, y - 18) : ctx.moveTo(x, y - 18));
    ctx.strokeStyle = 'rgba(248,183,22,0.85)'; ctx.lineWidth = 1.6; ctx.stroke();
    // capital particles rising into the bars
    for (let k = 0; k < 70; k++) {
      const i = Math.floor(noise(k, 9) * n), [x, y] = tops[i] || [0, 0];
      const life = ((t * 0.00025 + noise(k, 5)) % 1);
      const yy = base - (base - y) * life;
      ctx.fillStyle = `rgba(248,183,22,${0.55 * (1 - life)})`;
      ctx.beginPath(); ctx.arc(x + Math.sin(k + t * 0.002) * 2, yy, 1.4, 0, 6.283); ctx.fill();
    }
    // pointer guide
    if (tops[hover]) {
      const [hx, hy] = tops[hover];
      ctx.strokeStyle = 'rgba(201,205,240,0.35)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(hx, hy - 30); ctx.lineTo(hx, base); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(hx, hy - 18, 4, 0, 6.283); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(201,205,240,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, base + 0.5); ctx.lineTo(w, base + 0.5); ctx.stroke();
  }

  const scenes = [];
  document.querySelectorAll('canvas[data-scene]').forEach(cv => {
    const ctx = cv.getContext('2d');
    const s = { cv, ctx, fn: cv.dataset.scene === 'seed' ? seedScene : valueScene, t0: performance.now(), px: 0.7, py: 0.5, visible: false, w: 0, h: 0 };
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); s.w = r.width; s.h = r.height; cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); if (reduce && s.w && s.h) s.fn(ctx, s.w, s.h, 99999, s.px, s.py); };
    new ResizeObserver(size).observe(cv);
    cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return; s.px = (e.clientX - r.left) / r.width; s.py = (e.clientY - r.top) / r.height; });
    new IntersectionObserver(([en]) => { s.visible = en.isIntersecting; }).observe(cv);
    scenes.push(s);
  });
  function loop(now) {
    scenes.forEach(s => { if (s.visible && s.w && s.h && !reduce && !s.cv.closest('[hidden]')) s.fn(s.ctx, s.w, s.h, Math.max(0, now - s.t0), s.px, s.py); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- Scroll storytelling ---------- */
  const draws = document.querySelectorAll('.problem .draw');
  draws.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 200; p.style.strokeDasharray = L; p.style.strokeDashoffset = 0; p.dataset.len = L; });
  const io = new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting || reduce) return;
    en.target.querySelectorAll('.draw').forEach((p, i) => p.animate([{ strokeDashoffset: p.dataset.len }, { strokeDashoffset: 0 }], { duration: 900, delay: i * 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
    if (en.target.id === 'tranche') en.target.classList.add('run');
    io.unobserve(en.target);
  }), { threshold: 0.4 });
  document.querySelectorAll('.problem, #tranche').forEach(el => io.observe(el));
  const countUp = el => el.querySelectorAll('[data-count]').forEach(t => {
    const n = +t.dataset.count, t0 = performance.now(), fmt = v => Math.round(v).toLocaleString('en-US');
    const step = now => { const k = Math.min(1, (now - t0) / 1400); t.textContent = fmt(n * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  const coverIO = new IntersectionObserver(ents => ents.forEach(en => { const was = en.target.classList.contains('in'); en.target.classList.toggle('in', en.isIntersecting); if (en.isIntersecting && !was) countUp(en.target); }), { threshold: 0.25 });
  document.querySelectorAll('.cover-frame').forEach(el => reduce ? el.classList.add('in') : coverIO.observe(el));
  if (reduce) document.getElementById('tranche').classList.add('run');

  function railUpdate() {
    document.querySelectorAll('.world:not([hidden]) .steps').forEach(ol => {
      const r = ol.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.6)));
      ol.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      ol.querySelectorAll('li').forEach((li, i) => li.classList.toggle('on', reduce || p >= (i + 0.5) / 4 - 0.12));
    });
  }
  addEventListener('scroll', railUpdate, { passive: true }); addEventListener('resize', railUpdate); railUpdate();

  /* ---------- Header petal focus ---------- */
  const logo = document.getElementById('logo');
  function focusPetal(name) { logo.classList.toggle('focus', !!name); logo.querySelectorAll('.petal').forEach(p => p.classList.toggle('on', !!name && p.classList.contains('p-' + name))); }
  document.querySelectorAll('.worlds a').forEach(a => { a.addEventListener('pointerenter', () => focusPetal(a.dataset.petal)); a.addEventListener('pointerleave', () => focusPetal(null)); a.addEventListener('focus', () => focusPetal(a.dataset.petal)); a.addEventListener('blur', () => focusPetal(null)); });

  /* ---------- World switching with the petal transition ---------- */
  const veil = document.getElementById('veil'), vbg = veil.querySelector('.bg'), mark = document.getElementById('veil-mark'), dest = document.getElementById('veil-dest');
  const arcBold = veil.querySelector('path.bold'), arcSweep = veil.querySelector('path.sweep');
  [arcBold, arcSweep].forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L; });
  let current = null, busy = false;

  function show(name) {
    document.querySelectorAll('.world').forEach(w => w.hidden = w.id !== name);
    document.querySelectorAll('.worlds a').forEach(a => a.toggleAttribute('aria-current', a.dataset.go === name) || a.setAttribute('aria-current', a.dataset.go === name ? 'page' : 'false'));
    document.querySelectorAll('.worlds a').forEach(a => { if (a.dataset.go === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.querySelector('.hdr .demo').setAttribute('href', '#cta-' + name);
    const sc = scenes.find(s => s.cv.closest('.world').id === name); if (sc) { sc.t0 = performance.now(); if (reduce && sc.w && sc.h) sc.fn(sc.ctx, sc.w, sc.h, 99999, sc.px, sc.py); }
    current = name; railUpdate();
  }
  const anim = (el, kf, o) => el.animate(kf, Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.65,0,.35,1)' }, o)).finished;

  async function go(name, push) {
    if (name === current || busy) return;
    busy = true;
    if (push !== false) { try { history.replaceState(null, '', '#' + name); } catch (e) {} }
    if (reduce || !current) { show(name); scrollTo(0, 0); busy = false; return; }
    const petal = WORLD_PETAL[name];
    dest.textContent = WORLD_NAME[name];
    const petals = [...mark.querySelectorAll('.petal')];
    const target = mark.querySelector('.p-' + petal);
    petals.forEach(p => p.getAnimations().forEach(a => a.cancel()));
    veil.classList.add('go');
    const out = document.getElementById(current);
    anim(out, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0.4, transform: 'scale(0.985)' }], { duration: 400 });
    anim(vbg, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 150 });
    anim(arcBold, [{ strokeDashoffset: arcBold.dataset.len }, { strokeDashoffset: 0 }], { duration: 700, delay: 100 });
    anim(arcSweep, [{ strokeDashoffset: arcSweep.dataset.len }, { strokeDashoffset: 0 }], { duration: 700, delay: 250 });
    anim(mark, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 600, delay: 350, easing: 'cubic-bezier(.2,.8,.2,1)' });
    petals.forEach(p => { if (p !== target) anim(p, [{ opacity: 1 }, { opacity: p.classList.contains('p-ring') ? 0.35 : 0.12 }], { duration: 400, delay: 800 }); });
    anim(dest, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 850 });
    await anim(target, [{ opacity: 1, filter: 'none' }, { opacity: 1, filter: 'drop-shadow(0 0 6px rgba(57,196,196,.9))' }], { duration: 500, delay: 800 });
    out.style.opacity = ''; out.style.transform = ''; out.getAnimations().forEach(a => a.cancel());
    show(name); scrollTo(0, 0);
    const lines = [...document.querySelectorAll('#' + name + ' .hero h1 .ln, #' + name + ' .hero .std, #' + name + ' .hero .actions')];
    lines.forEach((l, i) => l.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 250 + i * 90, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
    anim(mark, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(2.6)' }], { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)' });
    anim(dest, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
    anim(arcBold, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
    anim(arcSweep, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
    await anim(vbg, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 150 });
    [vbg, mark, dest, arcBold, arcSweep, ...petals].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    veil.classList.remove('go');
    busy = false;
  }

  /* ---------- Logo intro: the five petals assemble into the mark ---------- */
  const CENTER = [898, 540];
  const PC = { agri:[898, 617], logistics:[975, 566], trade:[952, 470], tech:[847, 470], finance:[822, 567] };
  async function intro() {
    if (reduce) return;
    busy = true;
    veil.classList.add('go');
    vbg.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 10, fill: 'forwards' });
    mark.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 10, fill: 'forwards' });
    const order = ['agri', 'logistics', 'trade', 'tech', 'finance'];
    const ring = mark.querySelector('.p-ring');
    ring.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 10, fill: 'forwards' });
    const ps = order.map((n, i) => {
      const el = mark.querySelector('.p-' + n), [x, y] = PC[n], dx = (x - CENTER[0]) * 1.6, dy = (y - CENTER[1]) * 1.6;
      return el.animate([
        { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.4)` },
        { opacity: 1, offset: 0.6 },
        { opacity: 1, transform: 'translate(0,0) scale(1)' }
      ], { duration: 900, delay: 200 + i * 170, easing: 'cubic-bezier(.2,.9,.25,1.15)', fill: 'both' }).finished;
    });
    dest.textContent = 'T57.ai';
    await Promise.all(ps);
    ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards' });
    dest.animate([{ opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.24em' }], { duration: 700, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' });
    await new Promise(r => setTimeout(r, 750));
    // fly the mark to the header logo
    const from = mark.getBoundingClientRect(), to = logo.getBoundingClientRect();
    const toW = to.height * (250 / 244);
    const dx = (to.left + toW / 2) - (from.left + from.width / 2), dy = (to.top + to.height / 2) - (from.top + from.height / 2), s = toW / from.width;
    logo.querySelectorAll('.petal').forEach(p => p.style.opacity = '0');
    const wm = logo.querySelector('.wordmark'); wm.style.opacity = '0';
    dest.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
    vbg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 250, fill: 'forwards' });
    await mark.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }], { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished;
    logo.querySelectorAll('.petal').forEach(p => p.style.opacity = '');
    wm.animate([{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
    wm.style.opacity = '';
    [vbg, mark, dest, ring, ...mark.querySelectorAll('.petal')].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    veil.classList.remove('go');
    const lines = [...document.querySelectorAll('#' + current + ' .hero h1 .ln, #' + current + ' .hero .std, #' + current + ' .hero .actions')];
    lines.forEach((l, i) => l.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: i * 90, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
    busy = false;
  }

  /* ---------- Colour options for the mark on dark ---------- */
  const markPaths = [...mark.querySelectorAll('path')];
  markPaths.forEach(p => p.dataset.f = p.getAttribute('fill'));
  const TEAL_SOLID = /^rgb\(19\.4/;
  const SOLID = { tb: ['#39c4c4', '#5b5fef'], tc: ['#f0f8f1', '#39c4c4'] };
  function setTone(t) {
    veil.dataset.tone = t;
    markPaths.forEach(p => {
      const f = p.dataset.f;
      if (t === 'white') p.setAttribute('fill', '#ffffff');
      else if (t === 'full') p.setAttribute('fill', f);
      else if (f.startsWith('url(#')) p.setAttribute('fill', f.replace('url(#', 'url(#' + t + '-'));
      else p.setAttribute('fill', TEAL_SOLID.test(f) ? SOLID[t][0] : SOLID[t][1]);
    });
    document.querySelectorAll('[data-tone-pick]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tonePick === t));
    try { localStorage.setItem('t57-tone', t); } catch (e) {}
  }
  setTone('white'); // chosen: the brand guide's reversed logo (p.13)

  document.addEventListener('click', e => {
    const tp = e.target.closest('[data-tone-pick]'); if (tp) { setTone(tp.dataset.tonePick); if (!busy) intro(); return; }
    const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); go(a.dataset.go); return; }
    if (e.target.closest('#replay')) { e.preventDefault(); intro(); }
  });

  const start = (location.hash || '').slice(1);
  show(WORLD_PETAL[start] ? start : 'farmers');
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (WORLD_PETAL[h]) go(h, false); });
  setTimeout(intro, 150);
})();
