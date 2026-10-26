(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { green:'#008b8c', cyan:'#39c4c4', indigo:'#2f2e7d', amber:'#f8b716', night:'#0b1340', sapphire:'#8f93ff', mist:'#c9cdf0' };
  const WORLD_PETAL = { home:'all', governments:'all', financiers:'finance', traders:'trade', farmers:'agri' };
  const WORLD_NAME = { home:'T57.ai', governments:'Governments & Regulators', financiers:'Financiers & Investors', traders:'Traders & Aggregators', farmers:'Farmers & Producers' };

  /* ---------- Market data (real, published figures; refreshed monthly) ----------
     FAO Food Price Index and sub-indices, nominal, 2014-2016 = 100. Source: FAO, food_price_indices_data.csv, release of 2 Oct 2026.
     Columns: month, Food, Meat, Dairy, Cereals, Vegetable oils, Sugar. */
  const FAO = `2024-01,117.6,108.9,118.7,119.9,122.5,136.4
2024-02,117.4,112.5,120.7,113.8,120.9,140.8
2024-03,118.9,114.9,124.0,110.9,130.6,133.4
2024-04,119.2,116.6,123.8,111.6,130.9,126.6
2024-05,120.5,116.7,126.3,118.7,127.8,117.1
2024-06,121.0,118.1,127.9,115.2,131.8,119.4
2024-07,120.9,120.0,127.8,110.7,135.0,119.5
2024-08,121.7,122.0,131.3,110.2,136.1,113.9
2024-09,124.6,119.9,136.5,113.6,142.4,126.3
2024-10,126.9,119.2,138.6,114.4,152.7,129.6
2024-11,127.7,118.7,139.8,111.4,164.1,126.4
2024-12,127.3,119.6,141.2,111.4,162.1,119.3
2025-01,124.6,116.6,143.1,111.8,153.0,111.2
2025-02,126.6,116.9,147.7,112.6,156.0,118.5
2025-03,127.2,118.3,148.7,109.7,161.8,116.9
2025-04,128.2,121.6,151.7,110.9,158.0,112.3
2025-05,127.1,122.8,153.6,109.0,152.2,109.4
2025-06,128.1,126.0,155.5,107.3,155.7,103.6
2025-07,129.8,126.6,154.6,106.5,166.8,103.3
2025-08,130.0,127.8,152.2,105.6,169.1,103.6
2025-09,128.6,127.9,147.2,104.8,167.9,99.4
2025-10,126.4,125.0,141.7,103.8,169.4,94.1
2025-11,125.2,125.5,136.2,105.6,165.0,88.6
2025-12,124.5,124.8,128.2,107.2,165.2,90.7
2026-01,124.1,124.9,120.9,107.5,168.6,89.8
2026-02,125.5,126.5,119.4,108.7,174.2,86.2
2026-03,128.7,128.0,121.2,110.4,183.1,92.8
2026-04,131.0,130.4,119.7,111.3,193.9,88.5
2026-05,131.0,131.3,119.1,114.2,185.0,95.1
2026-06,130.1,130.5,116.9,110.0,192.0,90.0
2026-07,131.7,129.4,116.6,113.8,195.7,95.0
2026-08,134.0,129.3,119.2,116.8,196.9,107.4
2026-09,136.0,127.9,119.1,122.8,198.6,114.0`.split('\n').map(r => r.split(','));
  const FAO_SERIES = [['Food Price Index', 1], ['Cereals', 4], ['Vegetable oils', 5], ['Dairy', 3], ['Meat', 2], ['Sugar', 6]];
  // World Bank Pink Sheet, 2 Oct 2026: nominal US$ prices, [name, group, unit, Aug 2026, Sep 2026].
  const PINK = [
    ['Wheat, US HRW', 'Grains', '/t', 330.0, 347.0], ['Wheat, US SRW', 'Grains', '/t', 263.2, 278.6], ['Maize', 'Grains', '/t', 224.0, 239.6],
    ['Rice, Thai 5%', 'Grains', '/t', 471.0, 482.0], ['Rice, Viet Nam 5%', 'Grains', '/t', 410.9, 418.5],
    ['Soybeans', 'Oils and oilseeds', '/t', 482, 524], ['Soybean oil', 'Oils and oilseeds', '/t', 1639, 1615], ['Palm oil', 'Oils and oilseeds', '/t', 1132, 1180],
    ['Sugar', 'Sugar and softs', '/kg', 0.38, 0.41], ['Coffee, Arabica', 'Sugar and softs', '/kg', 7.97, 7.26], ['Cocoa', 'Sugar and softs', '/kg', 5.95, 5.92], ['Tea', 'Sugar and softs', '/kg', 2.91, 2.85],
    ['Beef', 'Proteins and produce', '/kg', 7.28, 6.86], ['Chicken', 'Proteins and produce', '/kg', 1.69, 1.81], ['Oranges', 'Proteins and produce', '/kg', 0.77, 0.79], ['Bananas', 'Proteins and produce', '/kg', 1.10, 1.12],
    ['Urea', 'Inputs and energy', '/t', 390.0, 407.5], ['DAP fertilizer', 'Inputs and energy', '/t', 793.5, 800.6], ['Brent crude', 'Inputs and energy', '/bbl', 90.9, 116.8]
  ].map(([name, group, unit, a, b]) => ({ name, group, unit, prev: a, last: b, ch: (b - a) / a * 100 }));
  const IMPORT_BILL_PER_YEAR = 2.22e12; // FAO Food Outlook, Nov 2025 (2025 forecast)

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

  // Land mask: 180 x 90 cells of 2 degrees (Natural Earth 110m land via world-atlas), packed as bits.
  const LAND = (() => { const b = atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf4AP/gAAAAAAAAAAAAAAAAAAAAAAAX/z///+AAAAAAAABAAAAAAAAAAAAAYd8P///wAA+AAAAAA8AAAAAAAAAAAwAnw////4AAIAAAAAAGAAAAAAAAAAADivwAf//wAAAAADAAf/wAHYAAAAAADoi3sAP//gAAAAAMAD///sAAAAgBgACfwz/AD/+gAAA4AEHf///+/8gBAP/7/nJdjwD/+AAAH/AA7f///////f4P//////h8H/gAAAf/6//f////////Mf/////9H4D8AeAA+ev///////////AP/////4A0B4AAAD5/////////////Af3////gHgA4AAAH5///////////LwAHgH///gHkAAAAAH4/////////+CIAABAB///4D+AAAAGCx/////////4A8AAIAAf///n/gAAAOCD/////////wA4AAAAAf///n/wAAAbP///////////AgAAAAAP/////wAAADf//////////9AAAAAAAF////0YAAAB///////////9AAAAAAAD////8EAAAB///////////5AAAAAAAD////2AAAAB/f5fP//////wAAAAAAAD////gAAAAfxnwPP//////jAAAAAAAD////AAAAAPCb3/n/////+CAAAAAAAD///8AAAAAfALf/n////+ECAAAAAAAB///8AAAAAGHQP/n/////mMAAAAAAAA///8AAAAAH+Ai///////E8AAAAAAAAf//wAAAAAP/AA///////BgAAAAAAAAP//gAAAAAf/73///////gAAAAAAAAAD/AQAAAAAf////f/////gAAAAAAAAAF+AQAAAAB///+/n/////AAAAAAAAAAC+AAAAAAB///+f0H////AAAAAAAAAAAeAwAAAAD////f/B///8gAAAAAAAAAAeGEAAAAH////v+B/z/AAAAAAAAAAAAPMAgAAAD////n+A/B+gAAAAAAAAAAAD8AAAAAD////n4AeB/AgAAAAAAAAAAAPAAAAAH////3gAcAfAgAAAAAAAAAAADAAAAAD////6AAcAfggAAAAAAAAAAABDwAAAD////8wAMATAIAAAAAAAAAAAAr/AAAB/////gAKASAAAAAAAAAAAAAAH/gAAA/////gACAAAIAAAAAAAAAAAAH/8AAAaH///AAAAsGAAAAAAAAAAAAAH/+AAAAB//+AAAAUOAAAAAAAAAAAAAP/+AAAAB//8AAAAYegAAAAAAAAAAAAP//gAAAD//4AAAAMeBgAAAAAAAAAAAP//8AAAB//wAAAAGdiuAAAAAAAAAAAf///AAAA//wAAAACAQHgAAAAAAAAAAP///gAAA//wAAAABwAHwgAAAAAAAAAH///AAAA//wAAAAACIDQIAAAAAAAAAH//+AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//+AAAA//wgAAAAAPxgBAAAAAAAAAA//8AAAA//jgAAAAAf5gAAAAAAAAAAAf/8AAAA//DgAAAAAf/gAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/wAAAAf/DAAAAAH//4AAAAAAAAAAAf/AAAAAf+CAAAAAH//8AAAAAAAAAAAf/AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAH4AAAAAAD//+AAAAAAAAAAA/8AAAAAHwAAAAAADwf8AAAAAAAAAAA/gAAAAAAAAAAAAACAH4AIAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB+AAAAAAAAAAAAAAAAAAAGAAAAAAAAB6AAAAAAAAAAAAAAAAAwAMAAAAAAAAA8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAAAwAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAACAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAeAAIP+f/gAAAAAAAAAAAMAAAAAAABP/+H//////AAAAAAAAAAA+AAAAAf////8////////AAAAAAAOEAPAAAB///////////////gAAAP//T//8AAAH//////////////+AAAH/////4AAAH///////////////8AAE//////4ABw////////////////8AAAD//////gCA////////////////wAAAf/////////////////////////+A/4A///////////////////////////////////////////////////////////////////////////////////////'), out = new Uint8Array(180 * 90); for (let i = 0; i < b.length; i++) { const v = b.charCodeAt(i); for (let k = 0; k < 8; k++) out[i * 8 + k] = (v >> (7 - k)) & 1; } return out; })();
  const isLand = (lat, lon) => { const r = Math.min(89, Math.max(0, Math.floor((90 - lat) / 2))), c = Math.min(179, Math.max(0, Math.floor((lon + 180) / 2))); return LAND[r * 180 + c] === 1; };
  const GLOBE_DOTS = []; for (let lat = -58; lat <= 78; lat += 1.3) { const step = 1.3 / Math.max(0.2, Math.cos(lat * Math.PI / 180)); for (let lon = -180; lon < 180; lon += step) if (isLand(lat, lon)) GLOBE_DOTS.push([lat * Math.PI / 180, lon * Math.PI / 180]); }
  // Hubs: the five markets plus ASEAN and East Africa. s = surplus-leaning (teal), d = deficit-leaning (amber), for illustration.
  const HUBS = { riyadh:[24.7, 46.7, 'd'], dubai:[25.2, 55.3, 'd'], mumbai:[19.1, 72.9, 's'], kl:[3.1, 101.7, 's'], istanbul:[41.0, 29.0, 's'], jakarta:[-6.2, 106.8, 'd'], nairobi:[-1.3, 36.8, 'd'], cairo:[30.0, 31.2, 'd'], bangkok:[13.8, 100.5, 's'] };
  const ROUTES = [['mumbai','riyadh'],['mumbai','dubai'],['kl','riyadh'],['istanbul','riyadh'],['bangkok','jakarta'],['mumbai','nairobi'],['istanbul','cairo'],['kl','dubai'],['bangkok','dubai'],['istanbul','kl']];
  function globeScene(ctx, w, h, t, px, py) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const narrow = w < 700, cx = narrow ? w * 0.6 : w * 0.72, cy = h * (narrow ? 0.62 : 0.54), R = Math.min(h * (narrow ? 0.5 : 0.5), w * (narrow ? 0.62 : 0.32));
    const halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.5); halo.addColorStop(0, 'rgba(91,95,239,0.22)'); halo.addColorStop(1, 'rgba(11,19,64,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(19,29,85,0.9)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill();
    const rot = (62 + Math.sin(t * 0.00006) * 28 + (px - 0.5) * 16) * Math.PI / 180, tilt = (24 + (py - 0.5) * 8) * Math.PI / 180;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const proj = (lat, lon) => { const cl = Math.cos(lat), x = cl * Math.sin(lon - rot), y0 = Math.sin(lat), z0 = cl * Math.cos(lon - rot); const y = y0 * ct - z0 * st, z = y0 * st + z0 * ct; return [cx + x * R, cy - y * R, z]; };
    const grow = Math.min(1, t / 1800);
    for (let i = 0; i < GLOBE_DOTS.length; i++) {
      const [la, lo] = GLOBE_DOTS[i], [x, y, z] = proj(la, lo); if (z <= 0) continue;
      ctx.fillStyle = `rgba(143,147,255,${(0.18 + z * 0.7) * grow})`; ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
    }
    ctx.strokeStyle = 'rgba(143,147,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.stroke();
    const rad = d => d * Math.PI / 180;
    ROUTES.forEach(([a, b], k) => {
      const A = HUBS[a], B = HUBS[b], la1 = rad(A[0]), lo1 = rad(A[1]), la2 = rad(B[0]), lo2 = rad(B[1]);
      const v1 = [Math.cos(la1) * Math.cos(lo1), Math.cos(la1) * Math.sin(lo1), Math.sin(la1)], v2 = [Math.cos(la2) * Math.cos(lo2), Math.cos(la2) * Math.sin(lo2), Math.sin(la2)];
      const dot = Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]), om = Math.acos(dot), so = Math.sin(om) || 1;
      const appear = Math.min(1, Math.max(0, (t - 1200 - k * 260) / 900));
      const pts = []; const N = 40;
      for (let i = 0; i <= N * appear; i++) { const f = i / N, s1 = Math.sin((1 - f) * om) / so, s2 = Math.sin(f * om) / so, v = [s1 * v1[0] + s2 * v2[0], s1 * v1[1] + s2 * v2[1], s1 * v1[2] + s2 * v2[2]], lift = 1 + Math.sin(f * Math.PI) * 0.13 * om;
        const la = Math.asin(v[2] / Math.hypot(...v)), lo = Math.atan2(v[1], v[0]), p = proj(la, lo); pts.push([cx + (p[0] - cx) * lift, cy + (p[1] - cy) * lift, p[2]]); }
      ctx.lineWidth = 1.4; ctx.beginPath(); let on = false;
      pts.forEach(([x, y, z]) => { if (z > -0.05) { on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false; });
      ctx.strokeStyle = 'rgba(57,196,196,0.55)'; ctx.stroke();
      if (appear >= 1) { const f = ((t * 0.00018 + k * 0.37) % 1), q = pts[Math.round(f * N)]; if (q && q[2] > 0) { ctx.fillStyle = 'rgba(240,248,241,0.95)'; ctx.beginPath(); ctx.arc(q[0], q[1], 2.2, 0, 6.283); ctx.fill(); } }
    });
    Object.values(HUBS).forEach(([la, lo, kind], k) => {
      const [x, y, z] = proj(rad(la), rad(lo)); if (z <= 0) return;
      const col = kind === 's' ? '57,196,196' : '248,183,22', pulse = (t * 0.0005 + k * 0.23) % 1;
      ctx.strokeStyle = `rgba(${col},${0.7 * (1 - pulse)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 4 + pulse * 16, 0, 6.283); ctx.stroke();
      ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.283); ctx.fill();
    });
  }

  function bidsScene(ctx, w, h, t, px, py) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const narrow = w < 700, x0 = narrow ? w * 0.06 : w * 0.5, x1 = w * 0.96, W = x1 - x0, mid = x0 + W / 2;
    const glow = ctx.createRadialGradient(mid, h * 0.42, 0, mid, h * 0.42, W * 0.6); glow.addColorStop(0, 'rgba(38,65,179,0.35)'); glow.addColorStop(1, 'rgba(11,19,64,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    const D = [mid, h * 0.42], sup = [], buy = [], len = [];
    for (let i = 0; i < 5; i++) { sup.push([x0 + W * 0.04, h * (0.16 + i * 0.11)]); buy.push([x1 - W * 0.04, h * (0.16 + i * 0.11)]); }
    for (let i = 0; i < 3; i++) len.push([mid + (i - 1) * W * 0.22, h * 0.84]);
    const cyc = 7000, ph = (t % cyc) / cyc, round = Math.floor(t / cyc), ms = (round * 3 + 1) % 5, mb = (round * 2 + 3) % 5, best = round % 3;
    ctx.font = '600 11px Roboto, system-ui, sans-serif'; ctx.textAlign = 'center';
    try { ctx.letterSpacing = '2px'; } catch (e) {}
    ctx.fillStyle = 'rgba(201,205,240,0.7)';
    ctx.fillText('SUPPLIER QUOTES', sup[0][0] + 10, h * 0.09); ctx.fillText('BUYER RFQS', buy[0][0] - 10, h * 0.09); ctx.fillText('LICENSED LENDERS', mid, h * 0.96);
    const curve = (a, b, f) => { const cx1 = (a[0] + b[0]) / 2, cy1 = a[1]; const u = 1 - f; return [u * u * a[0] + 2 * u * f * cx1 + f * f * b[0], u * u * a[1] + 2 * u * f * cy1 + f * f * b[1]]; };
    const lines = (arr, m, lit) => arr.forEach((p, i) => {
      const hot = i === m && lit; ctx.strokeStyle = hot ? 'rgba(240,248,241,0.9)' : 'rgba(143,147,255,0.18)'; ctx.lineWidth = hot ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo((p[0] + D[0]) / 2, p[1], D[0], D[1]); ctx.stroke();
      for (let k = 0; k < 3; k++) { const f = ((t * 0.00035 + k / 3 + i * 0.13) % 1), q = curve(p, D, f); ctx.fillStyle = hot ? 'rgba(240,248,241,0.95)' : 'rgba(143,147,255,0.5)'; ctx.beginPath(); ctx.arc(q[0], q[1], hot ? 2.2 : 1.4, 0, 6.283); ctx.fill(); }
      ctx.fillStyle = hot ? C.cyan : 'rgba(19,29,85,1)'; ctx.strokeStyle = hot ? C.cyan : 'rgba(143,147,255,0.6)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(p[0] - 9, p[1] - 9, 18, 18, 4) : ctx.rect(p[0] - 9, p[1] - 9, 18, 18); ctx.fill(); ctx.stroke();
    });
    const matched = ph > 0.18;
    lines(sup, ms, matched); lines(buy, mb, matched);
    // deal file: forms once both sides match
    const form = Math.min(1, Math.max(0, (ph - 0.25) / 0.15));
    ctx.strokeStyle = `rgba(240,248,241,${0.35 + form * 0.6})`; ctx.lineWidth = 1.6; ctx.fillStyle = 'rgba(11,19,64,0.95)';
    const dw = 76 + form * 20, dh = 92 + form * 20; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(D[0] - dw / 2, D[1] - dh / 2, dw, dh, 10) : ctx.rect(D[0] - dw / 2, D[1] - dh / 2, dw, dh); ctx.fill(); ctx.stroke();
    for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(201,205,240,${0.25 + form * 0.5})`; ctx.fillRect(D[0] - dw / 2 + 14, D[1] - dh / 2 + 18 + k * 16, (dw - 28) * (k === 3 ? 0.6 : 1), 3); }
    ctx.fillStyle = `rgba(240,248,241,${0.5 + form * 0.5})`; ctx.fillText('DEAL FILE', D[0], D[1] + dh / 2 + 20);
    // lenders compete
    const offer = Math.min(1, Math.max(0, (ph - 0.45) / 0.3)), pick = ph > 0.8;
    len.forEach((p, i) => {
      const strength = [0.62, 0.8, 0.92][(i + best) % 3], top = i === best ? 1 : 0, f = offer * strength;
      const q = [p[0] + (D[0] - p[0]) * f, p[1] + (D[1] + dh / 2 + 34 - p[1]) * f];
      ctx.strokeStyle = pick && i === best ? 'rgba(248,183,22,0.95)' : 'rgba(143,147,255,0.35)'; ctx.lineWidth = pick && i === best ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      ctx.fillStyle = pick && i === best ? C.amber : 'rgba(143,147,255,0.8)'; ctx.beginPath(); ctx.arc(q[0], q[1], pick && i === best ? 4 : 3, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(19,29,85,1)'; ctx.strokeStyle = pick && i === best ? C.amber : 'rgba(143,147,255,0.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, 6.283); ctx.fill(); ctx.stroke();
    });
    if (pick) { ctx.fillStyle = C.amber; ctx.fillText('BEST OFFER SELECTED', len[best][0], len[best][1] - 22); }
    ctx.textAlign = 'start'; try { ctx.letterSpacing = '0px'; } catch (e) {}
  }

  // Home: the six FAO series drawn as slow, living price lines (real data used as texture).
  function marketScene(ctx, w, h, t, px, py) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.78, h * 0.35, 0, w * 0.78, h * 0.35, w * 0.6); glow.addColorStop(0, 'rgba(0,139,140,0.22)'); glow.addColorStop(1, 'rgba(11,19,64,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(201,205,240,0.06)'; ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 64) { ctx.beginPath(); ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, h); ctx.stroke(); }
    for (let gy = 0; gy < h; gy += 64) { ctx.beginPath(); ctx.moveTo(0, gy + 0.5); ctx.lineTo(w, gy + 0.5); ctx.stroke(); }
    const n = FAO.length, draw = Math.min(1, t / 2600);
    FAO_SERIES.forEach(([, col], k) => {
      const vals = FAO.map(r => +r[col]), lo = Math.min(...vals), hi = Math.max(...vals);
      const band = h * 0.5, top = h * 0.14 + k * h * 0.06;
      ctx.beginPath();
      const upto = Math.floor((n - 1) * draw);
      for (let i = 0; i <= upto; i++) { const x = w * 0.04 + (w * 0.94) * i / (n - 1), y = top + band * (1 - (vals[i] - lo) / (hi - lo || 1)) + Math.sin(t * 0.0007 + i * 0.5 + k) * 1.5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      const main = k === 0;
      ctx.strokeStyle = main ? 'rgba(57,196,196,0.75)' : `rgba(143,147,255,${0.16 + 0.05 * k})`; ctx.lineWidth = main ? 2 : 1.2; ctx.stroke();
      if (main && draw >= 1) { const i = n - 1, x = w * 0.98, y = top + band * (1 - (vals[i] - lo) / (hi - lo || 1)); const p = (t * 0.0006) % 1;
        ctx.strokeStyle = `rgba(57,196,196,${0.8 * (1 - p)})`; ctx.beginPath(); ctx.arc(x, y, 4 + p * 18, 0, 6.283); ctx.stroke(); ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 6.283); ctx.fill(); }
    });
    const pl = ctx.createRadialGradient(px * w, py * h, 0, px * w, py * h, 240); pl.addColorStop(0, 'rgba(57,196,196,0.08)'); pl.addColorStop(1, 'rgba(57,196,196,0)');
    ctx.fillStyle = pl; ctx.fillRect(0, 0, w, h);
  }

  const scenes = [];
  document.querySelectorAll('canvas[data-scene]').forEach(cv => {
    const ctx = cv.getContext('2d');
    const s = { cv, ctx, fn: { seed: seedScene, value: valueScene, globe: globeScene, bids: bidsScene, market: marketScene }[cv.dataset.scene], t0: performance.now(), px: 0.7, py: 0.5, visible: false, w: 0, h: 0 };
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

  /* ---------- Market board ---------- */
  const fmtPrice = (v, unit) => (unit === '/kg' ? v.toFixed(2) : v >= 1000 ? Math.round(v).toLocaleString('en-US') : v.toFixed(1)).replace(/\.0$/, '');
  const sign = v => (v >= 0 ? '▲ +' : '▼ ') + v.toFixed(1) + '%';
  const dir = v => (v >= 0 ? 'up' : 'down');
  (function board() {
    const last = FAO[FAO.length - 1], prev = FAO[FAO.length - 2], yago = FAO[FAO.length - 13];
    const mom = (last[1] - prev[1]) / prev[1] * 100, yoy = (last[1] - yago[1]) / yago[1] * 100;
    document.querySelectorAll('[data-fpi-latest]').forEach(e => e.textContent = (+last[1]).toFixed(1));
    document.querySelectorAll('[data-fpi-mom]').forEach(e => { e.textContent = sign(mom); e.className = dir(mom); });
    document.querySelectorAll('[data-fpi-yoy]').forEach(e => e.textContent = (yoy >= 0 ? '+' : '') + yoy.toFixed(1) + '% on a year earlier');
    const spark = document.querySelector('[data-fpi-spark]');
    if (spark) { const v = FAO.map(r => +r[1]), lo = Math.min(...v), hi = Math.max(...v); spark.setAttribute('d', v.map((y, i) => (i ? 'L' : 'M') + (i / (v.length - 1) * 300).toFixed(1) + ' ' + (64 - (y - lo) / (hi - lo) * 58).toFixed(1)).join(' ')); }
    // ticker
    const tk = document.querySelector('[data-ticker]');
    if (tk) { const items = PINK.map(p => `<span class="tk"><b>${p.name}</b> $${fmtPrice(p.last, p.unit)}${p.unit} <em class="${dir(p.ch)}">${sign(p.ch)}</em></span>`).join('');
      tk.innerHTML = `<div class="tk-run">${items}</div><div class="tk-run" aria-hidden="true">${items}</div>`; }
    // movers
    const mv = document.querySelector('[data-movers]');
    if (mv) mv.innerHTML = [...PINK].filter(p => p.group !== 'Inputs and energy').sort((a, b) => Math.abs(b.ch) - Math.abs(a.ch)).slice(0, 6)
      .map(p => `<li><span class="mv-n">${p.name}</span><span class="mv-p">$${fmtPrice(p.last, p.unit)}${p.unit}</span><span class="mv-c ${dir(p.ch)}">${sign(p.ch)}</span><i class="mv-bar ${dir(p.ch)}" style="--w:${Math.min(1, Math.abs(p.ch) / 10)}"></i></li>`).join('');
    // heat tiles, grouped
    const ht = document.querySelector('[data-heat]');
    if (ht) { const groups = [...new Set(PINK.map(p => p.group))];
      ht.innerHTML = groups.map(g => `<div class="hg"><span class="hg-k">${g}</span><div class="hg-tiles">${PINK.filter(p => p.group === g).map(p => {
        const a = Math.min(1, Math.abs(p.ch) / 8);
        return `<div class="tile ${dir(p.ch)}" style="--a:${(0.12 + a * 0.6).toFixed(2)}"><span class="t-n">${p.name}</span><span class="t-p">$${fmtPrice(p.last, p.unit)}<small>${p.unit}</small></span><span class="t-c">${sign(p.ch)}</span></div>`; }).join('')}</div></div>`).join(''); }
    // chart with tabs
    const svg = document.querySelector('[data-chart]'), tabs = document.querySelector('[data-tabs]'), tip = document.querySelector('[data-chart-tip]');
    if (!svg) return;
    let W = 720, H = 300; const L = 44, Rr = 12, T = 16, B = 34, months = FAO.map(r => r[0]);
    const label = m => new Date(m + '-01T00:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    let cur = 0;
    tabs.innerHTML = FAO_SERIES.map(([n], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${n}</button>`).join('');
    function render(i, animate) {
      cur = i; W = Math.max(320, Math.round(svg.clientWidth) || 720); H = W < 520 ? 240 : 300; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const col = FAO_SERIES[i][1], v = FAO.map(r => +r[col]), lo = Math.floor(Math.min(...v) / 10) * 10, hi = Math.ceil(Math.max(...v) / 10) * 10;
      const X = k => L + (W - L - Rr) * k / (v.length - 1), Y = y => T + (H - T - B) * (1 - (y - lo) / (hi - lo));
      let g = ''; for (let y = lo; y <= hi; y += (hi - lo > 60 ? 20 : 10)) g += `<line class="gl" x1="${L}" x2="${W - Rr}" y1="${Y(y)}" y2="${Y(y)}"/><text class="ax" x="${L - 8}" y="${Y(y) + 4}" text-anchor="end">${y}</text>`;
      (W < 520 ? [0, 24] : [0, 12, 24, v.length - 1]).forEach(k => g += `<text class="ax" x="${X(k)}" y="${H - 10}" text-anchor="${k === v.length - 1 ? 'end' : 'middle'}">${label(months[k])}</text>`);
      const d = v.map((y, k) => (k ? 'L' : 'M') + X(k).toFixed(1) + ' ' + Y(y).toFixed(1)).join(' ');
      const area = d + ` L${X(v.length - 1)} ${H - B} L${X(0)} ${H - B} Z`;
      svg.innerHTML = `<defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#39c4c4" stop-opacity=".28"/><stop offset="1" stop-color="#39c4c4" stop-opacity="0"/></linearGradient></defs>${g}<path class="area" d="${area}"/><path class="line" d="${d}" pathLength="1"/><circle class="end" cx="${X(v.length - 1)}" cy="${Y(v[v.length - 1])}" r="5"/><line class="cross" y1="${T}" y2="${H - B}" x1="-10" x2="-10"/><circle class="hov" r="5" cx="-10" cy="-10"/>`;
      if (animate && !reduce) svg.querySelector('.line').animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'cubic-bezier(.2,.8,.2,1)' });
      const lm = (v[v.length - 1] - v[v.length - 2]) / v[v.length - 2] * 100, ly = (v[v.length - 1] - v[v.length - 13]) / v[v.length - 13] * 100;
      document.querySelector('[data-chart-v]').textContent = v[v.length - 1].toFixed(1);
      const cd = document.querySelector('[data-chart-d]'); cd.innerHTML = `<em class="${dir(lm)}">${sign(lm)}</em> on the month · <em class="${dir(ly)}">${sign(ly)}</em> on the year`;
      svg.setAttribute('aria-label', `FAO ${FAO_SERIES[i][0]}, monthly, January 2024 to September 2026. Latest ${v[v.length - 1].toFixed(1)}.`);
      tabs.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-selected', k === i));
      svg.onpointermove = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, k = Math.max(0, Math.min(v.length - 1, Math.round((x - L) / (W - L - Rr) * (v.length - 1))));
        const cx = X(k), cy = Y(v[k]); svg.querySelector('.cross').setAttribute('x1', cx); svg.querySelector('.cross').setAttribute('x2', cx); const hv = svg.querySelector('.hov'); hv.setAttribute('cx', cx); hv.setAttribute('cy', cy);
        tip.hidden = false; tip.innerHTML = `<b>${v[k].toFixed(1)}</b>${label(months[k])}`; tip.style.left = (cx / W * 100) + '%'; tip.style.top = (cy / H * 100) + '%'; };
      svg.onpointerleave = () => { tip.hidden = true; svg.querySelector('.hov').setAttribute('cx', -10); svg.querySelector('.cross').setAttribute('x1', -10); svg.querySelector('.cross').setAttribute('x2', -10); };
    }
    tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) render(+b.dataset.i, true); });
    tabs.addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const n = (cur + (e.key === 'ArrowRight' ? 1 : FAO_SERIES.length - 1)) % FAO_SERIES.length; render(n, true); tabs.querySelectorAll('button')[n].focus(); });
    render(0, false);
    let rw = 0; new ResizeObserver(() => { const w = Math.round(svg.clientWidth); if (w && Math.abs(w - rw) > 20) { rw = w; render(cur, false); } }).observe(svg);
    new IntersectionObserver(([en], o) => { if (en.isIntersecting) { render(cur, true); o.disconnect(); } }, { threshold: 0.4 }).observe(svg);
    // import bill counter, paced from the annual figure
    const ib = document.querySelector('[data-importbill]');
    if (ib) { const y0 = Date.UTC(new Date().getUTCFullYear(), 0, 1), perMs = IMPORT_BILL_PER_YEAR / (365 * 864e5);
      const tick = () => { const v = (Date.now() - y0) * perMs; ib.textContent = '$' + (v / 1e12).toFixed(4) + ' trillion'; if (!reduce) requestAnimationFrame(tick); }; tick(); }
  })();

  /* ---------- Scroll storytelling ---------- */
  const draws = document.querySelectorAll('.problem .draw');
  draws.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 200; p.style.strokeDasharray = L; p.style.strokeDashoffset = 0; p.dataset.len = L; });
  const io = new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting || reduce) return;
    en.target.querySelectorAll('.draw').forEach((p, i) => p.animate([{ strokeDashoffset: p.dataset.len }, { strokeDashoffset: 0 }], { duration: 900, delay: i * 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
    if (en.target.hasAttribute('data-run')) en.target.classList.add('run');
    countOnView(en.target);
    io.unobserve(en.target);
  }), { threshold: 0.4 });
  document.querySelectorAll('.problem, [data-run], .lede').forEach(el => io.observe(el));
  function countOnView(el) { el.querySelectorAll('[data-count-on-view]').forEach(t => {
    const n = +t.dataset.countOnView, dec = +(t.dataset.dec || 0), t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 1400); t.textContent = (n * (1 - (1 - k) ** 3)).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }); }
  const countUp = el => el.querySelectorAll('[data-count]').forEach(t => {
    const n = +t.dataset.count, t0 = performance.now(), fmt = v => Math.round(v).toLocaleString('en-US');
    const step = now => { const k = Math.min(1, (now - t0) / 1400); t.textContent = fmt(n * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  const coverIO = new IntersectionObserver(ents => ents.forEach(en => { const was = en.target.classList.contains('in'); en.target.classList.toggle('in', en.isIntersecting); if (en.isIntersecting && !was) countUp(en.target); }), { threshold: 0.25 });
  document.querySelectorAll('.cover-frame').forEach(el => reduce ? el.classList.add('in') : coverIO.observe(el));
  if (reduce) document.querySelectorAll('[data-run]').forEach(el => el.classList.add('run'));

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
  function focusPetal(name) { logo.classList.toggle('focus', !!name); logo.querySelectorAll('.petal').forEach(p => p.classList.toggle('on', !!name && (name === 'all' || p.classList.contains('p-' + name)))); }
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
    const target = petal === 'all' ? mark : mark.querySelector('.p-' + petal);
    petals.forEach(p => p.getAnimations().forEach(a => a.cancel()));
    veil.classList.add('go');
    const out = document.getElementById(current);
    anim(out, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0.4, transform: 'scale(0.985)' }], { duration: 400 });
    anim(vbg, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 150 });
    anim(arcBold, [{ strokeDashoffset: arcBold.dataset.len }, { strokeDashoffset: 0 }], { duration: 700, delay: 100 });
    anim(arcSweep, [{ strokeDashoffset: arcSweep.dataset.len }, { strokeDashoffset: 0 }], { duration: 700, delay: 250 });
    anim(mark, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 600, delay: 350, easing: 'cubic-bezier(.2,.8,.2,1)' });
    petals.forEach(p => { if (petal !== 'all' && p !== target) anim(p, [{ opacity: 1 }, { opacity: p.classList.contains('p-ring') ? 0.35 : 0.12 }], { duration: 400, delay: 800 }); });
    anim(dest, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 850 });
    const glowCol = petal === 'all' ? 'rgba(143,147,255,.9)' : 'rgba(57,196,196,.9)';
    await anim(target, [{ filter: 'none' }, { filter: `drop-shadow(0 0 6px ${glowCol})` }], { duration: 500, delay: 800 });
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

  document.querySelectorAll('.glance').forEach(g => g.querySelectorAll('[data-gl]').forEach(b => b.addEventListener('click', () => {
    g.querySelectorAll('[data-gl]').forEach(x => x.setAttribute('aria-selected', x === b));
    g.querySelectorAll('[data-gl-set]').forEach(o => o.hidden = o.dataset.glSet !== b.dataset.gl);
  })));

  const menu = document.getElementById('menu'), menuBtn = document.getElementById('menu-btn');
  const setMenu = open => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  document.addEventListener('click', e => {
    const tp = e.target.closest('[data-tone-pick]'); if (tp) { setTone(tp.dataset.tonePick); if (!busy) intro(); return; }
    const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); go(a.dataset.go); return; }
    if (e.target.closest('#replay')) { e.preventDefault(); intro(); }
  });

  const start = (location.hash || '').slice(1);
  show(WORLD_PETAL[start] ? start : 'home'); scrollTo(0, 0); setTimeout(() => scrollTo(0, 0), 300);
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (WORLD_PETAL[h]) go(h, false); });
  setTimeout(intro, 150);
})();
