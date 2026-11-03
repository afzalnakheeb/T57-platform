(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { green:'#008b8c', cyan:'#39c4c4', indigo:'#2f2e7d', amber:'#f8b716', night:'#0b1340', sapphire:'#8f93ff', mist:'#c9cdf0' };
  const WORLD_PETAL = { home:'all', 'who-we-serve':'all', governments:'all', financiers:'finance', traders:'trade', sellers:'trade', farmers:'agri', buyers:'trade', enterprises:'agri', 'food-processors':'agri', cooperatives:'agri', collaborators:'all', 'service-providers':'logistics' };
  const WORLD_NAME = { home:'T57.ai', 'who-we-serve':'Who We Serve', governments:'Governments & Regulators', financiers:'Financiers & Investors', traders:'Traders & Aggregators', sellers:'Sellers & Exporters', farmers:'Farmers & Producers', buyers:'Buyers & Importers', enterprises:'Manufacturers & Enterprises', 'food-processors':'Food Processors', cooperatives:'Cooperatives & FPOs', collaborators:'Partners & Collaborators', 'service-providers':'Service Providers' };

  const TP = window.T57_PAGES || { petal: {}, name: {} };
  Object.keys(TP.petal).forEach(k => { if (!(k in WORLD_PETAL)) WORLD_PETAL[k] = TP.petal[k]; });
  Object.keys(TP.name).forEach(k => { if (!(k in WORLD_NAME)) WORLD_NAME[k] = TP.name[k]; });

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
  // Arabic labels for the market board and other text the script writes (pages under /ar set <html lang="ar">).
  const AR = document.documentElement.lang === 'ar';
  // Bahasa Malaysia labels (pages under /ms set <html lang="ms">).
  const MS = document.documentElement.lang === 'ms';
  // Turkish labels (pages under /tr set <html lang="tr">). Turkish writes decimals with a comma and thousands with a point.
  const TR = document.documentElement.lang === 'tr';
  // Hindi labels (pages under /hi set <html lang="hi">). Figures stay in international digits, as in Indian business writing.
  const HI = document.documentElement.lang === 'hi';
  const num = s => TR ? String(s).replace(/[.,]/g, c => c === '.' ? ',' : '.') : String(s);
  const TX = HI ? { 'Food Price Index': 'खाद्य मूल्य सूचकांक', Cereals: 'अनाज', 'Vegetable oils': 'वनस्पति तेल', Dairy: 'डेयरी', Meat: 'मांस', Sugar: 'चीनी',
    'Wheat, US HRW': 'गेहूँ, अमेरिका HRW', 'Wheat, US SRW': 'गेहूँ, अमेरिका SRW', Maize: 'मक्का', 'Rice, Thai 5%': 'चावल, थाई 5%', 'Rice, Viet Nam 5%': 'चावल, वियतनाम 5%',
    Soybeans: 'सोयाबीन', 'Soybean oil': 'सोयाबीन तेल', 'Palm oil': 'पाम तेल', 'Coffee, Arabica': 'कॉफ़ी, अरेबिका', Cocoa: 'कोको', Tea: 'चाय', Beef: 'बीफ़', Chicken: 'चिकन',
    Oranges: 'संतरा', Bananas: 'केला', Urea: 'यूरिया', 'DAP fertilizer': 'DAP खाद', 'Brent crude': 'ब्रेंट कच्चा तेल', Grains: 'अनाज', 'Oils and oilseeds': 'तेल और तिलहन',
    'Sugar and softs': 'चीनी और बागानी फ़सलें', 'Proteins and produce': 'प्रोटीन और ताज़ी उपज', 'Inputs and energy': 'कृषि इनपुट और ऊर्जा',
    Explore: 'एक्सप्लोर', Core: 'कोर', Growth: 'ग्रोथ', Enterprise: 'एंटरप्राइज़', ' (from)': ' (शुरुआती)',
    'on the month': 'मासिक', 'on the year': 'सालाना', 'on a year earlier': 'एक साल पहले की तुलना में', trillion: 'ट्रिलियन', Replay: 'फिर से चलाएँ', Play: 'चलाएँ', Pause: 'रोकें' } : TR ? { 'Food Price Index': 'Gıda Fiyat Endeksi', Cereals: 'Tahıllar', 'Vegetable oils': 'Bitkisel yağlar', Dairy: 'Süt ürünleri', Meat: 'Et', Sugar: 'Şeker',
    'Wheat, US HRW': 'Buğday, ABD HRW', 'Wheat, US SRW': 'Buğday, ABD SRW', Maize: 'Mısır', 'Rice, Thai 5%': 'Pirinç, Tayland %5', 'Rice, Viet Nam 5%': 'Pirinç, Vietnam %5',
    Soybeans: 'Soya fasulyesi', 'Soybean oil': 'Soya yağı', 'Palm oil': 'Palm yağı', 'Coffee, Arabica': 'Kahve, Arabica', Cocoa: 'Kakao', Tea: 'Çay', Beef: 'Sığır eti', Chicken: 'Tavuk',
    Oranges: 'Portakal', Bananas: 'Muz', Urea: 'Üre', 'DAP fertilizer': 'DAP gübresi', 'Brent crude': 'Brent ham petrol', Grains: 'Tahıllar', 'Oils and oilseeds': 'Yağlar ve yağlı tohumlar',
    'Sugar and softs': 'Şeker ve tropikal ürünler', 'Proteins and produce': 'Protein ve taze ürünler', 'Inputs and energy': 'Girdiler ve enerji',
    Explore: 'Keşif', Core: 'Temel', Growth: 'Büyüme', Enterprise: 'Kurumsal', ' (from)': ' (başlangıç)',
    'on the month': 'aylık', 'on the year': 'yıllık', 'on a year earlier': 'bir yıl öncesine göre', trillion: 'trilyon', Replay: 'Yeniden oynat', Play: 'Oynat', Pause: 'Duraklat' } : MS ? { 'Food Price Index': 'Indeks Harga Makanan', Cereals: 'Bijirin', 'Vegetable oils': 'Minyak sayuran', Dairy: 'Tenusu', Meat: 'Daging', Sugar: 'Gula',
    'Wheat, US HRW': 'Gandum, HRW AS', 'Wheat, US SRW': 'Gandum, SRW AS', Maize: 'Jagung', 'Rice, Thai 5%': 'Beras Thai 5%', 'Rice, Viet Nam 5%': 'Beras Vietnam 5%',
    Soybeans: 'Kacang soya', 'Soybean oil': 'Minyak soya', 'Palm oil': 'Minyak sawit', 'Coffee, Arabica': 'Kopi Arabika', Cocoa: 'Koko', Tea: 'Teh', Beef: 'Daging lembu', Chicken: 'Ayam',
    Oranges: 'Oren', Bananas: 'Pisang', Urea: 'Urea', 'DAP fertilizer': 'Baja DAP', 'Brent crude': 'Minyak mentah Brent', Grains: 'Bijirin', 'Oils and oilseeds': 'Minyak dan biji minyak',
    'Sugar and softs': 'Gula dan komoditi lembut', 'Proteins and produce': 'Protein dan hasil segar', 'Inputs and energy': 'Input dan tenaga',
    Explore: 'Teroka', Core: 'Teras', Growth: 'Pertumbuhan', Enterprise: 'Perusahaan', ' (from)': ' (dari)',
    'on the month': 'berbanding bulan lalu', 'on the year': 'berbanding tahun lalu', 'on a year earlier': 'berbanding setahun lalu', trillion: 'trilion', Replay: 'Main semula', Play: 'Main', Pause: 'Jeda' } : AR ? { 'Food Price Index': 'مؤشر أسعار الغذاء', Cereals: 'الحبوب', 'Vegetable oils': 'الزيوت النباتية', Dairy: 'الألبان', Meat: 'اللحوم', Sugar: 'السكر',
    'Wheat, US HRW': 'القمح الأمريكي الصلب', 'Wheat, US SRW': 'القمح الأمريكي الطري', Maize: 'الذرة', 'Rice, Thai 5%': 'الأرز التايلندي 5%', 'Rice, Viet Nam 5%': 'الأرز الفيتنامي 5%',
    Soybeans: 'فول الصويا', 'Soybean oil': 'زيت الصويا', 'Palm oil': 'زيت النخيل', 'Coffee, Arabica': 'البن العربي', Cocoa: 'الكاكاو', Tea: 'الشاي', Beef: 'لحم البقر', Chicken: 'الدجاج',
    Oranges: 'البرتقال', Bananas: 'الموز', Urea: 'اليوريا', 'DAP fertilizer': 'سماد DAP', 'Brent crude': 'خام برنت', Grains: 'الحبوب', 'Oils and oilseeds': 'الزيوت والبذور الزيتية',
    'Sugar and softs': 'السكر والمحاصيل الاستوائية', 'Proteins and produce': 'البروتينات والفواكه', 'Inputs and energy': 'المدخلات والطاقة',
    Explore: 'استكشاف', Core: 'الأساسية', Growth: 'النمو', Enterprise: 'الشركات', ' (from)': ' (ابتداءً من)',
    'on the month': 'على أساس شهري', 'on the year': 'على أساس سنوي', 'on a year earlier': 'عن العام السابق', trillion: 'تريليون', Replay: 'إعادة', Play: 'تشغيل', Pause: 'إيقاف مؤقت' } : {};
  const tx = s => TX[s] || s;
  const DATE_LOCALE = AR ? 'ar-u-ca-gregory-nu-latn' : MS ? 'ms-MY' : TR ? 'tr-TR' : HI ? 'hi-IN' : 'en-US';
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
  // A market page focuses the globe on its country: the globe turns to the hub, zooms in and draws that market's corridors.
  const FOCUS = { riyadh: 'Saudi Arabia', dubai: 'UAE', mumbai: 'India', kl: 'Malaysia', istanbul: 'Türkiye' };
  const FOCUS_TO = ['riyadh', 'dubai', 'mumbai', 'kl', 'istanbul', 'cairo', 'nairobi', 'jakarta'];
  function globeScene(ctx, w, h, t, px, py, focus) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const F = focus && HUBS[focus], e = F ? 1 - Math.pow(1 - Math.min(1, t / 2600), 3) : 0;
    const narrow = w < 700, cx = narrow ? w * 0.6 : w * 0.72, cy = h * (narrow ? 0.62 : 0.54), R = Math.min(h * (narrow ? 0.5 : 0.5), w * (narrow ? 0.62 : 0.32)) * (1 + e * 0.35);
    const halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.5); halo.addColorStop(0, 'rgba(91,95,239,0.22)'); halo.addColorStop(1, 'rgba(11,19,64,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(19,29,85,0.9)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill();
    const sway = F ? Math.sin(t * 0.00008) * 5 : Math.sin(t * 0.00006) * 28;
    const ox = narrow ? 0 : 18, oy = narrow ? 8 : 24; // on wide screens the market sits below-left of centre, clear of the glance panel
    const rot = ((F ? 62 + (F[1] + ox - 62) * e : 62) + sway + (px - 0.5) * 16) * Math.PI / 180, tilt = ((F ? 24 + (F[0] + oy - 24) * e : 24) + (py - 0.5) * 8) * Math.PI / 180;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const proj = (lat, lon) => { const cl = Math.cos(lat), x = cl * Math.sin(lon - rot), y0 = Math.sin(lat), z0 = cl * Math.cos(lon - rot); const y = y0 * ct - z0 * st, z = y0 * st + z0 * ct; return [cx + x * R, cy - y * R, z]; };
    const grow = Math.min(1, t / 1800);
    for (let i = 0; i < GLOBE_DOTS.length; i++) {
      const [la, lo] = GLOBE_DOTS[i], [x, y, z] = proj(la, lo); if (z <= 0) continue;
      ctx.fillStyle = `rgba(143,147,255,${(0.18 + z * 0.7) * grow})`; ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
    }
    ctx.strokeStyle = 'rgba(143,147,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.stroke();
    const rad = d => d * Math.PI / 180;
    (F ? FOCUS_TO.filter(x => x !== focus).map(x => [focus, x]) : ROUTES).forEach(([a, b], k) => {
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
    if (F) {
      const [x, y, z] = proj(rad(F[0]), rad(F[1])), a = Math.min(1, Math.max(0, (t - 1800) / 700)); if (z <= 0) return;
      const p = (t * 0.0004) % 1;
      ctx.strokeStyle = `rgba(240,248,241,${0.8 * (1 - p) * a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 8 + p * 26, 0, 6.283); ctx.stroke();
      ctx.fillStyle = `rgba(240,248,241,${a})`; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.283); ctx.fill();
      ctx.font = '600 12px Gilroy, system-ui, sans-serif'; ctx.textBaseline = 'middle';
      const label = FOCUS[focus].toUpperCase(), tw = ctx.measureText(label).width + label.length * 1.8, lx = Math.min(x + 16, w - tw - 28);
      ctx.fillStyle = `rgba(11,19,64,${0.82 * a})`; ctx.fillRect(lx, y - 13, tw + 20, 26);
      ctx.strokeStyle = `rgba(57,196,196,${0.8 * a})`; ctx.lineWidth = 1; ctx.strokeRect(lx + 0.5, y - 12.5, tw + 19, 25);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.letterSpacing = '1.8px'; ctx.fillText(label, lx + 10, y + 0.5); ctx.letterSpacing = '0px';
    }
  }

  // Honeycomb ledger: a field of hex cells; a trade's blocks light up one after another and link into a chain.
  function chainScene(ctx, w, h, t, px, py) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const narrow = w < 700, r = narrow ? 22 : 30, dx = r * Math.sqrt(3), dy = r * 1.5;
    const ox = (narrow ? w * 0.05 : w * 0.42) + (px - 0.5) * 18, oy = h * 0.08 + (py - 0.5) * 12;
    const cols = Math.ceil((w - ox) / dx) + 1, rows = Math.ceil(h / dy) + 1;
    const hex = (x, y, rr) => { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } ctx.closePath(); };
    const at = (c, rw) => [ox + c * dx + (rw % 2) * dx / 2, oy + rw * dy];
    const grow = Math.min(1, t / 1500);
    for (let rw = 0; rw < rows; rw++) for (let c = 0; c < cols; c++) {
      const [x, y] = at(c, rw), fade = narrow ? 0.5 : Math.min(1, (x - w * 0.42) / (w * 0.2) + 0.2);
      ctx.strokeStyle = `rgba(143,147,255,${0.16 * fade * grow})`; ctx.lineWidth = 1; hex(x, y, r - 2); ctx.stroke();
    }
    const path = [[1, 2], [2, 3], [3, 3], [4, 4], [5, 4], [6, 5], [7, 5], [8, 6], [9, 6], [10, 7]].map(([c, rw]) => at(c + (narrow ? 0 : 1), rw + (narrow ? 4 : 1)));
    const cycle = 9000, p = (t % cycle) / cycle, lit = Math.floor(p * path.length * 1.25);
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(57,196,196,0.6)'; ctx.beginPath();
    path.forEach(([x, y], i) => { if (i <= lit && i < path.length) i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    path.forEach(([x, y], i) => {
      if (i > lit) return;
      const age = Math.min(1, (p * path.length * 1.25 - i)), last = i === Math.min(lit, path.length - 1);
      ctx.fillStyle = `rgba(57,196,196,${0.12 + 0.18 * age})`; hex(x, y, r - 3); ctx.fill();
      ctx.strokeStyle = last ? 'rgba(240,248,241,0.95)' : 'rgba(57,196,196,0.9)'; ctx.lineWidth = last ? 2 : 1.4; hex(x, y, r - 3); ctx.stroke();
      ctx.fillStyle = 'rgba(240,248,241,0.85)'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.283); ctx.fill();
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
    const s = { cv, ctx, fn: { seed: seedScene, value: valueScene, globe: globeScene, bids: bidsScene, market: marketScene, chain: chainScene }[cv.dataset.scene], t0: performance.now(), px: 0.7, py: 0.5, visible: false, w: 0, h: 0 };
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); s.w = r.width; s.h = r.height; cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); if (reduce && s.w && s.h) s.fn(ctx, s.w, s.h, 99999, s.px, s.py, cv.dataset.focus); };
    new ResizeObserver(size).observe(cv);
    cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return; s.px = (e.clientX - r.left) / r.width; s.py = (e.clientY - r.top) / r.height; });
    new IntersectionObserver(([en]) => { s.visible = en.isIntersecting; }).observe(cv);
    scenes.push(s);
  });
  function loop(now) {
    scenes.forEach(s => { if (s.visible && s.w && s.h && !reduce && !s.cv.closest('[hidden]')) s.fn(s.ctx, s.w, s.h, Math.max(0, now - s.t0), s.px, s.py, s.cv.dataset.focus); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- Market board ---------- */
  const fmtPrice = (v, unit) => num((unit === '/kg' ? v.toFixed(2) : v >= 1000 ? Math.round(v).toLocaleString('en-US') : v.toFixed(1)).replace(/\.0$/, ''));
  const sign = v => TR ? (v >= 0 ? '▲ +%' : '▼ −%') + num(Math.abs(v).toFixed(1)) : (v >= 0 ? '▲ +' : '▼ ') + v.toFixed(1) + '%';
  const dir = v => (v >= 0 ? 'up' : 'down');
  (function board() {
    const last = FAO[FAO.length - 1], prev = FAO[FAO.length - 2], yago = FAO[FAO.length - 13];
    const mom = (last[1] - prev[1]) / prev[1] * 100, yoy = (last[1] - yago[1]) / yago[1] * 100;
    document.querySelectorAll('[data-fpi-latest]').forEach(e => e.textContent = num((+last[1]).toFixed(1)));
    document.querySelectorAll('[data-fpi-mom]').forEach(e => { e.textContent = sign(mom); e.className = dir(mom); });
    document.querySelectorAll('[data-fpi-yoy]').forEach(e => e.innerHTML = TR ? `${tx('on a year earlier')} <bdi dir="ltr">${yoy >= 0 ? '+' : '−'}%${num(Math.abs(yoy).toFixed(1))}</bdi>` : `<bdi dir="ltr">${(yoy >= 0 ? '+' : '') + yoy.toFixed(1)}%</bdi> ${tx('on a year earlier')}`);
    const spark = document.querySelector('[data-fpi-spark]');
    if (spark) { const v = FAO.map(r => +r[1]), lo = Math.min(...v), hi = Math.max(...v); spark.setAttribute('d', v.map((y, i) => (i ? 'L' : 'M') + (i / (v.length - 1) * 300).toFixed(1) + ' ' + (64 - (y - lo) / (hi - lo) * 58).toFixed(1)).join(' ')); }
    // ticker
    const tk = document.querySelector('[data-ticker]');
    if (tk) { const items = PINK.map(p => `<span class="tk"><b>${tx(p.name)}</b> $${fmtPrice(p.last, p.unit)}${p.unit} <em class="${dir(p.ch)}">${sign(p.ch)}</em></span>`).join('');
      tk.innerHTML = `<div class="tk-run">${items}</div><div class="tk-run" aria-hidden="true">${items}</div>`; }
    // homepage price tape: the six FAO indices (with a 12-month trend line), then the World Bank food benchmarks
    const tp = document.querySelector('[data-tape]');
    if (tp) {
      const spk = col => { const v = FAO.slice(-12).map(r => +r[col]), lo = Math.min(...v), hi = Math.max(...v) || 1;
        return `<svg class="tp-spk" viewBox="0 0 44 16" aria-hidden="true"><path d="${v.map((y, i) => (i ? 'L' : 'M') + (i * 4).toFixed(1) + ' ' + (14 - (y - lo) / ((hi - lo) || 1) * 12).toFixed(1)).join(' ')}"/></svg>`; };
      const fao = FAO_SERIES.map(([n, col]) => { const a = +FAO[FAO.length - 2][col], b = +FAO[FAO.length - 1][col], ch = (b - a) / a * 100;
        return `<li class="tp-i"><span class="tp-src">FAO</span><b>${tx(n)}</b><span class="tp-p">${num(b.toFixed(1))}</span>${spk(col).replace('tp-spk', 'tp-spk ' + dir(ch))}<em class="${dir(ch)}">${sign(ch)}</em></li>`; }).join('');
      const wb = PINK.filter(p => p.group !== 'Inputs and energy').map(p => `<li class="tp-i"><b>${tx(p.name)}</b><span class="tp-p">$${fmtPrice(p.last, p.unit)}<small>${p.unit}</small></span><em class="${dir(p.ch)}">${sign(p.ch)}</em></li>`).join('');
      const run = fao + wb;
      tp.innerHTML = `<ul class="tp-run">${run}</ul><ul class="tp-run" aria-hidden="true">${run}</ul>`;
      const pb = document.querySelector('[data-tape-pause]'), band = tp.closest('.tape');
      if (pb) pb.addEventListener('click', () => { const on = band.classList.toggle('paused'); pb.setAttribute('aria-pressed', on); pb.textContent = tx(on ? 'Play' : 'Pause'); });
    }
    // movers
    const mv = document.querySelector('[data-movers]');
    if (mv) mv.innerHTML = [...PINK].filter(p => p.group !== 'Inputs and energy').sort((a, b) => Math.abs(b.ch) - Math.abs(a.ch)).slice(0, 6)
      .map(p => `<li><span class="mv-n">${tx(p.name)}</span><span class="mv-p">$${fmtPrice(p.last, p.unit)}${p.unit}</span><span class="mv-c ${dir(p.ch)}">${sign(p.ch)}</span><i class="mv-bar ${dir(p.ch)}" style="--w:${Math.min(1, Math.abs(p.ch) / 10)}"></i></li>`).join('');
    // heat tiles, grouped
    const ht = document.querySelector('[data-heat]');
    if (ht) { const groups = [...new Set(PINK.map(p => p.group))];
      ht.innerHTML = groups.map(g => `<div class="hg"><span class="hg-k">${tx(g)}</span><div class="hg-tiles">${PINK.filter(p => p.group === g).map(p => {
        const a = Math.min(1, Math.abs(p.ch) / 8);
        return `<div class="tile ${dir(p.ch)}" style="--a:${(0.12 + a * 0.6).toFixed(2)}"><span class="t-n">${tx(p.name)}</span><span class="t-p">$${fmtPrice(p.last, p.unit)}<small>${p.unit}</small></span><span class="t-c">${sign(p.ch)}</span></div>`; }).join('')}</div></div>`).join(''); }
    // chart with tabs
    const svg = document.querySelector('[data-chart]'), tabs = document.querySelector('[data-tabs]'), tip = document.querySelector('[data-chart-tip]');
    if (!svg) return;
    let W = 720, H = 300; const L = 44, Rr = 12, T = 16, B = 34, months = FAO.map(r => r[0]);
    const label = m => new Date(m + '-01T00:00:00Z').toLocaleDateString(DATE_LOCALE, { month: 'short', year: 'numeric', timeZone: 'UTC' });
    let cur = 0;
    tabs.innerHTML = FAO_SERIES.map(([n], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${tx(n)}</button>`).join('');
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
      document.querySelector('[data-chart-v]').textContent = num(v[v.length - 1].toFixed(1));
      const cd = document.querySelector('[data-chart-d]'); cd.innerHTML = `<em class="${dir(lm)}">${sign(lm)}</em> ${tx('on the month')} · <em class="${dir(ly)}">${sign(ly)}</em> ${tx('on the year')}`;
      svg.setAttribute('aria-label', `FAO ${FAO_SERIES[i][0]}, monthly, January 2024 to September 2026. Latest ${v[v.length - 1].toFixed(1)}.`);
      tabs.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-selected', k === i));
      svg.onpointermove = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, k = Math.max(0, Math.min(v.length - 1, Math.round((x - L) / (W - L - Rr) * (v.length - 1))));
        const cx = X(k), cy = Y(v[k]); svg.querySelector('.cross').setAttribute('x1', cx); svg.querySelector('.cross').setAttribute('x2', cx); const hv = svg.querySelector('.hov'); hv.setAttribute('cx', cx); hv.setAttribute('cy', cy);
        tip.hidden = false; tip.innerHTML = `<b>${num(v[k].toFixed(1))}</b>${label(months[k])}`; tip.style.left = (cx / W * 100) + '%'; tip.style.top = (cy / H * 100) + '%'; };
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
      const tick = () => { const v = (Date.now() - y0) * perMs; ib.textContent = AR ? (v / 1e12).toFixed(4) + ' ' + tx('trillion') + ' دولار' : MS ? 'US$' + (v / 1e12).toFixed(4) + ' trilion' : TR ? num((v / 1e12).toFixed(4)) + ' trilyon $' : HI ? '$' + (v / 1e12).toFixed(4) + ' ट्रिलियन' : '$' + (v / 1e12).toFixed(4) + ' trillion'; if (!reduce) requestAnimationFrame(tick); }; tick(); }
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
    const step = now => { const k = Math.min(1, (now - t0) / 1400); t.textContent = num((n * (1 - (1 - k) ** 3)).toFixed(dec)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }); }
  const countUp = el => el.querySelectorAll('[data-count]').forEach(t => {
    const n = +t.dataset.count, t0 = performance.now(), fmt = v => Math.round(v).toLocaleString(TR ? 'tr-TR' : 'en-US');
    const step = now => { const k = Math.min(1, (now - t0) / 1400); t.textContent = fmt(n * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  const coverIO = new IntersectionObserver(ents => ents.forEach(en => { const was = en.target.classList.contains('in'); en.target.classList.toggle('in', en.isIntersecting); if (en.isIntersecting && !was) countUp(en.target); }), { threshold: 0.25 });
  document.querySelectorAll('.cover-frame, .arr-frame, .pb-frame').forEach(el => reduce ? el.classList.add('in') : coverIO.observe(el));
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
  let current = null, busy = false;

  function setSub(li, open) { const b = li.querySelector('.sub-t'), u = li.querySelector('.menu-sub'); if (!b || !u) return; b.setAttribute('aria-expanded', open); u.hidden = !open; }
  function show(name) {
    document.querySelectorAll('.world').forEach(w => w.hidden = w.id !== name);
    // The header pill marks the audience you are on; the menu marks your section (and audience) wherever you are in it.
    const site = (TP.site || {})[name] || name, aud = !!document.querySelector(`.menu-aud a[data-go="${site}"]`);
    const quick = !!document.querySelector(`.worlds a[data-go="${site}"]:not(.w-all)`);
    document.querySelectorAll('.worlds a').forEach(a => { const on = a.dataset.go === site || (a.classList.contains('w-all') && aud && !quick); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const PAR = TP.parent || {}, chain = [name]; while (PAR[chain[chain.length - 1]]) chain.push(PAR[chain[chain.length - 1]]);
    const sec = chain[chain.length - 1];
    document.querySelectorAll('.menu-aud a[data-go], .menu-l0 > li > a[data-go]').forEach(a => { const on = a.dataset.go === site || a.dataset.go === sec || (aud && a.dataset.go === 'who-we-serve'); if (on) a.setAttribute('aria-current', a.dataset.go === name ? 'page' : 'true'); else a.removeAttribute('aria-current'); });
    document.querySelectorAll('.menu-start a[data-go]').forEach(a => { if (a.dataset.go === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.querySelectorAll('.menu-sub a[data-go]').forEach(a => { const k = a.dataset.go; if (k === name) a.setAttribute('aria-current', 'page'); else if (chain.includes(k) && k !== sec) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    document.querySelectorAll('.menu-l0 > li.has-sub').forEach(li => setSub(li, li.querySelector(':scope > a').dataset.go === sec));
    document.querySelector('.hdr .demo').setAttribute('href', '#cta-' + name);
    const sc = scenes.find(s => s.cv.closest('.world').id === name); if (sc) { sc.t0 = performance.now(); if (reduce && sc.w && sc.h) sc.fn(sc.ctx, sc.w, sc.h, 99999, sc.px, sc.py, sc.cv.dataset.focus); }
    current = name; railUpdate();
  }
  const anim = (el, kf, o) => el.animate(kf, Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.65,0,.35,1)' }, o)).finished;

  // Two kinds of move. Between microsites, the logo covers the page, the next world's petal lights up,
  // and the new page opens out of the logo's petal shell. Inside a microsite, the header stays put,
  // its petal for the next page pulses and only the content lifts out and back in.
  const SITE = TP.site || {};
  const sameSite = name => current && SITE[name] && SITE[name] === SITE[current];
  const veilPetals = [...mark.querySelectorAll('.petal')];
  const clearAll = els => els.forEach(el => el.getAnimations().forEach(a => a.cancel()));
  // While content lifts, the page behind it takes the colour of the top of the page, so light and dark pages never flash white.
  const groundTo = () => { const m = document.getElementById('main'); let el = m && m.querySelector('.world'); for (let i = 0; el && i < 4; i++, el = el.firstElementChild) { const c = getComputedStyle(el).backgroundColor; if (c && c !== 'transparent' && !c.endsWith(', 0)')) { document.body.style.backgroundColor = c; return; } } };

  // If a transition is already running (the intro, an arrival, or a leave that is still waiting on the network),
  // a click goes straight to its page, so a tap is never swallowed.
  async function go(name, href) {
    if (busy) { location.href = href; return; }
    if (name === current) { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (reduce) { location.href = href; return; }
    busy = true;
    try { await leave(name, href); } catch (e) { location.href = href; }
  }
  async function leave(name, href, label) {
    const main = document.getElementById('main');
    if (!label && sameSite(name)) {
      try { sessionStorage.setItem('t57-go', 'lift:' + name); } catch (e) {}
      const hp = logo.querySelector('.p-' + (WORLD_PETAL[name] || 'all')) || logo;
      groundTo();
      hp.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-in-out' });
      const wp = document.getElementById('wipe');
      await wp.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished;
      location.href = href;
      addEventListener('pageshow', e => { if (e.persisted) { wp.getAnimations().forEach(a => a.cancel()); clearAll([main]); busy = false; } }, { once: true });
      return;
    }
    try { sessionStorage.setItem('t57-go', name); } catch (e) {}
    const petal = WORLD_PETAL[name];
    const target = (petal && petal !== 'all' && mark.querySelector('.p-' + petal)) || mark;
    dest.removeAttribute('lang'); dest.textContent = label || WORLD_NAME[name];
    clearAll(veilPetals);
    veil.classList.add('go');
    anim(main, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0.5, transform: 'scale(0.985)' }], { duration: 380 });
    anim(vbg, [{ opacity: 0 }, { opacity: 1 }], { duration: 340 });
    await anim(mark, [{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 280, delay: 40, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (target !== mark) anim(target, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
    anim(dest, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 280 });
    await anim(target, [{ filter: 'none' }, { filter: 'drop-shadow(0 0 8px rgba(57,196,196,.9))' }], { duration: 180 });
    location.href = href;
    addEventListener('pageshow', e => { if (e.persisted) { veil.classList.remove('go'); clearAll([vbg, mark, dest, main, ...veilPetals]); busy = false; } }, { once: true });
  }

  // Arriving from another microsite: the page waits under the logo, then the logo opens and the page shows
  // through a hole shaped like its petal shell, growing from the logo's size until it clears the screen.
  // The hole is sized frame by frame so it runs the same in every browser.
  async function arrive(name) {
    busy = true;
    dest.removeAttribute('lang'); dest.textContent = WORLD_NAME[name] || '';
    veil.classList.add('go');
    document.documentElement.classList.remove('arriving');
    const hold = (el, k) => el.animate([k, k], { duration: 10, fill: 'forwards' });
    hold(vbg, { opacity: 1 }); hold(mark, { opacity: 1, transform: 'scale(1)' }); hold(dest, { opacity: 1 });
    await new Promise(r => setTimeout(r, 60));
    const start = mark.getBoundingClientRect().width * 0.9, end = Math.hypot(innerWidth, innerHeight) * 2.4, dur = 620;
    const setSize = w => { const v = w.toFixed(1) + 'px auto, 100% 100%'; vbg.style.webkitMaskSize = v; vbg.style.maskSize = v; };
    setSize(start); veil.classList.add('reveal');
    const lines = [...document.querySelectorAll('#' + name + ' .hero h1 .ln, #' + name + ' .hero .std, #' + name + ' .hero .actions')];
    lines.forEach((l, i) => l.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 220 + i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
    anim(dest, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    // the logo grows with the hole for the first part, then fades, so it seems to open into the page
    anim(mark, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0.9, transform: 'scale(1.5)', offset: 0.35 }, { opacity: 0, transform: 'scale(3)' }], { duration: 520, easing: 'cubic-bezier(.4,0,.6,1)' });
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    await new Promise(res => { const t0 = performance.now(); const step = now => { const t = Math.min(1, (now - t0) / dur); setSize(start + (end - start) * ease(t)); t < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); });
    clearAll([vbg, mark, dest, ...veilPetals]);
    veil.classList.remove('go', 'reveal'); vbg.style.webkitMaskSize = vbg.style.maskSize = '';
    busy = false;
  }

  // Arriving from a page in the same microsite: the content rises into place under the header.
  function liftIn() {
    const main = document.getElementById('main');
    groundTo();
    const wp = document.getElementById('wipe');
    wp.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 560, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' }).finished.then(() => wp.getAnimations().forEach(a => a.cancel()));
    document.documentElement.classList.remove('lifting');
    main.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: 180, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }).finished.then(() => { document.body.style.backgroundColor = ''; });
  }

  /* ---------- Logo intro: the five petals assemble into the mark ---------- */
  const CENTER = [898, 540];
  const PC = { agri:[898, 617], logistics:[975, 566], trade:[952, 470], tech:[847, 470], finance:[822, 567] };
  // A tap, key press or scroll during the intro skips straight to the page.
  let introOn = false;
  function endIntro() {
    if (!introOn) return; introOn = false;
    [vbg, mark, dest, ...mark.querySelectorAll('.petal')].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    logo.querySelectorAll('.petal').forEach(p => p.style.opacity = '');
    const wm = logo.querySelector('.wordmark'); if (wm) wm.style.opacity = '';
    veil.classList.remove('go');
    busy = false;
  }
  ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(t => addEventListener(t, endIntro, { passive: true }));
  async function intro() {
    if (reduce) return;
    busy = true; introOn = true;
    try { await introRun(); } catch (e) { /* skipped: endIntro has restored the page */ }
    introOn = false;
  }
  async function introRun() {
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
      ], { duration: 620, delay: 80 + i * 90, easing: 'cubic-bezier(.2,.9,.25,1.15)', fill: 'both' }).finished;
    });
    dest.lang = 'en'; dest.textContent = 'T57.ai';
    await Promise.all(ps);
    if (!introOn) return;
    ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
    dest.animate([{ opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.24em' }], { duration: 450, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' });
    await new Promise(r => setTimeout(r, 320));
    if (!introOn) return;
    // fly the mark to the header logo
    const from = mark.getBoundingClientRect(), to = logo.getBoundingClientRect();
    const toW = to.height * (250 / 244);
    const dx = (to.left + toW / 2) - (from.left + from.width / 2), dy = (to.top + to.height / 2) - (from.top + from.height / 2), s = toW / from.width;
    logo.querySelectorAll('.petal').forEach(p => p.style.opacity = '0');
    const wm = logo.querySelector('.wordmark'); wm.style.opacity = '0';
    dest.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
    vbg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: 120, fill: 'forwards' });
    await mark.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }], { duration: 600, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished;
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
    const h1 = g.closest('.hero').querySelector('h1');
    if (b.dataset.h1 && h1) { h1.dataset.base ??= h1.innerHTML; h1.innerHTML = '<span class="ln">' + b.dataset.h1 + '</span>'; }
  })));

  // Pricing: monthly / annual switch on the plan table
  document.querySelectorAll('.bill').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('[data-bill]'); if (!b) return;
    g.querySelectorAll('[data-bill]').forEach(x => x.setAttribute('aria-pressed', x === b));
    g.parentElement.querySelectorAll('[data-bill-row]').forEach(r => r.hidden = r.dataset.billRow !== b.dataset.bill);
  }));

  // Pricing: ROI calculator. Standard list prices; annual billing is ten months for twelve, Enterprise at its starting price.
  document.querySelectorAll('[data-roi]').forEach(f => {
    const PLANS = [['Explore', 199, .0075, 1990], ['Core', 499, .006, 4990], ['Growth', 749, .004, 7490], ['Enterprise', 1499, .002, 1499 * 12]];
    const MAX = { trades: 10000, value: 10000000 };
    const usd = n => (n < 0 ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString(TR ? 'tr-TR' : 'en-US');
    const v = k => { const el = f.querySelector(`[data-roi-in="${k}"]`); return el.tagName === 'SELECT' ? el.value : Math.min(MAX[k] || Infinity, Math.max(0, +el.value || 0)); };
    const out = k => f.querySelector(`[data-r="${k}"]`);
    function run() {
      f.querySelectorAll('input[type=range]').forEach(r => f.querySelector(`[data-roi-out="${r.dataset.roiIn}"]`).textContent = r.value + '%');
      const vol = v('trades') * v('value') * 12, c = k => v(k) / 100;
      const time = v('days') * v('dayrate') * 12 * c('c_days');
      const rework = v('trades') * 12 * v('rework') * c('c_rework');
      const margin = vol * c('margin') * c('c_margin');
      const fin = vol * c('rate') * (v('wait') / 365) - vol * c('rate') * (1 - c('c_rate')) * (v('wait') * (1 - c('c_wait')) / 365);
      // with no trades entered there is nothing to compare, so show dashes rather than a result
      if (!vol) { ['net', 'gross', 'plan', 'fees'].forEach(k => out(k).textContent = '—'); out('net').classList.remove('neg'); out('rows').innerHTML = ''; return; }
      const gross = time + rework + margin + fin;
      const costs = PLANS.map(([n, m, fee, yr]) => [n, yr + vol * fee]);
      const best = costs.reduce((a, b) => b[1] < a[1] ? b : a);
      out('net').textContent = usd(gross - best[1]);
      out('net').classList.toggle('neg', gross - best[1] < 0);
      out('gross').textContent = usd(gross);
      out('plan').textContent = tx(best[0]);
      out('fees').textContent = usd(best[1]) + (best[0] === 'Enterprise' ? tx(' (from)') : '');
      out('ctx').textContent = AR ? `${v('role')} في ${v('market')}، بحجم تجارة شهري قدره ${usd(vol / 12)}.` : MS ? `Bagi ${v('role').toLowerCase()} di ${v('market')}, dengan dagangan ${usd(vol / 12)} sebulan.` : HI ? `${v('market')} में एक ${v('role')} के लिए, हर महीने ${usd(vol / 12)} के व्यापार पर।` : TR ? `${v('market')} pazarındaki bir ${v('role').toLocaleLowerCase('tr-TR')} için, aylık ${usd(vol / 12)} ticaret hacmiyle.` : `For a ${v('role').toLowerCase()} in ${v('market')}, on ${usd(vol / 12)} of trade a month.`;
      out('rows').innerHTML = costs.map(([n, t]) => `<tr${n === best[0] ? ' class="on"' : ''}><th scope="row">${tx(n)}</th><td>${usd(t)}${n === 'Enterprise' ? tx(' (from)') : ''}</td></tr>`).join('');
    }
    f.addEventListener('input', run); run();
    f.querySelector('[data-roi-print]').addEventListener('click', () => print());
  });

  // Glossary: filter as you type
  document.querySelectorAll('[data-gl-filter]').forEach(inp => {
    const wrap = inp.closest('.wrap'), items = [...wrap.querySelectorAll('[data-gl-term]')], none = wrap.querySelector('[data-gl-none]');
    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase(); let n = 0;
      items.forEach(el => { const hit = !q || el.dataset.glTerm.includes(q); el.hidden = !hit; n += hit; });
      none.hidden = n > 0;
    });
  });

  // Help Center: search guides, how-tos, FAQs and glossary terms
  document.querySelectorAll('[data-hs]').forEach(inp => {
    const idx = JSON.parse(inp.dataset.hsIndex || '[]'), res = inp.closest('form').querySelector('[data-hs-res]');
    const where = { 'help-start': 'Getting started', 'help-howto': 'How-to', 'help-faq': 'FAQ', 'res-glossary': 'Glossary' };
    const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    inp.addEventListener('input', () => {
      const words = inp.value.trim().toLowerCase().split(/\s+/).filter(w => w.length > 1);
      if (!words.length) { res.hidden = true; return; }
      const hits = idx.filter(([t]) => words.every(w => t.toLowerCase().includes(w))).slice(0, 8);
      res.innerHTML = hits.length ? hits.map(([t, g]) => `<li><a href="#${g}" data-go="${g}"><b>${esc(t)}</b><span>${where[g] || ''}</span></a></li>`).join('')
        : '<li class="hs-none">No match yet. Try fewer words, or contact support.</li>';
      res.hidden = false;
    });
  });

  // Site search: the header icon (or "/" or Ctrl+K) opens a panel that searches every page's name, summary,
  // headings and FAQ questions. The index loads on first open.
  const srch = document.getElementById('srch'), srchBtn = document.getElementById('srch-btn');
  if (srch && srch.showModal) {
    // the 404 page's search button opens the same panel
    document.querySelectorAll('[data-open-search]').forEach(b => b.addEventListener('click', () => srchBtn && srchBtn.click()));
    const q = document.getElementById('srch-q'), list = document.getElementById('srch-res'), none = document.getElementById('srch-none'), kick = document.getElementById('srch-k');
    const POP = ['who-we-serve', 'buyers', 'sellers', 'financiers', 'governments', 'pricing', 'club-membership', 'contact-demo'];
    // Everyday words are dropped, and common ways of asking map onto the words the pages use.
    const STOP = new Set(['how', 'much', 'does', 'do', 'it', 'the', 'what', 'is', 'are', 'can', 'an', 'for', 'to', 'of', 'in', 'on', 'my', 'me', 'you', 'your', 'with', 'and', 'or', 'about', 'which', 'who', 'where', 'when', 'why', 'there', 'get', 'use', 'i']);
    const SYN = { join: ['apply', 'member', 'regist'], founder: ['founder', 'leadership'], founded: ['founder', 'leadership'], logistics: ['logistic', 'freight', 'forwarder'], farmer: ['farmer', 'producer'], farmers: ['farmer', 'producer'], dashboard: ['dashboard', 'monitor', 'view'], halal: ['halal', 'certif'], cost: ['pric', 'fee', 'plan'], costs: ['pric', 'fee', 'plan'], price: ['pric', 'fee', 'plan'], prices: ['pric', 'fee', 'plan'], fee: ['fee', 'pric'], fees: ['fee', 'pric'], login: ['apply', 'member'], signin: ['apply', 'member'], log: ['apply', 'member'], signup: ['apply', 'member'], register: ['apply', 'regist', 'member'],
      supermarket: ['retail', 'buyer', 'horeca'], supermarkets: ['retail', 'buyer', 'horeca'], retail: ['retail', 'buyer'], restaurant: ['horeca', 'buyer'], hotel: ['horeca', 'buyer'], bank: ['bank', 'financ', 'lender'], banks: ['bank', 'financ', 'lender'], lender: ['lender', 'financ'], loan: ['financ', 'lender'], fpo: ['fpo', 'cooperativ'], coop: ['cooperativ', 'fpo'], 'co-op': ['cooperativ', 'fpo'], ministry: ['government'], demo: ['demo'] };
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    // Arabic: drop short vowels and tatweel, and fold alef, yaa and taa marbuta forms, so spelling variants still match.
    const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u0652\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
    let IDX = null, sel = -1;
    const load = () => IDX ? Promise.resolve(IDX) : fetch(AR ? '/proto/search-ar.json' : MS ? '/proto/search-ms.json' : TR ? '/proto/search-tr.json' : HI ? '/proto/search-hi.json' : '/proto/search.json').then(r => r.json()).then(d => (IDX = d.map(([id, route, name, sec, h1, ans, hd, faq]) => ({ id, route, name, sec, ans, f: [norm(name), norm(h1), norm(hd + ' ' + faq), norm(ans + ' ' + sec)] }))));
    const mark = (t, words) => { let h = esc(t); words.forEach(w => { h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return h; };
    const row = (p, words) => `<li role="option" aria-selected="false"><a href="${p.route}" data-go="${p.id}">${p.sec ? `<small>${esc(p.sec)}</small>` : ''}<b>${mark(p.name, words)}</b><span>${mark(p.ans, words)}</span></a></li>`;
    const pick = n => { const it = [...list.children]; if (!it.length) return; sel = (n + it.length) % it.length; it.forEach((li, k) => li.setAttribute('aria-selected', k === sel ? 'true' : 'false')); it[sel].scrollIntoView({ block: 'nearest' }); };
    const run = () => {
      const words = norm(q.value).trim().split(/\s+/).filter(w => w.length > 1 && !(!AR && !MS && !TR && !HI && STOP.has(w))); sel = -1;
      if (!words.length) { kick.textContent = AR ? 'الأكثر زيارة' : MS ? 'Paling dilawati' : TR ? 'En çok ziyaret edilenler' : HI ? 'सबसे ज़्यादा देखे गए' : 'Popular'; kick.hidden = false; none.hidden = true; list.innerHTML = POP.map(id => IDX.find(p => p.id === id)).filter(Boolean).map(p => row(p, [])).join(''); return; }
      const W = [8, 5, 2, 1], hits = [];
      // blog articles rank below the product pages they discuss
      // a page needs at least half the words; pages that match more words rank higher
      const need = Math.ceil(words.length / 2);
      IDX.forEach(p => { let s = 0, n = 0; for (const w of words) { let m = 0; const vs = [w, ...(SYN[w] || [])]; if (w.length > 4 && w.endsWith('s')) vs.push(w.slice(0, -1)); for (const v of vs) p.f.forEach((f, k) => { if (f.includes(v)) m += W[k] * (new RegExp('\\b' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(f) ? 2 : 1); }); if (m) { s += m; n++; } } if (n < need) return; s *= n / words.length; hits.push([p.route.includes('/resources/blog/') ? s / 2 : s, p]); });
      hits.sort((a, b) => b[0] - a[0]);
      kick.textContent = !hits.length ? '' : AR ? (hits.length === 1 ? 'صفحة واحدة' : hits.length === 2 ? 'صفحتان' : `${hits.length} ${hits.length <= 10 ? 'صفحات' : 'صفحة'}`) : MS ? `${hits.length} halaman` : TR ? `${hits.length} sayfa` : HI ? `${hits.length} पेज` : `${hits.length} page${hits.length === 1 ? '' : 's'}`; kick.hidden = !hits.length; none.hidden = !!hits.length;
      list.innerHTML = hits.slice(0, 12).map(([, p]) => row(p, words)).join('');
    };
    const open = () => { if (srch.open) return; srch.showModal(); q.value = ''; q.focus(); load().then(run).catch(() => { none.hidden = false; }); };
    srchBtn && srchBtn.addEventListener('click', open);
    q.addEventListener('input', () => IDX && run());
    q.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); pick(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); pick(sel - 1); }
      else if (e.key === 'Enter') { const a = list.children[sel < 0 ? 0 : sel]?.querySelector('a'); if (a) { e.preventDefault(); a.click(); } }
    });
    srch.addEventListener('click', e => { if (e.target === srch || e.target.closest('[data-srch-close]') || e.target.closest('a[data-go]')) srch.close(); });
    srch.addEventListener('close', () => srchBtn && srchBtn.focus({ preventScroll: true }));
    addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); open(); }
    });
  }

  // Forms: sign-up, demo, partner, contact, support and subscribe all post to /api/forms.
  // If the backend is not switched on yet (503), the visitor is offered an email with their answers instead.
  const FORM = {
    join: ['Get started', 'Join T57', 'Founding members get a 90-day free trial at launch. Tell us about your business and your country team will contact you.', 'Apply for membership', ['name', 'email', 'company', 'role']],
    demo: ['Request a demo', 'See T57 on your own products', 'A 30-minute demo with a specialist from your country team.', 'Book my demo', ['name', 'email', 'company']],
    partner: ['Partnerships', 'Become a T57 partner', 'Tell us about your services, licences and markets.', 'Submit application', ['name', 'email', 'company', 'type']],
    contact: ['Contact', 'Talk to T57', 'We will connect you with the right team.', 'Send', ['name', 'email']],
    support: ['Help Center', 'Contact support', 'Have your company name and trade reference ready, so we can help faster.', 'Send to support', ['name', 'email']],
    invest: ['Investors', 'Request the investor pack', 'For qualified investors. We send the teaser and presentation, then arrange a call with the founder and access to the memorandum and data room under NDA.', 'Request the pack', ['name', 'email', 'company', 'investor']],
    subscribe: ['T57 Insights', 'Subscribe to T57 Insights', 'Market insight on food trade, finance and AI. Unsubscribe at any time.', 'Subscribe', ['email']],
    // government and bank briefings are demo requests with their own wording
    briefing: ['Public sector', 'Request a government briefing', 'A 45-minute session with our public-sector team, under NDA if you need it.', 'Request my briefing', ['name', 'email', 'company']],
    pipeline: ['Banks and financiers', 'Request a pipeline briefing', 'A 30-minute walk-through of a verified deal file, with a specialist from our finance partnerships team.', 'Request my briefing', ['name', 'email', 'company']],
  };
  const API_KIND = { briefing: 'demo', pipeline: 'demo' };
  const DONE = { join: 'Thank you. Your country team will contact you within two working days.', demo: 'Thank you. A specialist will contact you to confirm a time.', partner: 'Thank you. Our partnerships team will be in touch.',
    contact: 'Thank you. We will reply within two working days.', support: 'Thank you. Our support team has your request.', subscribe: 'Thank you. You are subscribed to T57 Insights.',
    invest: 'Thank you. Our investor relations team will send the pack and contact you within two working days.' };
  if (MS) {
    Object.assign(FORM, {
      join: ['Mulakan', 'Sertai T57', 'Ahli pengasas menikmati percubaan percuma 90 hari semasa pelancaran. Ceritakan tentang perniagaan anda dan pasukan negara kami akan menghubungi anda.', 'Mohon keahlian', FORM.join[4]],
      demo: ['Tempah demo', 'Lihat T57 dengan produk anda sendiri', 'Demo 30 minit bersama pakar daripada pasukan negara anda.', 'Tempah demo saya', FORM.demo[4]],
      partner: ['Perkongsian', 'Jadi rakan kongsi T57', 'Kongsikan perkhidmatan, lesen dan pasaran anda.', 'Hantar permohonan', FORM.partner[4]],
      contact: ['Hubungi kami', 'Berbincang dengan T57', 'Kami akan menyambungkan anda dengan pasukan yang tepat.', 'Hantar', FORM.contact[4]],
      support: ['Pusat Bantuan', 'Hubungi sokongan', 'Sediakan nama syarikat dan rujukan dagangan anda supaya kami dapat membantu dengan lebih pantas.', 'Hantar kepada sokongan', FORM.support[4]],
      invest: ['Pelabur', 'Minta pek pelabur', 'Untuk pelabur yang layak. Kami akan menghantar ringkasan dan pembentangan, kemudian mengatur panggilan bersama pengasas serta akses kepada memorandum dan bilik data di bawah NDA.', 'Minta pek', FORM.invest[4]],
      subscribe: ['T57 Insights', 'Langgan T57 Insights', 'Analisis pasaran tentang perdagangan makanan, pembiayaan dan AI. Berhenti melanggan pada bila-bila masa.', 'Langgan', FORM.subscribe[4]],
      briefing: ['Sektor awam', 'Mohon taklimat kerajaan', 'Sesi 45 minit bersama pasukan sektor awam kami, di bawah NDA jika diperlukan.', 'Mohon taklimat', FORM.briefing[4]],
      pipeline: ['Bank dan pembiaya', 'Mohon taklimat peluang pembiayaan', 'Penerangan 30 minit tentang satu fail dagangan yang disahkan, bersama pakar daripada pasukan perkongsian pembiayaan kami.', 'Mohon taklimat', FORM.pipeline[4]],
    });
    Object.assign(DONE, { join: 'Terima kasih. Pasukan negara anda akan menghubungi anda dalam tempoh dua hari bekerja.', demo: 'Terima kasih. Pakar kami akan menghubungi anda untuk mengesahkan masa.', partner: 'Terima kasih. Pasukan perkongsian kami akan menghubungi anda.',
      contact: 'Terima kasih. Kami akan membalas dalam tempoh dua hari bekerja.', support: 'Terima kasih. Permintaan anda telah sampai kepada pasukan sokongan kami.', subscribe: 'Terima kasih. Anda kini melanggan T57 Insights.',
      invest: 'Terima kasih. Pasukan perhubungan pelabur kami akan menghantar pek dan menghubungi anda dalam tempoh dua hari bekerja.' });
  }
  if (HI) {
    Object.assign(FORM, {
      join: ['शुरुआत करें', 'T57 से जुड़ें', 'संस्थापक सदस्यों को लॉन्च पर 90 दिन का मुफ़्त ट्रायल मिलता है। अपने व्यवसाय के बारे में बताइए, आपके देश की टीम आपसे संपर्क करेगी।', 'सदस्यता के लिए आवेदन करें', FORM.join[4]],
      demo: ['डेमो बुक करें', 'अपने ही उत्पादों पर T57 को काम करते देखें', 'आपके देश की टीम के विशेषज्ञ के साथ 30 मिनट का डेमो।', 'मेरा डेमो बुक करें', FORM.demo[4]],
      partner: ['साझेदारी', 'T57 के पार्टनर बनें', 'अपनी सेवाओं, लाइसेंस और बाज़ारों के बारे में बताइए।', 'आवेदन भेजें', FORM.partner[4]],
      contact: ['संपर्क', 'T57 से बात करें', 'हम आपको सही टीम से जोड़ेंगे।', 'भेजें', FORM.contact[4]],
      support: ['हेल्प सेंटर', 'सपोर्ट टीम से संपर्क करें', 'अपनी कंपनी का नाम और ट्रेड रेफ़रेंस तैयार रखें, ताकि हम जल्दी मदद कर सकें।', 'सपोर्ट को भेजें', FORM.support[4]],
      invest: ['निवेशक', 'निवेशक पैक मँगाएँ', 'योग्य निवेशकों के लिए। हम टीज़र और प्रेज़ेंटेशन भेजते हैं, फिर संस्थापक के साथ कॉल और NDA के तहत मेमोरेंडम व डेटा रूम की पहुँच की व्यवस्था करते हैं।', 'पैक मँगाएँ', FORM.invest[4]],
      subscribe: ['T57 Insights', 'T57 Insights सब्सक्राइब करें', 'खाद्य व्यापार, फ़ाइनेंस और AI पर बाज़ार की समझ। जब चाहें सब्सक्रिप्शन बंद करें।', 'सब्सक्राइब करें', FORM.subscribe[4]],
      briefing: ['सरकारी क्षेत्र', 'सरकारी ब्रीफ़िंग का अनुरोध करें', 'हमारी पब्लिक-सेक्टर टीम के साथ 45 मिनट का सत्र, ज़रूरत हो तो NDA के तहत।', 'ब्रीफ़िंग का अनुरोध करें', FORM.briefing[4]],
      pipeline: ['बैंक और फ़ाइनेंसर', 'डील पाइपलाइन ब्रीफ़िंग का अनुरोध करें', 'फ़ाइनेंस पार्टनरशिप टीम के विशेषज्ञ के साथ, एक सत्यापित डील फ़ाइल को 30 मिनट में समझें।', 'ब्रीफ़िंग का अनुरोध करें', FORM.pipeline[4]],
    });
    Object.assign(DONE, { join: 'धन्यवाद। आपके देश की टीम दो कार्यदिवसों के भीतर आपसे संपर्क करेगी।', demo: 'धन्यवाद। समय तय करने के लिए हमारे विशेषज्ञ आपसे संपर्क करेंगे।', partner: 'धन्यवाद। हमारी साझेदारी टीम जल्द ही आपसे संपर्क करेगी।',
      contact: 'धन्यवाद। हम दो कार्यदिवसों के भीतर जवाब देंगे।', support: 'धन्यवाद। आपका अनुरोध हमारी सपोर्ट टीम तक पहुँच गया है।', subscribe: 'धन्यवाद। आपने T57 Insights सब्सक्राइब कर लिया है।',
      invest: 'धन्यवाद। हमारी निवेशक संबंध टीम पैक भेजेगी और दो कार्यदिवसों के भीतर आपसे संपर्क करेगी।' });
  }
  if (TR) {
    Object.assign(FORM, {
      join: ['Başlayın', "T57'ye katılın", 'Kurucu üyeler lansmanda 90 günlük ücretsiz deneme süresinden yararlanır. İşletmenizi tanıtın, ülke ekibimiz sizinle iletişime geçsin.', 'Üyelik başvurusu yap', FORM.join[4]],
      demo: ['Demo talep edin', "T57'yi kendi ürünlerinizle görün", 'Ülke ekibinizden bir uzmanla 30 dakikalık demo.', 'Demomu planla', FORM.demo[4]],
      partner: ['İş ortaklıkları', "T57'nin iş ortağı olun", 'Hizmetlerinizi, lisanslarınızı ve faaliyet gösterdiğiniz pazarları paylaşın.', 'Başvuruyu gönder', FORM.partner[4]],
      contact: ['İletişim', "T57 ile görüşün", 'Sizi doğru ekiple buluşturalım.', 'Gönder', FORM.contact[4]],
      support: ['Yardım Merkezi', 'Destek ekibine ulaşın', 'Size daha hızlı yardımcı olabilmemiz için şirket adınızı ve ticaret referansınızı hazır bulundurun.', 'Desteğe gönder', FORM.support[4]],
      invest: ['Yatırımcılar', 'Yatırımcı dosyasını talep edin', 'Nitelikli yatırımcılar içindir. Tanıtım özetini ve sunumu gönderiyor, ardından kurucuyla bir görüşme ve gizlilik sözleşmesi kapsamında bilgi memorandumu ile veri odasına erişim sağlıyoruz.', 'Dosyayı talep et', FORM.invest[4]],
      subscribe: ['T57 Insights', "T57 Insights'a abone olun", 'Gıda ticareti, finansman ve yapay zekâ üzerine piyasa analizleri. Aboneliğinizi istediğiniz zaman iptal edebilirsiniz.', 'Abone ol', FORM.subscribe[4]],
      briefing: ['Kamu sektörü', 'Kamu bilgilendirme toplantısı talep edin', 'Kamu sektörü ekibimizle 45 dakikalık bir oturum; dilerseniz gizlilik sözleşmesi kapsamında.', 'Toplantı talep et', FORM.briefing[4]],
      pipeline: ['Bankalar ve finansörler', 'Finansman fırsatları sunumu talep edin', 'Finansman ortaklıkları ekibimizden bir uzmanla, doğrulanmış bir işlem dosyası üzerinden 30 dakikalık bir inceleme.', 'Sunum talep et', FORM.pipeline[4]],
    });
    Object.assign(DONE, { join: 'Teşekkürler. Ülke ekibiniz iki iş günü içinde sizinle iletişime geçecek.', demo: 'Teşekkürler. Bir uzmanımız zamanı teyit etmek için sizinle iletişime geçecek.', partner: 'Teşekkürler. İş ortaklıkları ekibimiz sizinle iletişime geçecek.',
      contact: 'Teşekkürler. İki iş günü içinde yanıt vereceğiz.', support: 'Teşekkürler. Talebiniz destek ekibimize ulaştı.', subscribe: "Teşekkürler. T57 Insights'a abone oldunuz.",
      invest: 'Teşekkürler. Yatırımcı ilişkileri ekibimiz dosyayı gönderecek ve iki iş günü içinde sizinle iletişime geçecek.' });
  }
  if (AR) {
    Object.assign(FORM, {
      join: ['ابدأ الآن', 'انضم إلى T57', 'يحصل الأعضاء المؤسِّسون على تجربة مجانية لمدة 90 يومًا عند الإطلاق. أخبرنا عن منشأتك وسيتواصل معك فريق بلدك.', 'قدّم طلب العضوية', FORM.join[4]],
      demo: ['اطلب عرضًا توضيحيًا', 'شاهد T57 على منتجاتك', 'عرض توضيحي مدته 30 دقيقة مع متخصص من فريق بلدك.', 'احجز العرض', FORM.demo[4]],
      partner: ['الشراكات', 'كن شريكًا لـ T57', 'أخبرنا عن خدماتك وتراخيصك وأسواقك.', 'أرسل الطلب', FORM.partner[4]],
      contact: ['تواصل معنا', 'تحدّث إلى T57', 'سنوصلك بالفريق المناسب.', 'إرسال', FORM.contact[4]],
      support: ['مركز المساعدة', 'تواصل مع الدعم', 'جهّز اسم منشأتك ومرجع الصفقة لنساعدك أسرع.', 'أرسل إلى الدعم', FORM.support[4]],
      invest: ['المستثمرون', 'اطلب ملف المستثمرين', 'للمستثمرين المؤهلين. نرسل الملخص التعريفي والعرض التقديمي، ثم نرتب مكالمة مع المؤسس والوصول إلى مذكرة الاستثمار وغرفة البيانات بموجب اتفاقية سرية.', 'اطلب الملف', FORM.invest[4]],
      subscribe: ['رؤى T57', 'اشترك في رؤى T57', 'رؤى حول تجارة الغذاء والتمويل والذكاء الاصطناعي. يمكنك إلغاء الاشتراك في أي وقت.', 'اشترك', FORM.subscribe[4]],
      briefing: ['القطاع الحكومي', 'اطلب إحاطة حكومية', 'جلسة مدتها 45 دقيقة مع فريق القطاع العام لدينا، بموجب اتفاقية عدم إفصاح إن رغبت.', 'اطلب الإحاطة', FORM.briefing[4]],
      pipeline: ['البنوك والممولون', 'اطلب عرضًا لفرص التمويل', 'جولة مدتها 30 دقيقة على ملف صفقة موثَّق، مع متخصص من فريق شراكات التمويل لدينا.', 'اطلب العرض', FORM.pipeline[4]],
    });
    Object.assign(DONE, { join: 'شكرًا لك. سيتواصل معك فريق بلدك خلال يومي عمل.', demo: 'شكرًا لك. سيتواصل معك متخصص لتأكيد الموعد.', partner: 'شكرًا لك. سيتواصل معك فريق الشراكات.',
      contact: 'شكرًا لك. سنرد خلال يومي عمل.', support: 'شكرًا لك. وصل طلبك إلى فريق الدعم.', subscribe: 'شكرًا لك. تم اشتراكك في رؤى T57.',
      invest: 'شكرًا لك. سيرسل فريق علاقات المستثمرين الملف ويتواصل معك خلال يومي عمل.' });
  }
  const MSG = HI ? { email: 'कृपया अपना कामकाजी ईमेल लिखें, जैसे name@company.com।', fields: 'कृपया चिह्नित फ़ील्ड भरें।', consent: 'हम आपकी जानकारी का उपयोग कैसे करते हैं, इस पर सहमति के लिए कृपया बॉक्स पर टिक करें।', sending: 'भेजा जा रहा है…', check: 'कृपया चिह्नित फ़ील्ड जाँच लें।',
      busy: 'इस कनेक्शन से बहुत ज़्यादा अनुरोध आए हैं। कृपया कुछ मिनट बाद फिर कोशिश करें।', fail: m => `अभी इसे ऑनलाइन नहीं भेजा जा सका। <a href="${m}">इसके बजाय ईमेल से भेजें</a>, आपके जवाब पहले से भरे होंगे।` }
    : TR ? { email: 'Lütfen iş e-postanızı yazın, örneğin ad@sirket.com.', fields: 'Lütfen işaretli alanları doldurun.', consent: 'Bilgilerinizin nasıl kullanılacağını kabul etmek için lütfen kutuyu işaretleyin.', sending: 'Gönderiliyor…', check: 'Lütfen işaretli alanları kontrol edin.',
      busy: 'Bu bağlantıdan çok fazla istek geldi. Lütfen birkaç dakika sonra tekrar deneyin.', fail: m => `Şu anda çevrimiçi gönderemedik. Yanıtlarınız doldurulmuş olarak <a href="${m}">e-postayla gönderin</a>.` }
    : MS ? { email: 'Sila masukkan e-mel kerja anda, contohnya nama@syarikat.com.', fields: 'Sila lengkapkan ruangan yang ditandakan.', consent: 'Sila tandakan kotak untuk bersetuju dengan cara kami menggunakan maklumat anda.', sending: 'Sedang dihantar…', check: 'Sila semak ruangan yang ditandakan.',
      busy: 'Terlalu banyak permintaan daripada sambungan ini. Sila cuba lagi dalam beberapa minit.', fail: m => `Kami tidak dapat menghantarnya dalam talian buat masa ini. <a href="${m}">Hantar melalui e-mel</a>, dengan jawapan anda sudah diisi.` }
    : AR ? { email: 'يرجى كتابة بريدك الإلكتروني للعمل، مثل name@company.com.', fields: 'يرجى إكمال الحقول المظللة.', consent: 'يرجى تحديد المربع للموافقة على طريقة استخدامنا لبياناتك.', sending: 'جارٍ الإرسال…', check: 'يرجى مراجعة الحقول المظللة.',
      busy: 'طلبات كثيرة من هذا الاتصال. يرجى المحاولة بعد بضع دقائق.', fail: m => `تعذّر الإرسال عبر الإنترنت الآن. <a href="${m}">أرسله بالبريد الإلكتروني بدلًا من ذلك</a>، مع إجاباتك معبأة.` }
    : { email: 'Enter a work email like name@company.com.', fields: 'Please complete the highlighted fields.', consent: 'Please tick the box to agree to how we use your details.', sending: 'Sending…', check: 'Please check the highlighted fields.',
      busy: 'Too many requests from this connection. Please try again in a few minutes.', fail: m => `We could not send this online just now. <a href="${m}">Send it by email instead</a>, with your answers filled in.` };
  const kindOf = t => HI ? (/निवेश/.test(t) ? 'invest' : /सब्सक्राइब/.test(t) ? 'subscribe' : /सपोर्ट|सहायता/.test(t) ? 'support' : /पार्टनर|साझेदार/.test(t) ? 'partner'
    : /डेमो|देखें/.test(t) ? 'demo' : /जुड़ें|आवेदन|सदस्य|शुरू|ट्रायल|मुफ़्त|रजिस्टर/.test(t) ? 'join' : 'contact') : TR ? (/yatırım/i.test(t) ? 'invest' : /abone/i.test(t) ? 'subscribe' : /destek/i.test(t) ? 'support' : /iş ortağı|İş ortağı|ortaklık/i.test(t) ? 'partner'
    : /demo|izleyin|nasıl çalış/i.test(t) ? 'demo' : /katıl|başvur|kaydol|üyelik|başla|dene|ücretsiz/i.test(t) ? 'join' : 'contact') : MS ? (/pelabur/i.test(t) ? 'invest' : /langgan/i.test(t) ? 'subscribe' : /sokongan|bantuan/i.test(t) ? 'support' : /rakan kongsi|perkongsian/i.test(t) ? 'partner'
    : /demo|tonton|lihat cara/i.test(t) ? 'demo' : /sertai|mohon|daftar|keahlian|mula|cuba|percuma/i.test(t) ? 'join' : 'contact') : AR ? (/مستثمر/.test(t) ? 'invest' : /اشترك/.test(t) ? 'subscribe' : /الدعم/.test(t) ? 'support' : /شريك|الشراك/.test(t) ? 'partner'
    : /عرض توضيحي|عرضًا توضيحيًا|شاهد/.test(t) ? 'demo' : /انضم|قدّم طلب|العضوية|ابدأ|سجّل|جرّب/.test(t) ? 'join' : 'contact') : /invest/i.test(t) ? 'invest' : /subscri/i.test(t) ? 'subscribe' : /support|security team/i.test(t) ? 'support' : /partner/i.test(t) ? 'partner'
    : /demo|see how t57 works|watch/i.test(t) ? 'demo' : /chat/i.test(t) ? 'support' : /apply|join|register|free trial|membership|sign up|start|trade with|use escrow|post your|list your|try |track your/i.test(t) ? 'join' : 'contact';
  function required(f) { return (FORM[f.dataset.apiForm] || FORM.contact)[4].filter(n => f.elements[n] && !f.elements[n].closest('[hidden]')); }
  function payload(f) {
    const o = { kind: f.dataset.apiForm, t: +f.dataset.t || 0, page: location.pathname, cta: f.dataset.cta || '' };
    [...f.elements].forEach(el => { if (!el.name || el.closest('[hidden]')) return; o[el.name] = el.type === 'checkbox' ? (el.name === 'consent' ? el.checked : (el.checked ? el.value : '')) : el.value.trim(); });
    return o;
  }
  function mailto(f, o) {
    const skip = new Set(['kind', 't', 'consent', 'website']);
    const body = Object.entries(o).filter(([k, v]) => v && !skip.has(k)).map(([k, v]) => `${k}: ${v}`).join('\n');
    return `mailto:hello@t57.ai?subject=${encodeURIComponent((FORM[o.kind] || FORM.contact)[1] + (o.company ? ' – ' + o.company : ''))}&body=${encodeURIComponent(body)}`;
  }
  document.querySelectorAll('form[data-api-form]').forEach(f => {
    f.dataset.t = Date.now();
    const msg = f.querySelector('[data-mf-msg]'), btn = f.querySelector('button[type=submit]');
    const say = (cls, html) => { msg.className = 'mf-msg ' + cls; msg.innerHTML = html; msg.hidden = false; };
    f.addEventListener('submit', async e => {
      e.preventDefault();
      f.querySelectorAll('.bad').forEach(x => x.classList.remove('bad')); f.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
      const miss = required(f).filter(n => !f.elements[n].value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.elements[n].value.trim())));
      const consent = f.elements.consent;
      miss.forEach(n => { f.elements[n].closest('label').classList.add('bad'); f.elements[n].setAttribute('aria-invalid', 'true'); });
      if (!consent.checked) consent.closest('label').classList.add('bad');
      if (miss.length || !consent.checked) { say('err', miss.length === 1 && miss[0] === 'email' && f.elements.email.value.trim() ? MSG.email : miss.length ? MSG.fields : MSG.consent); (miss.length ? f.elements[miss[0]] : consent).focus(); return; }
      const o = payload(f); btn.disabled = true; say('', MSG.sending);
      try {
        const r = await fetch('/api/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) { f.classList.add('sent'); say('ok', DONE[o.kind] || DONE.contact); return; }
        if (r.status === 422 && j.fields) { j.fields.forEach(n => f.elements[n] && f.elements[n].closest('label').classList.add('bad')); say('err', MSG.check); return; }
        if (r.status === 429) { say('err', MSG.busy); return; }
        throw new Error(j.error || r.status);
      } catch (err) {
        say('err', MSG.fail(mailto(f, o)));
      } finally { btn.disabled = false; }
    });
  });

  // The get-started dialog: every "talk to us", "book a demo" or "apply" button opens it with the right form
  const ROLE_OF = { farmers: 'Producer or farmer', cooperatives: 'Cooperative or FPO', 'food-processors': 'Processor', enterprises: 'Retail, HoReCa or enterprise buyer', traders: 'Trader', sellers: 'Seller or exporter', buyers: 'Buyer', financiers: 'Financier', 'service-providers': 'Logistics or inspection provider', governments: 'Government or institution', collaborators: 'Partner' };
  const dlg = document.getElementById('get-started');
  if (dlg && dlg.showModal) {
    const df = dlg.querySelector('form');
    const open = (kind, cta) => {
      const c = FORM[kind] || FORM.contact;
      df.dataset.apiForm = API_KIND[kind] || kind; df.dataset.cta = cta; df.dataset.t = Date.now(); df.classList.remove('sent');
      dlg.querySelector('[data-fdlg-eb]').textContent = c[0]; dlg.querySelector('[data-fdlg-h]').textContent = c[1];
      dlg.querySelector('[data-fdlg-sub]').textContent = c[2]; dlg.querySelector('[data-fdlg-btn]').textContent = c[3];
      df.querySelectorAll('[data-k]').forEach(el => el.hidden = !el.dataset.k.split(' ').includes(kind));
      df.querySelector('[data-mf-msg]').hidden = true; df.querySelectorAll('.bad').forEach(x => x.classList.remove('bad'));
      dlg.showModal(); const first = df.querySelector('[data-k]:not([hidden]) input, [data-k]:not([hidden]) select'); first && first.focus();
    };
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href$="#cta-home"], a[href^="#cta-"], [data-form]');
      if (!a || a.closest('#get-started') || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); e.stopPropagation();
      const t = a.textContent.trim(), kind = a.dataset.form || kindOf(t); open(kind, t);
      // Audience pages pre-select the visitor's role, so "Register now" is one click to the right form
      const who = ((a.getAttribute('href') || '').match(/#cta-(.+)/) || [])[1], ri = ROLE_OF[who], rs = df.querySelector('select[name="role"]');
      if ((kind === 'join' || API_KIND[kind]) && ri && rs) rs.value = ri;
      // plan buttons on the pricing table pre-select their plan
      const ps = df.querySelector('select[name="plan"]'); if (ps) ps.value = kind === 'join' && a.dataset.plan || '';
      const ty = df.querySelector('select[name="type"]'); if (ty) ty.value = kind === 'partner' && a.dataset.type || '';
    }, true);
    dlg.querySelector('[data-fdlg-close]').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('form').addEventListener('click', e => { if (e.target.closest('a[data-go]')) dlg.close(); });
    window.T57_openForm = open;
  }

  document.querySelectorAll('[data-explainer]').forEach(fx => {
    const btn = fx.querySelector('.fx-pause');
    if (reduce) return;
    // Plays once when it scrolls into view, holds the result, then offers Replay
    let timer, left = 6240, t0 = 0;
    const done = () => { fx.classList.add('done'); btn.setAttribute('aria-pressed', 'false'); btn.textContent = tx('Replay'); };
    const run = () => { clearTimeout(timer); t0 = performance.now(); timer = setTimeout(done, left); };
    const stop = () => { if (t0) left -= performance.now() - t0; clearTimeout(timer); t0 = 0; };
    new IntersectionObserver(([en]) => {
      if (fx.classList.contains('done')) return;
      if (!fx.classList.contains('play')) { if (en.isIntersecting) { fx.classList.add('play'); run(); } return; }
      const hold = !en.isIntersecting || btn.getAttribute('aria-pressed') === 'true';
      if (hold !== fx.classList.contains('paused')) { fx.classList.toggle('paused', hold); hold ? stop() : run(); }
    }, { threshold: 0.3 }).observe(fx);
    btn.addEventListener('click', () => {
      if (fx.classList.contains('done')) {
        fx.classList.remove('done', 'play', 'paused'); void fx.offsetWidth; fx.classList.add('play');
        btn.textContent = tx('Pause'); left = 6240; run(); return;
      }
      const p = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', p); btn.textContent = p ? tx('Play') : tx('Pause');
      fx.classList.toggle('paused', p); p ? stop() : run();
    });
  });

  // Phones: the language list opens from the globe button and closes on a choice, a tap elsewhere or Escape.
  const hdr = document.querySelector('.hdr'), langBtn = document.querySelector('.lang-btn');
  if (hdr && langBtn) {
    const setLangs = on => { hdr.classList.toggle('langs-open', on); langBtn.setAttribute('aria-expanded', on); };
    langBtn.addEventListener('click', e => { e.stopPropagation(); setLangs(!hdr.classList.contains('langs-open')); });
    document.addEventListener('click', e => { if (!e.target.closest('.langs')) setLangs(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && hdr.classList.contains('langs-open')) { setLangs(false); langBtn.focus(); } });
  }
  const menu = document.getElementById('menu'), menuBtn = document.getElementById('menu-btn');
  menu.querySelectorAll('.sub-t').forEach(b => b.addEventListener('click', () => setSub(b.parentElement, b.getAttribute('aria-expanded') !== 'true')));
  const setMenu = open => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  document.addEventListener('click', e => {
    const tp = e.target.closest('[data-tone-pick]'); if (tp) { setTone(tp.dataset.tonePick); if (!busy) intro(); return; }
    const a = e.target.closest('a[data-go]'); if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); go(a.dataset.go, a.getAttribute('href')); return; }
    if (e.target.closest('#replay')) { e.preventDefault(); intro(); }
    // The language switch opens the same page in the other language behind the full petal veil, named in that language.
    const ls = e.target.closest('a.lang-sw');
    if (ls && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0 && !busy && !reduce) {
      e.preventDefault(); busy = true;
      const href = ls.getAttribute('href'), label = (ls.querySelector('.ls-l') || ls).textContent;
      leave(current, href, label).catch(() => { location.href = href; });
    }
  });

  const here = (document.querySelector('.world') || {}).id || 'home';
  show(here);
  let arriving = null, seen = false;
  try { arriving = sessionStorage.getItem('t57-go'); sessionStorage.removeItem('t57-go'); seen = !!sessionStorage.getItem('t57-seen'); sessionStorage.setItem('t57-seen', '1'); } catch (e) {}
  if (arriving && arriving.startsWith('lift:')) liftIn();
  else if (arriving && !reduce) arrive(here).catch(() => { veil.classList.remove('go', 'reveal'); vbg.style.webkitMaskSize = vbg.style.maskSize = ''; busy = false; });
  else { document.documentElement.classList.remove('arriving', 'lifting'); if (!seen) setTimeout(intro, 150); }
})();

// Our journey: type filter, year rail, scroll-drawn line and reveal
document.querySelectorAll('.jr').forEach(sec => {
  const tl = sec.querySelector('.jr-tl'), items = [...sec.querySelectorAll('.jr-i')], years = [...sec.querySelectorAll('.jr-y')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  sec.classList.add('js');
  const io = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  items.forEach(i => reduce ? i.classList.add('in') : io.observe(i));
  sec.querySelectorAll('.jr-f button').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.f;
    sec.querySelectorAll('.jr-f button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    items.forEach(i => { i.hidden = f !== 'all' && !i.dataset.k.split(' ').includes(f); });
    years.forEach(y => { const l = y.nextElementSibling; y.hidden = l.hidden = ![...l.children].some(i => !i.hidden); });
    sec.querySelector('.jr-none').hidden = items.some(i => !i.hidden);
    tick();
  }));
  const rail = [...sec.querySelectorAll('.jr-rail a')];
  let raf = 0;
  const tick = () => { raf = 0;
    const r = tl.getBoundingClientRect(), vh = innerHeight;
    tl.style.setProperty('--p', Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height)).toFixed(4));
    let cur = years[0];
    years.forEach(y => { if (!y.hidden && y.getBoundingClientRect().top < vh * 0.4) cur = y; });
    rail.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + cur.id)));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  addEventListener('resize', tick); tick();
});

// T57 Insights: filter articles by author and topic; author cards set the author filter
document.querySelectorAll('.bl').forEach(sec => {
  const cards = [...sec.querySelectorAll('.bl-c')], st = { a: 'all', t: 'all' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  sec.classList.add('js');
  const io = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.1 });
  cards.forEach(c => reduce ? c.classList.add('in') : io.observe(c));
  const apply = () => {
    sec.querySelectorAll('.bl-f button').forEach(b => { const k = 'a' in b.dataset ? 'a' : 't'; b.setAttribute('aria-pressed', String(b.dataset[k] === st[k])); });
    cards.forEach(c => { c.hidden = (st.a !== 'all' && c.dataset.a !== st.a) || (st.t !== 'all' && c.dataset.t !== st.t); if (!c.hidden) c.classList.add('in'); });
    sec.querySelector('.bl-none').hidden = cards.some(c => !c.hidden);
  };
  sec.querySelectorAll('.bl-f button').forEach(b => b.addEventListener('click', () => { const k = 'a' in b.dataset ? 'a' : 't'; st[k] = b.dataset[k]; apply(); }));
  document.querySelectorAll('.bl-au').forEach(b => b.addEventListener('click', () => { st.a = b.dataset.a; st.t = 'all'; apply(); sec.querySelector('.bl-bar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }));
});

/* ---------- Home: scroll polish, role preview, pillars, conversion helpers (adds no text of its own) ---------- */
(() => {
  const home = document.getElementById('home');
  if (!home) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = home) => r.querySelector(s), $$ = (s, r = home) => [...r.querySelectorAll(s)];
  const hero = $('.home-hero');

  // Reveal on scroll: existing headings, cards and rows rise in, lightly staggered
  if (!reduce) {
    document.documentElement.classList.add('rv-on');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.chapter .eyebrow, .chapter .h2, .chapter .lede, .vs-wrap, .problem, .steps li, .vid, .aud, .usp, .duo-card, .faq details, .pf, .pl, .cta h2').forEach(el => {
      const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty('--d', (Math.min(sib, 5) * 0.07).toFixed(2) + 's'); el.classList.add('rv0'); io.observe(el);
    });
  }

  // Progress bar, chapter rail (labels come from each section's own heading) and a mobile call to action
  const bar = document.createElement('div'); bar.className = 'hx-prog'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>'; home.prepend(bar);
  const rail = document.createElement('nav'); rail.className = 'rail';
  const stops = [hero, ...['vs-home', 'problem-home', 'pillars-home', 'why-home', 'story-home', 'who-home', 'offers-home', 'board', 'cta-home'].map(id => document.getElementById(id))].filter(Boolean);
  const ol = document.createElement('ol');
  stops.forEach(s => { const h = $('h1, h2', s), li = document.createElement('li'), a = document.createElement('a'); a.href = '#' + (s.id || 'main');
    const t = document.createElement('span'); t.textContent = (h ? h.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 42); a.append(t); a.setAttribute('aria-label', t.textContent); li.append(a); ol.append(li);
    a.addEventListener('click', e => { e.preventDefault(); s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }); });
  rail.append(ol); home.prepend(rail);
  const dots = $$('a', rail);
  const cta1 = $('.home-hero .actions a'), cta = document.getElementById('cta-home');
  let sticky = null;
  if (cta1) { sticky = document.createElement('div'); sticky.className = 'sticky-cta'; const c = cta1.cloneNode(true); c.className = 'btn btn-world'; c.tabIndex = -1; sticky.setAttribute('aria-hidden', 'true'); sticky.append(c); home.append(sticky); }
  let tick = false;
  const onScroll = () => {
    tick = false;
    const H = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--sp', H > 0 ? Math.min(1, scrollY / H).toFixed(4) : 0);
    const past = hero.getBoundingClientRect().bottom < innerHeight * 0.35;
    rail.classList.toggle('show', past);
    const on = past && cta && cta.getBoundingClientRect().top > innerHeight * 0.8;
    if (sticky) { sticky.classList.toggle('show', on); document.documentElement.classList.toggle('has-cta', on); }
    let cur = 0; stops.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.5) cur = i; });
    dots.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll); onScroll();

  // Magnetic hero and closing buttons
  if (fine && !reduce) $$('.home-hero .actions .btn, .cta .actions .btn, .duo-card .btn').forEach(b => {
    b.classList.add('mag');
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 10}px ${((e.clientY - r.top) / r.height - .5) * 8}px`; });
    b.addEventListener('pointerleave', () => { b.style.translate = ''; });
  });

  // Film: a large play button over the poster (its label is the video's own label)
  const vid = $('.vid');
  if (vid) {
    const v = $('video', vid), pb = document.createElement('button'); pb.type = 'button'; pb.className = 'vid-play'; pb.setAttribute('aria-label', v.getAttribute('aria-label') || '');
    pb.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>'; $('.vid-f', vid).append(pb);
    pb.addEventListener('click', () => v.play()); v.addEventListener('play', () => vid.classList.add('playing'));
  }

  // Five pillars: the active pillar lights its petal in the mark and the rest step back
  const mono = $('.mono'), pls = $$('.pl');
  if (mono && pls.length) {
    const light = p => { mono.classList.add('has'); $$('.pt', mono).forEach(g => g.classList.toggle('on', g.dataset.p === p)); pls.forEach(x => x.classList.toggle('on', x.dataset.p === p)); };
    light(pls[0].dataset.p);
    const pio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) light(e.target.dataset.p); }), { rootMargin: '-42% 0px -42% 0px' });
    pls.forEach(x => pio.observe(x));
  }

  // Who we serve: hover, focus or tap a role to preview it (wide screens)
  const groups = $('.groups');
  if (groups && matchMedia('(min-width: 901px)').matches) {
    const IMG = { farmers: 'farmer', cooperatives: 'dates', 'food-processors': 'grain', enterprises: 'silos', sellers: 'ship', buyers: 'quay', traders: 'grain', financiers: 'silos', governments: 'port', 'service-providers': 'port', collaborators: 'paddy' };
    const list = document.createElement('div'); list.className = 'pk-list'; [...groups.children].forEach(g => list.append(g)); groups.append(list); groups.classList.add('picking');
    const prev = document.createElement('a'); prev.className = 'pk-prev'; prev.innerHTML = '<img alt="" width="760" height="760" decoding="async"><div class="pk-in"><b></b><p></p><svg class="ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>'; groups.append(prev);
    const img = $('img', prev), nm = $('b', prev), sm = $('p', prev), auds = $$('.aud', groups);
    const pick = a => {
      if (a.classList.contains('on')) return;
      auds.forEach(x => x.classList.toggle('on', x === a)); prev.classList.add('swap');
      setTimeout(() => { img.src = `/img/home/${IMG[a.dataset.go] || 'paddy'}.webp`; nm.textContent = $('b', a).textContent; sm.textContent = $('span', a).textContent; prev.href = a.getAttribute('href'); prev.dataset.go = a.dataset.go; prev.classList.remove('swap'); }, reduce ? 0 : 200);
    };
    const first = auds.find(a => a.dataset.go === 'farmers') || auds[0]; first.classList.add('on'); img.src = `/img/home/${IMG[first.dataset.go] || 'paddy'}.webp`; nm.textContent = $('b', first).textContent; sm.textContent = $('span', first).textContent; prev.href = first.getAttribute('href'); prev.dataset.go = first.dataset.go;
    auds.forEach(a => { a.addEventListener('pointerenter', () => fine && pick(a)); a.addEventListener('focus', () => pick(a)); });
  }
})();

/* ---------- Feel: inertial scrolling and a quiet cursor (fine pointers only) ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement;
  let target = scrollY, cur = scrollY, active = false;
  const max = () => root.scrollHeight - innerHeight;
  const blocked = el => {
    if (el.closest('dialog[open], textarea, select, input, video, .menu, .srch, .t57ai, .vs-wrap')) return true;
    for (let n = el; n && n !== document.body && n !== root; n = n.parentElement) {
      const o = getComputedStyle(n).overflowY;
      if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 1) return true;
    }
    return false;
  };
  const loop = () => {
    cur += (target - cur) * 0.11;
    if (Math.abs(target - cur) < 0.4) { cur = target; active = false; scrollTo(0, cur); root.classList.remove('sm'); return; }
    scrollTo(0, cur); requestAnimationFrame(loop);
  };
  addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || blocked(e.target)) return;
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    if (!active) { cur = scrollY; target = scrollY; active = true; root.classList.add('sm'); requestAnimationFrame(loop); }
    target = Math.min(max(), Math.max(0, target + d * 0.9));
  }, { passive: false });
  addEventListener('scroll', () => { if (!active) { cur = target = scrollY; } }, { passive: true });

  const ring = document.createElement('div'); ring.className = 'cur'; ring.setAttribute('aria-hidden', 'true'); document.body.appendChild(ring);
  let x = -100, y = -100, rx = x, ry = y, seen = false;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!seen) { seen = true; rx = x; ry = y; ring.classList.add('on'); }
    ring.classList.toggle('link', !!e.target.closest('a, button, summary, label, [role=tab], input, .vid-play')); }, { passive: true });
  addEventListener('pointerdown', () => ring.classList.add('down')); addEventListener('pointerup', () => ring.classList.remove('down'));
  document.addEventListener('pointerleave', () => ring.classList.remove('on')); document.addEventListener('pointerenter', () => seen && ring.classList.add('on'));
  const tick = () => { rx += (x - rx) * 0.2; ry += (y - ry) * 0.2; ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`; requestAnimationFrame(tick); };
  tick();
})();

/* The story: one pinned stage walks through verify, agree, finance and deliver */
(() => {
  const st = document.querySelector('[data-story]'); if (!st) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, mq = matchMedia('(min-width: 901px)');
  const sls = [...st.querySelectorAll('.sl')], sps = [...st.querySelectorAll('.sp')], bar = st.querySelector('.story-bar');
  const run = () => {
    const pin = mq.matches && !reduce; st.classList.toggle('pin', pin);
    if (!pin) { sps.forEach(x => x.classList.add('on')); sls.forEach(x => x.classList.add('on')); return; }
    const r = st.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))), i = Math.min(sls.length - 1, Math.floor(p * sls.length));
    bar.style.setProperty('--sp', p.toFixed(3)); sls.forEach((x, k) => x.classList.toggle('on', k === i)); sps.forEach((x, k) => x.classList.toggle('on', k === i));
  };
  addEventListener('scroll', () => requestAnimationFrame(run), { passive: true }); addEventListener('resize', run); run();
})();

/* Header lifts once the page scrolls */
(() => { const h = document.querySelector('.hdr'); if (!h) return; const f = () => h.classList.toggle('scrolled', scrollY > 8); addEventListener('scroll', f, { passive: true }); f(); })();

/* ---------- Site-wide motion: reveal on scroll, heading rule, journey rail, "Keep exploring" ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const SEL = '.chapter .h2, .chapter .lede, .chapter .standfirst, .chapter .feat, .chapter .life-st, .chapter .problem, .chapter .faq, .chapter .pband, .chapter .photo, .chapter .usp, .chapter .aud, .chapter .rcard, .chapter .ch-c, .chapter .glance';
  const SKIP = '.pillars, .explainer, .ledger, .vid, .mkmap, .cmap, [data-en-only], .jr, .life::before';
  const targets = [...document.querySelectorAll(SEL)].filter(el => !el.closest(SKIP) && !el.closest('#problem-home .problems') );
  // the journey rail draws itself as it scrolls in
  const lives = [...document.querySelectorAll('.life')];
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('mo');
    const seen = new Map();
    targets.forEach(el => { const p = el.parentElement; const i = seen.get(p) || 0; seen.set(p, i + 1); el.style.setProperty('--i', Math.min(i, 7)); el.classList.add('rv'); });
    const io = new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in'); io.unobserve(en.target);
      setTimeout(() => en.target.classList.remove('rv'), 1400);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
    const lio = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); lio.unobserve(en.target); } }), { threshold: 0.25 });
    lives.forEach(l => lio.observe(l));
  } else { lives.forEach(l => l.classList.add('in')); }

  // "Keep exploring": three related pages before the closing call to action
  const cta = document.querySelector('main .cta, .cta');
  const lang = root.lang || 'en';
  const T = { en: ['Keep exploring', 'Related pages'], ar: ['واصل الاستكشاف', 'صفحات ذات صلة'], ms: ['Teruskan meneroka', 'Halaman berkaitan'], tr: ['Keşfetmeye devam edin', 'İlgili sayfalar'], hi: ['खोजते रहिए', 'संबंधित पृष्ठ'] }[lang] || ['Keep exploring', 'Related pages'];
  if (!cta || document.querySelector('.explore')) return;
  const file = lang === 'ar' ? 'search-ar' : lang === 'ms' ? 'search-ms' : lang === 'tr' ? 'search-tr' : lang === 'hi' ? 'search-hi' : 'search';
  const here = location.pathname.replace(/\/$/, '') || '/';
  if (here === '/' || /^\/(ar|ms|tr|hi)$/.test(here)) return;
  fetch('/proto/' + file + '.json').then(r => r.json()).then(d => {
    const i = d.findIndex(p => (p[1].replace(/\/$/, '') || '/') === here);
    if (i < 0) return;
    const me = d[i], sec = me[3];
    if (!sec || /^blog-/.test(me[0])) return;
    const pool = d.filter((p, k) => k !== i && p[3] === sec && !/^blog-/.test(p[0]));
    if (!pool.length) return;
    const after = pool.filter(p => d.indexOf(p) > i), pick = [...after, ...pool.filter(p => !after.includes(p))].slice(0, 3);
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const s = document.createElement('section');
    s.className = 'explore gutter'; s.setAttribute('aria-label', T[1]);
    s.innerHTML = `<div class="wrap"><h2 class="h2">${T[0]}</h2><ul>${pick.map((p, k) => `<li style="--i:${k}"><a href="${p[1]}" data-go="${p[0]}"><small>${esc(sec)}</small><b>${esc(p[2])}</b><span>${esc(p[5] || p[4] || '')}</span><i aria-hidden="true"></i></a></li>`).join('')}</ul></div>`;
    cta.parentNode.insertBefore(s, cta);
    if (!reduce && 'IntersectionObserver' in window) { const eio = new IntersectionObserver(([en]) => { if (en.isIntersecting) { s.classList.add('in'); eio.disconnect(); } }, { threshold: 0.2 }); eio.observe(s); } else s.classList.add('in');
  }).catch(() => {});
})();

/* hero parallax */
(() => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; const hero = document.querySelector('.hero'), hin = hero && hero.querySelector('.hero-in'); if (!hin) return;
  let tick = false; const f = () => { tick = false; const r = hero.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / (r.height * .9))); hin.style.setProperty('--hp', p.toFixed(3)); };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(f); } }, { passive: true }); f(); })();

/* ---------- Data visuals drawn from each page's own figures ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lang = document.documentElement.lang || 'en';
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const reveal = (el, th = 0.3) => { if (reduce || !('IntersectionObserver' in window)) { el.classList.add('in'); return; } const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); o.disconnect(); } }, { threshold: th }); o.observe(el); };
  const num = s => parseFloat(String(s).replace(/[^0-9.]/g, ''));

  // Pricing plans: trade fee per side falls as the plan grows, read from the comparison table
  const pt = document.querySelector('table.pt');
  if (pt && path === '/pricing/plans') {
    const names = [...pt.querySelectorAll('thead th[scope="col"] > b')].map(b => b.textContent.trim());
    const fee = pt.querySelector('tr.pt-fee'), price = pt.querySelector('tr.pt-price');
    if (fee && price && names.length) {
      const fv = [...fee.querySelectorAll('td')].map(td => td.textContent.trim()), pv = [...price.querySelectorAll('td')].map(td => td.textContent.trim());
      const nums = fv.map(num), max = Math.max(...nums);
      const T = { en: ['Higher plan, lower fee', 'Trade fee per side, by plan'], ar: ['خطة أعلى، رسوم أقل', ''], ms: ['Pelan lebih tinggi, yuran lebih rendah', ''], tr: ['Daha yüksek plan, daha düşük ücret', ''], hi: ['ऊँचा प्लान, कम शुल्क', ''] }[lang] || ['Higher plan, lower fee', ''];
      const sub = fee.querySelector('th').textContent.trim();
      const box = document.createElement('figure');
      box.className = 'dv'; box.style.margin = '40px 0 0'; box.setAttribute('role', 'img'); box.setAttribute('aria-label', T[0] + ': ' + names.map((n, i) => n + ' ' + fv[i]).join(', '));
      box.innerHTML = `<h3>${esc(T[0])}</h3><p>${esc(sub)}</p><div class="dv-bars" style="--n:${names.length}">${nums.map((v, i) => `<div class="dv-bar" style="--h:${Math.round(v / max * 78) + 10};--k:${i}"><b>${esc(fv[i])}</b><i></i></div>`).join('')}</div><div class="dv-lab" style="--n:${names.length}">${names.map((n, i) => `<span><b>${esc(n)}</b>${esc(pv[i])}</span>`).join('')}</div>`;
      pt.closest('.pt-wrap').insertAdjacentElement('afterend', box); reveal(box);
    }
  }

  // Markets: how far T57 reaches (figures stated on the page: 5 founding, 101 planned, 195 open online)
  const L = { en: ['Founding markets', 'Planned markets', 'Countries open online'], ar: ['أسواق مؤسِّسة', 'أسواق مخطط لها', 'دولة متاحة عبر الإنترنت'], ms: ['Pasaran pengasas', 'Pasaran dirancang', 'Negara dibuka dalam talian'], tr: ['Kurucu pazarlar', 'Planlanan pazarlar', 'Çevrimiçi açık ülke'], hi: ['संस्थापक बाज़ार', 'योजनाबद्ध बाज़ार', 'ऑनलाइन खुले देश'] }[lang] || [];
  if ((path === '/markets' || path === '/markets/global') && L.length) {
    const sec = document.querySelector('main .chapter:not(.alt) .wrap, .chapter .wrap');
    const std = document.querySelector('.chapter .standfirst');
    if (std) {
      const dots = Array.from({ length: 195 }, (_, i) => `<i class="${i < 5 ? 'f' : i < 101 ? 'p' : ''}" style="--k:${i}"></i>`).join('');
      const box = document.createElement('figure'); box.className = 'dv'; box.style.margin = '40px 0 56px'; box.setAttribute('role', 'img'); box.setAttribute('aria-label', `5 ${L[0]}, 101 ${L[1]}, 195 ${L[2]}`);
      box.innerHTML = `<div class="dv-reach"><div class="dv-dots">${dots}</div><ul class="dv-key"><li class="f"><b data-to="5">5</b><span>${esc(L[0])}</span></li><li class="p"><b data-to="101">101</b><span>${esc(L[1])}</span></li><li><b data-to="195">195</b><span>${esc(L[2])}</span></li></ul></div>`;
      std.insertAdjacentElement('afterend', box); reveal(box, 0.35);
      if (!reduce) { box.querySelectorAll('[data-to]').forEach(b => { b.textContent = '0'; }); const o = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; o.disconnect(); const t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / 1600); box.querySelectorAll('[data-to]').forEach(b => { b.textContent = Math.round(+b.dataset.to * (1 - (1 - k) ** 3)); }); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }, { threshold: 0.35 }); o.observe(box); }
    }
  }

  // Big stats: count up, with a proportion bar for the percentages
  document.querySelectorAll('.bigstats').forEach(bs => {
    const items = [...bs.querySelectorAll('b')];
    items.forEach(b => {
      const t = b.textContent.trim(), m = t.match(/^(\d+(?:\.\d+)?)(.*)$/); const frac = { '⅓': 33.3, '⅔': 66.7, '½': 50, '¼': 25 }[t];
      const pct = frac || (/%$/.test(t) && m ? +m[1] : null);
      if (pct != null) { const bar = document.createElement('span'); bar.className = 'bs-bar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = `<i style="--w:${pct}"></i>`; b.parentElement.appendChild(bar); }
      if (m && !reduce) { b.dataset.n = m[1]; b.dataset.s = m[2]; b.dataset.dec = (m[1].split('.')[1] || '').length; b.textContent = '0' + m[2]; }
    });
    if (reduce || !('IntersectionObserver' in window)) { bs.classList.add('in'); return; }
    const o = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; o.disconnect(); bs.classList.add('in'); const t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / 1500); items.forEach(b => { if (b.dataset.n) b.textContent = (+b.dataset.n * (1 - (1 - k) ** 3)).toFixed(+b.dataset.dec) + b.dataset.s; }); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }, { threshold: 0.4 }); o.observe(bs);
  });
})();

/* ---------- Scroll-driven scenes: Trust passport, layer stacks (Platform, AI), AI-advises-people-decide pipeline ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>';
  const scenes = [];
  // where a scene goes: before the source's section; if the section holds nothing else, the section is replaced
  function host(fig) {
    const sec = fig.closest('section.chapter, section'); if (!sec) return null;
    const wrap = sec.querySelector('.wrap') || sec;
    const rest = [...wrap.children].filter(e => !e.matches('.eyebrow, h2, .lede, .standfirst') && e !== fig && !e.contains(fig));
    const heading = { eyebrow: txt(wrap.querySelector('.eyebrow')), h2: txt(wrap.querySelector('h2')), lede: txt(wrap.querySelector('.lede, .standfirst')) };
    return { sec, replace: rest.length === 0, heading };
  }
  function mount(fig, h, html, cls, n) {
    const s = document.createElement('section'); s.className = 'scn ' + cls; s.style.setProperty('--n', n); s.setAttribute('aria-label', h.heading.h2 || fig.getAttribute('aria-label') || '');
    s.innerHTML = html; h.sec.parentNode.insertBefore(s, h.sec);
    if (h.replace) h.sec.hidden = true; else { fig.hidden = true; const w = h.sec.querySelector('.wrap') || h.sec; w.querySelectorAll(':scope > .eyebrow, :scope > h2, :scope > .lede').forEach(e => { e.hidden = true; }); }
    scenes.push({ el: s, n }); return s;
  }
  const head = h => `<div class="scn-copy">${h.heading.eyebrow ? `<p class="eyebrow">${esc(h.heading.eyebrow)}</p>` : ''}<h2 class="h2">${esc(h.heading.h2)}</h2>${h.heading.lede ? `<p class="lede">${esc(h.heading.lede)}</p>` : ''}`;

  // 1. Trust: a passport that collects its checks as you scroll
  document.querySelectorAll('figure.tpass').forEach(fig => {
    const rows = [...fig.querySelectorAll('.tp-card ol li')].map(li => ({ b: txt(li.querySelector('b')), s: txt(li.querySelector('span')) })).filter(r => r.b);
    if (rows.length < 2) return; const h = host(fig); if (!h) return;
    const label = txt(fig.querySelector('.tp-head span')) || 'T57', logo = fig.querySelector('.tp-head svg'), stamp = txt(fig.querySelector('.tp-stamp'));
    if (!h.heading.h2) h.heading.h2 = fig.getAttribute('aria-label') || label;
    const html = `<div class="scn-in gutter"><div class="scn-grid">${head(h)}<ol class="scn-steps">${rows.map((r, i) => `<li data-k="${i}"><b>${esc(r.b)}</b>${r.s ? `<span>${esc(r.s)}</span>` : ''}</li>`).join('')}</ol></div>
      <div class="scn-card tcard" role="img" aria-label="${esc(label)}"><div class="tc-head">${logo ? logo.outerHTML : ''}<span>${esc(label)}</span><em class="tc-n"><b data-cur>0</b> / ${rows.length}</em></div>
        <div class="tc-bar" style="--n:${rows.length}">${rows.map((_, i) => `<i data-k="${i}"></i>`).join('')}</div>
        <ul class="tc-rows">${rows.map((r, i) => `<li data-k="${i}">${CHECK}<b>${esc(r.b)}</b></li>`).join('')}</ul>${stamp ? `<p class="tc-stamp">${esc(stamp)}</p>` : ''}</div></div>`;
    mount(fig, h, html.replace('<div class="scn-card', '</div><div class="scn-card'), 'scn-trust', rows.length);
  });

  // 2. Platform and AI: layers that separate and light up one at a time
  const stacks = [...document.querySelectorAll('figure.pboard'), ...document.querySelectorAll('figure.ailayers, .ailayers')].filter((e, i, a) => a.indexOf(e) === i && !e.parentElement.closest('.ailayers'));
  stacks.forEach(fig => {
    const items = [...fig.querySelectorAll('ol > li')].map(li => ({ n: txt(li.querySelector('.pb-n, .ly-n')), b: txt(li.querySelector('b')), d: txt(li.querySelector('span:last-child:not(.pb-n):not(.ly-n)')), ic: li.querySelector('svg') })).filter(x => x.b);
    if (items.length < 2) return; const h = host(fig); if (!h) return;
    if (!h.heading.h2) h.heading.h2 = fig.getAttribute('aria-label') || items[0].b;
    const N = items.length;
    const html = `<div class="scn-in gutter"><div class="scn-grid">${head(h)}<ol class="scn-list">${items.map((x, i) => `<li data-k="${i}"><span class="sl-n">${esc(x.n || String(i + 1).padStart(2, '0'))}</span><b>${esc(x.b)}</b>${x.d ? `<span class="sl-d">${esc(x.d)}</span>` : ''}</li>`).join('')}</ol></div>
      <div class="scn-plates" aria-hidden="true" style="--n:${N}"><div class="plt-stage">${items.map((x, i) => `<div class="plt" data-k="${i}" style="--k:${i}"><span>${esc(x.n || String(i + 1).padStart(2, '0'))}</span></div>`).join('')}<i class="plt-spine"></i></div></div></div>`;
    mount(fig, h, html.replace('<div class="scn-plates', '</div><div class="scn-plates'), 'scn-stack', N);
  });

  // 3. AI pipeline: data in, model, output, and a person decides
  document.querySelectorAll('figure.aipipe').forEach(fig => {
    const cols = [...fig.querySelectorAll('.ap-col')].map(c => ({ k: txt(c.querySelector('.ap-k')), li: [...c.querySelectorAll('li')].map(txt), b: txt(c.querySelector('b')), ic: c.querySelector('svg'), human: c.classList.contains('ap-human') }));
    if (cols.length < 3) return; const h = host(fig); if (!h) return;
    if (!h.heading.h2) h.heading.h2 = fig.getAttribute('aria-label') || '';
    const N = cols.length;
    const html = `<div class="scn-in gutter"><div class="scn-grid scn-grid-top">${head(h)}</div></div>
      <div class="scn-pipe" style="--n:${N}"><i class="sp-line"></i><i class="sp-dot"></i>${cols.map((c, i) => `<div class="sp-col${c.human ? ' human' : ''}" data-k="${i}"><p class="sp-k">${esc(c.k)}</p><div class="sp-ic">${c.ic ? c.ic.outerHTML : (i === 0 ? '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h4"/></svg>')}</div>${c.li.length ? `<ul>${c.li.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}${c.b ? `<b>${esc(c.b)}</b>` : ''}</div>`).join('')}</div>`;
    const s = mount(fig, h, html.replace('<div class="scn-pipe', '</div><div class="scn-pipe').replace('</div></div>\n      </div><div class="scn-pipe', '</div></div></div><div class="scn-pipe'), 'scn-pipeline', N);
  });

  // 4. Partners and Help: a route with pins that light as you scroll (finance repayment, shipment milestones, getting-started path)
  const routes = [];
  document.querySelectorAll('ol.gpath').forEach(el => routes.push({ fig: el, items: [...el.querySelectorAll('li')].map(li => ({ n: txt(li.querySelector('.gp-n')), b: txt(li.querySelector('b')) })), kind: 'path' }));
  document.querySelectorAll('ol.slq').forEach(el => routes.push({ fig: el, items: [...el.querySelectorAll('li')].map(li => ({ n: '', b: txt(li.querySelector('b')), d: txt(li.querySelector('span')) })), kind: 'flow' }));
  document.querySelectorAll('figure.track').forEach(el => routes.push({ fig: el, items: [...el.querySelectorAll('.tk-s text')].map(t => ({ n: '', b: txt(t) })), kind: 'ship', pay: txt(el.querySelector('.tk-pay')) }));
  if (/\/markets\/[^/]+\/compliance\/?$/.test(location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/)/, ''))) document.querySelectorAll('.chapter .feats').forEach(el => { const items = [...el.querySelectorAll('.feat')].map(f => ({ n: '', b: txt(f.querySelector('b')), d: txt(f.querySelector('span')) })); if (items.length >= 3 && items.length <= 8) routes.push({ fig: el, items, kind: 'gate' }); });
  if (/^\/(who-we-serve|capabilities)\/.+|platform\/domestic-trade\/?$/.test(location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '') || '/')) document.querySelectorAll('.chapter ol.steps').forEach(el => { const items = [...el.querySelectorAll(':scope > li')].map(li => ({ n: txt(li.querySelector('.dot')), b: txt(li.querySelector('h3')), d: txt(li.querySelector('p')) })); if (items.length >= 3 && items.length <= 7) routes.push({ fig: el, items, kind: 'gate' }); });
  if (/^\/(pricing\/(enterprise|government|roi-calculator)|why-t57\/club-membership|partners\/(research|country-partner|apply)|about(\/(investors|food-security|sdg-delivery))?)\/?$/.test(location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '') || '/')) document.querySelectorAll('.chapter ol.steps').forEach(el => { const items = [...el.querySelectorAll(':scope > li')].map(li => ({ n: txt(li.querySelector('.dot')), b: txt(li.querySelector('h3')), d: txt(li.querySelector('p')) })); if (items.length >= 3 && items.length <= 7) routes.push({ fig: el, items, kind: 'gate' }); });
  if (/^\/why-t57\/?$/.test(location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '') || '/')) document.querySelectorAll('.chapter .life').forEach(el => { const items = [...el.querySelectorAll('.life-st')].map(st => ({ n: txt(st.querySelector('.life-n')), b: txt(st.querySelector('h3')), d: [...st.querySelectorAll('li a, li span')].map(txt).filter(Boolean).join('  ·  ') })); if (items.length >= 3 && items.length <= 7) routes.push({ fig: el, items, kind: 'gate' }); });
  routes.forEach(r => {
    const items = r.items.filter(x => x.b); const N = items.length; if (N < 3) return;
    const sec = r.fig.closest('section'); if (!sec) return;
    const wrap = sec.querySelector('.wrap') || sec;
    const rest = [...wrap.children].filter(e => !e.matches('.eyebrow, h2, .lede, .standfirst, p') && e !== r.fig && !e.contains(r.fig));
    const hd = { eyebrow: txt(wrap.querySelector('.eyebrow')), h2: txt(wrap.querySelector('h2')), lede: '' };
    if (!hd.h2) return;
    const pts = items.map((_, i) => [70 + i * (1060 / (N - 1)), 150 + Math.sin(i * 1.25 + 0.4) * 70]);
    const d = pts.map((q, i) => i ? `C ${(pts[i - 1][0] + q[0]) / 2} ${pts[i - 1][1]}, ${(pts[i - 1][0] + q[0]) / 2} ${q[1]}, ${q[0]} ${q[1]}` : `M ${q[0]} ${q[1]}`).join(' ');
    const labels = N <= 6 && r.kind !== 'gate';
    const html = `<div class="scn-in gutter"><div class="scn-grid scn-grid-top">${head({ heading: hd })}</div></div>
      <div class="scn-route"><svg viewBox="0 0 1200 300" aria-hidden="true"><path class="sr-base" d="${d}"/><path class="sr-run" d="${d}" pathLength="1"/>${pts.map((q, i) => `<g class="sr-pin" data-k="${i}"><circle cx="${q[0]}" cy="${q[1]}" r="${labels ? 20 : 16}"/>${r.kind === 'path' ? `<text x="${q[0]}" y="${q[1] + 6}" text-anchor="middle">${esc(items[i].n || i + 1)}</text>` : `<path class="sr-ck" d="M${q[0] - 7} ${q[1]} l5 5 l9 -10"/>`}${labels ? `<text class="sr-l" x="${q[0]}" y="${q[1] + (q[1] > 150 ? 52 : -34)}" text-anchor="middle">${esc(items[i].b)}</text>` : ''}</g>`).join('')}<g class="sr-mk"><circle r="11"/></g></svg>
        <p class="sr-now" aria-hidden="true"><b></b><span></span></p></div>
      <ol class="scn-steps scn-steps-static">${items.map(x => `<li><b>${esc(x.b)}</b>${x.d ? `<span>${esc(x.d)}</span>` : ''}</li>`).join('')}</ol>`;
    const s = document.createElement('section'); s.className = 'scn scn-routed'; s.style.setProperty('--n', Math.min(N, 6)); s.setAttribute('aria-label', hd.h2);
    s.innerHTML = html.replace('</div></div>\n      <div class="scn-route', '</div></div></div><div class="scn-route');
    sec.parentNode.insertBefore(s, sec);
    if (rest.length === 0) sec.hidden = true; else { r.fig.hidden = true; wrap.querySelectorAll(':scope > .eyebrow, :scope > h2').forEach(e => { e.hidden = true; }); }
    const path = s.querySelector('.sr-run'), mk = s.querySelector('.sr-mk'), nowB = s.querySelector('.sr-now b'), nowS = s.querySelector('.sr-now span');
    scenes.push({ el: s, n: N, upd(p, k) {
      const len = path.getTotalLength(), t = Math.min(1, Math.max(0, p * N / (N - 1)));
      const pt = path.getPointAtLength(len * t); mk.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      path.style.strokeDashoffset = 1 - t; const i = Math.max(0, Math.min(N - 1, k - 1));
      nowB.textContent = items[i].b; nowS.textContent = items[i].d || (r.kind === 'ship' && k >= N && r.pay ? r.pay : '');
    } });
  });

  // 5. Partnerships: partner types around one trade record
  document.querySelectorAll('figure.ring').forEach(fig => {
    const sec = fig.closest('section'); const wrap = sec && sec.querySelector('.wrap'); const auds = document.querySelectorAll('.auds a.aud');
    if (!sec || !auds.length) return;
    const items = [...auds].map(a => ({ b: txt(a.querySelector('b')), d: txt(a.querySelector('span')), href: a.getAttribute('href'), go: a.dataset.go }));
    const N = items.length; const h = host(fig); if (!h) return;
    const marks = '<use href="#mk-ring"></use><use href="#mk-trade"></use><use href="#mk-tech"></use><use href="#mk-logistics"></use><use href="#mk-finance"></use><use href="#mk-agri"></use>';
    const nodes = items.map((x, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [200 + Math.cos(a) * 160, 200 + Math.sin(a) * 160]; });
    const html = `<div class="scn-in gutter"><div class="scn-grid">${head(h)}<ol class="scn-list">${items.map((x, i) => `<li data-k="${i}"><span class="sl-n">${String(i + 1).padStart(2, '0')}</span><b><a href="${x.href}" data-go="${x.go || ''}">${esc(x.b)}</a></b><span class="sl-d">${esc(x.d)}</span></li>`).join('')}</ol></div>
      <div class="scn-hub" aria-hidden="true"><svg viewBox="0 0 400 400">${nodes.map((q, i) => `<line class="hb-l" data-k="${i}" x1="200" y1="200" x2="${q[0]}" y2="${q[1]}"/>`).join('')}${nodes.map((q, i) => `<g class="hb-n" data-k="${i}"><circle cx="${q[0]}" cy="${q[1]}" r="26"/><text x="${q[0]}" y="${q[1] + 5}" text-anchor="middle">${String(i + 1).padStart(2, '0')}</text></g>`).join('')}<circle class="hb-c" cx="200" cy="200" r="52"/><svg x="168" y="170" width="64" height="62" viewBox="774 418 250 244">${marks}</svg></svg></div></div>`;
    const s = mount(fig, h, html.replace('<div class="scn-hub', '</div><div class="scn-hub'), 'scn-hubbed', N);
  });

  // 6. Global rollout: the market map fills as the phases advance
  document.querySelectorAll('ol.waves').forEach(fig => {
    const waves = [...fig.querySelectorAll(':scope > .wave')].map(w => ({ n: +(w.querySelector('.wv-n') || {}).dataset?.n || 0, k: txt(w.querySelector('.wv-k')), b: txt(w.querySelector('h3')), d: txt(w.querySelector('.wv-d')), chips: [...w.querySelectorAll('ul li')].map(txt) })).filter(w => w.n);
    if (waves.length < 3 || !/global-rollout/.test(location.pathname)) return; const h = host(fig); if (!h) return;
    const total = waves[waves.length - 1].n; const phaseOf = i => waves.findIndex(w => i < w.n);
    const unit = txt(fig.querySelector('.wv-bar small')) || '';
    const html = `<div class="scn-in gutter"><div class="scn-grid">${head(h)}<ol class="scn-list">${waves.map((w, i) => `<li data-k="${i}"><span class="sl-n">${i + 1}</span><b>${esc(w.b)}</b><span class="sl-d">${esc(w.k)}${w.d ? ' · ' + esc(w.d) : ''}${w.chips.length ? '<br>' + w.chips.map(c => `<em class="chip">${esc(c)}</em>`).join('') : ''}</span></li>`).join('')}</ol></div>
      <div class="scn-dotmap" aria-hidden="true"><p class="dm-n"><b data-count>${waves[0].n}</b> <span>${esc(unit)}</span></p><div class="dm-grid">${Array.from({ length: total }, (_, i) => `<i data-k="${phaseOf(i)}"></i>`).join('')}</div></div></div>`;
    const sc = mount(fig, h, html.replace('<div class="scn-dotmap', '</div><div class="scn-dotmap'), 'scn-rollout', waves.length);
    const cnt = sc.querySelector('[data-count]'); const rec = scenes[scenes.length - 1];
    rec.upd = (p, k) => { cnt.textContent = waves[Math.max(0, Math.min(waves.length - 1, k - 1))].n; };
  });

  // 7. About: T, 5 and 7, one at a time
  document.querySelectorAll('.ns').forEach(fig => {
    const cols = [...fig.querySelectorAll(':scope > .ns-col')].map(c => ({ big: txt(c.querySelector('.ns-big')), b: txt(c.querySelector('h3')), d: txt(c.querySelector(':scope > p:not(.ns-big)')), chips: [...c.querySelectorAll('.ns-i b, .ns-seven li b')].map(txt) })).filter(c => c.big && c.b);
    if (cols.length < 3) return; const h = host(fig); if (!h) return;
    const html = `<div class="scn-in gutter"><div class="scn-grid">${head(h)}<ol class="scn-list">${cols.map((c, i) => `<li data-k="${i}"><span class="sl-n">${esc(c.big)}</span><b>${esc(c.b)}</b><span class="sl-d">${esc(c.d)}</span></li>`).join('')}</ol></div>
      <div class="scn-big" aria-hidden="true">${cols.map((c, i) => `<div class="sb-c" data-k="${i}"><b>${esc(c.big)}</b>${c.chips.length ? `<ul>${c.chips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div></div>`;
    mount(fig, h, html.replace('<div class="scn-big', '</div><div class="scn-big'), 'scn-decode', cols.length);
  });

  // 8. Impact: five changes, five petals
  if (/\/about\/impact\/?$/.test(location.pathname)) document.querySelectorAll('ul.impact').forEach(fig => {
    const items = [...fig.querySelectorAll(':scope > li')].map(li => ({ b: txt(li.querySelector('b')), d: txt(li.querySelector('span')) })).filter(x => x.b);
    if (items.length !== 5) return; const h = host(fig); if (!h) return;
    const ids = ['trade', 'finance', 'logistics', 'agri', 'tech'];
    const html = `<div class="scn-in gutter"><div class="scn-grid">${head(h)}<ol class="scn-list">${items.map((x, i) => `<li data-k="${i}"><span class="sl-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(x.b)}</b><span class="sl-d">${esc(x.d)}</span></li>`).join('')}</ol></div>
      <div class="scn-petals" aria-hidden="true"><svg viewBox="774 418 250 244"><use class="pt-ring" href="#mk-ring"></use>${ids.map((id, i) => `<use class="pt" data-k="${i}" href="#mk-${id}"></use>`).join('')}</svg></div></div>`;
    mount(fig, h, html.replace('<div class="scn-petals', '</div><div class="scn-petals'), 'scn-pet', 5);
  });

  // 9. Trust sub-pages: a record passes four gates and is stamped
  if (/^\/trust\/(verification\/(kyb|kyc|membership-scoring)|document-management|security(\/data-protection)?|trade-assurance\/disputes)\/?$/.test(location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '') || '/')) document.querySelectorAll('.chapter ol.steps').forEach(el => {
    const items = [...el.querySelectorAll(':scope > li')].map(li => ({ n: txt(li.querySelector('.dot')), b: txt(li.querySelector('h3')), d: txt(li.querySelector('p')) })).filter(x => x.b);
    if (items.length < 3 || items.length > 6) return; const h = host(el); if (!h) return; const N = items.length;
    const crumbs = [...document.querySelectorAll('.crumbs li, .crumbs a, .crumbs span')].map(txt).filter(Boolean); const subject = (document.querySelector('.hero h1') && '') || crumbs[crumbs.length - 1] || '';
    const subj = (document.title.split(/\s[|·–—-]\s/)[0] || '').trim() || txt(document.querySelector('.micro b')) || subject;
    const ICON = ['<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', '<path d="M6 3h9l4 4v14H6z"/><path d="M9 13l2 2 4-4"/>', '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>', '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'];
    const html = `<div class="scn-in gutter"><div class="scn-grid">${head(h)}<ol class="scn-list">${items.map((x, i) => `<li data-k="${i}"><span class="sl-n">${esc(x.n || String(i + 1).padStart(2, '0'))}</span><b>${esc(x.b)}</b><span class="sl-d">${esc(x.d)}</span></li>`).join('')}</ol></div>
      <div class="scn-gates" aria-hidden="true" style="--n:${N}"><div class="gt-rec"><b>${esc(subj)}</b><i></i><i></i><i></i></div><div class="gt-track"><i class="gt-run"></i>${items.map((x, i) => `<div class="gt" data-k="${i}"><svg viewBox="0 0 24 24">${ICON[i % ICON.length]}</svg><span>${esc(x.b)}</span></div>`).join('')}</div><p class="gt-stamp">${esc(items[N - 1].b)}</p></div></div>`;
    mount(el, h, html.replace('<div class="scn-gates', '</div><div class="scn-gates'), 'scn-gated', N);
  });

  // drive them from scroll
  if (!scenes.length) return;
  const stat = () => reduce || innerWidth < 900;
  const run = () => scenes.forEach(sc => { const { el, n } = sc;
    let p = 1;
    if (!stat()) { const r = el.getBoundingClientRect(); p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))); }
    const k = stat() ? n : Math.min(n, Math.floor(p * (n + 0.35) * (n / (n + 0.35)) + 0.0001) + (p > 0.02 ? 1 : 0));
    el.style.setProperty('--p', p.toFixed(3)); el.style.setProperty('--on', k);
    el.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', +x.dataset.k < k));
    el.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('now', +x.dataset.k === k - 1));
    const cur = el.querySelector('[data-cur]'); if (cur) cur.textContent = k;
    el.classList.toggle('done', k >= n); if (sc.upd) sc.upd(p, k);
  });
  let tick = false; const go = () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; run(); }); } };
  addEventListener('scroll', go, { passive: true }); addEventListener('resize', go); run();
})();

/* ---------- Finance partners waffle; Help filters ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // 41 of every 100 SME trade finance applications rejected (figure stated on the page, Asian Development Bank)
  if (path === '/partners/financial-services') {
    const bs = document.querySelector('.bigstats'); const stat = bs && [...bs.children].find(c => /41/.test(c.textContent) || (c.querySelector('b') && c.querySelector('b').dataset.n === '41'));
    if (stat) {
      const label = stat.querySelector('span').textContent.trim();
      const box = document.createElement('figure'); box.className = 'dv'; box.style.margin = '32px 0 0'; box.setAttribute('role', 'img'); box.setAttribute('aria-label', '41 / 100: ' + label);
      box.innerHTML = `<div class="dv-reach"><div class="dv-dots wf">${Array.from({ length: 100 }, (_, i) => `<i class="${i < 41 ? 'f' : 'p'}" style="--k:${i}"></i>`).join('')}</div><ul class="dv-key"><li class="f"><b>41</b><span>${esc(label)}</span></li></ul></div>`;
      bs.insertAdjacentElement('afterend', box);
      if (reduce || !('IntersectionObserver' in window)) box.classList.add('in'); else { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { box.classList.add('in'); o.disconnect(); } }, { threshold: 0.3 }); o.observe(box); }
    }
  }
  // Help: type to filter how-tos and FAQs, using the site search placeholder in the visitor's language
  const ph = (document.getElementById('srch-q') || {}).placeholder || '';
  const mk = (anchor, items, hide) => {
    const f = document.createElement('input'); f.type = 'search'; f.className = 'hfilter'; f.placeholder = ph; f.setAttribute('aria-label', ph); f.autocomplete = 'off';
    anchor.insertAdjacentElement('beforebegin', f);
    const norm = t => String(t).toLowerCase();
    f.addEventListener('input', () => { const q = norm(f.value).trim(); items().forEach(({ el, text }) => { el.hidden = !!q && !norm(text).includes(q); }); hide && hide(); });
  };
  const grid = document.querySelector('.ht-grid');
  if (grid && ph) mk(grid, () => [...grid.querySelectorAll('.ht-c')].flatMap(c => [...c.querySelectorAll('li')].map(li => ({ el: li, text: li.textContent + ' ' + c.querySelector('h3').textContent }))), () => grid.querySelectorAll('.ht-c').forEach(c => { c.hidden = ![...c.querySelectorAll('li')].some(li => !li.hidden); }));
  const faq = document.querySelector('.faq-wrap .faq');
  if (faq && ph && path === '/help/faq') mk(faq, () => [...faq.querySelectorAll('details')].map(d => ({ el: d, text: d.textContent })));
})();

/* ---------- Readiness checklist on Getting Started pages ---------- */
(() => {
  const need = document.querySelector('ul.need'); if (!need || !/\/markets\/[^/]+\/getting-started\/?$/.test(location.pathname)) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const key = 't57need:' + location.pathname; let saved = []; try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
  need.classList.add('chk'); const lis = [...need.children], N = lis.length;
  const box = document.createElement('div'); box.className = 'need-top';
  box.innerHTML = '<div class="need-bar" aria-hidden="true"><i></i></div><p class="need-n" aria-live="polite"><b>0</b> / ' + N + '</p>';
  need.insertAdjacentElement('beforebegin', box);
  const bar = box.querySelector('i'), cnt = box.querySelector('b');
  const upd = () => { const k = lis.filter(l => l.classList.contains('ok')).length; bar.style.transform = 'scaleX(' + (k / N) + ')'; cnt.textContent = k; box.classList.toggle('all', k === N); try { localStorage.setItem(key, JSON.stringify(lis.map((l, i) => l.classList.contains('ok') ? i : -1).filter(i => i >= 0))); } catch (e) {} };
  lis.forEach((li, i) => {
    li.tabIndex = 0; li.setAttribute('role', 'checkbox'); li.setAttribute('aria-checked', 'false');
    const flip = () => { li.classList.toggle('ok'); li.setAttribute('aria-checked', li.classList.contains('ok')); upd(); };
    li.addEventListener('click', flip); li.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } });
    if (saved.includes(i)) { li.classList.add('ok'); li.setAttribute('aria-checked', 'true'); }
  });
  upd();
})();

/* ---------- About and Resources: SDG tiles, press timeline, report covers, reading progress, glossary letters ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // SDG tiles flip to show their targets
  document.querySelectorAll('.sdgs .sdg').forEach(t => { t.tabIndex = 0; const f = () => t.classList.toggle('flip'); t.addEventListener('click', f); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }); });
  // press timeline: the spine draws as you read down it
  document.querySelectorAll('ol.news-tl').forEach(ol => {
    const lis = [...ol.children]; if (reduce) { lis.forEach(l => l.classList.add('on')); ol.style.setProperty('--sp', 1); return; }
    const f = () => { const r = ol.getBoundingClientRect(), mid = innerHeight * 0.62; const p = Math.min(1, Math.max(0, (mid - r.top) / r.height)); ol.style.setProperty('--sp', p.toFixed(3)); lis.forEach(l => l.classList.toggle('on', l.getBoundingClientRect().top < mid)); };
    addEventListener('scroll', () => requestAnimationFrame(f), { passive: true }); addEventListener('resize', f); f();
  });
  // report covers tilt toward the pointer
  if (!reduce && matchMedia('(hover:hover)').matches) document.querySelectorAll('.rcover .cv-art').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.setProperty('--ry', (x * 14).toFixed(1) + 'deg'); c.style.setProperty('--rx', (-y * 10).toFixed(1) + 'deg'); c.style.setProperty('--sx', (x * 100 + 50).toFixed(0) + '%'); });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
  });
  // blog posts: reading progress
  const post = document.querySelector('.chapter.post');
  if (post && !reduce) { const bar = document.createElement('div'); bar.className = 'rd-bar'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    const f = () => { const r = post.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * 0.3 - r.top) / (r.height - innerHeight * 0.3 + 1))); bar.style.transform = 'scaleX(' + p + ')'; };
    addEventListener('scroll', () => requestAnimationFrame(f), { passive: true }); f(); }
  // glossary: the letter you are reading stays lit
  const az = document.querySelector('.gl-az'), terms = [...document.querySelectorAll('.gl-i[id]')];
  if (az && terms.length && 'IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) az.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60% 0px' }); terms.forEach(t => io.observe(t)); }
})();

/* ---------- Orbit explorer (Who we serve, Capabilities) and office clocks (Contact) ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const marks = '<use href="#mk-ring"></use><use href="#mk-trade"></use><use href="#mk-tech"></use><use href="#mk-logistics"></use><use href="#mk-finance"></use><use href="#mk-agri"></use>';
  function orbit(anchor, nodes, label) {
    const N = nodes.length, R = 205, C = 280;
    const pos = nodes.map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [C + Math.cos(a) * R, C + Math.sin(a) * R]; });
    const box = document.createElement('div'); box.className = 'orb'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', label);
    box.innerHTML = `<svg viewBox="0 0 560 560" class="orb-svg"><circle class="orb-ring" cx="${C}" cy="${C}" r="${R}"/>${pos.map((q, i) => `<line class="orb-l" data-i="${i}" x1="${C}" y1="${C}" x2="${q[0]}" y2="${q[1]}"/>`).join('')}<circle class="orb-hub" cx="${C}" cy="${C}" r="62"/><svg x="${C - 40}" y="${C - 39}" width="80" height="78" viewBox="774 418 250 244">${marks}</svg>${pos.map((q, i) => `<a class="orb-n" data-i="${i}" href="${nodes[i].href}" data-go="${nodes[i].go || ''}" style="--c:${nodes[i].c}" aria-label="${esc(nodes[i].title)}"><circle cx="${q[0]}" cy="${q[1]}" r="30"/><text x="${q[0]}" y="${q[1] + 6}" text-anchor="middle">${esc(nodes[i].n)}</text></a>`).join('')}</svg>
      <div class="orb-panel" aria-live="polite"><p class="orb-k"></p><h3 class="orb-t"></h3><p class="orb-d"></p><ul class="orb-links"></ul></div>`;
    anchor.insertAdjacentElement('beforebegin', box);
    const k = box.querySelector('.orb-k'), t = box.querySelector('.orb-t'), d = box.querySelector('.orb-d'), ul = box.querySelector('.orb-links');
    let cur = -1, timer = null, touched = false;
    const show = i => { cur = i; const n = nodes[i]; box.style.setProperty('--c', n.c); k.textContent = n.kicker || ''; t.textContent = n.title; d.textContent = n.desc || ''; d.hidden = !n.desc;
      ul.innerHTML = (n.links || []).map(l => `<li><a href="${l.href}" data-go="${l.go || ''}">${esc(l.t)}</a></li>`).join(''); ul.hidden = !(n.links && n.links.length);
      box.querySelectorAll('[data-i]').forEach(e => e.classList.toggle('now', +e.dataset.i === i)); };
    const stop = () => { touched = true; clearInterval(timer); };
    box.querySelectorAll('.orb-n').forEach(a => { const i = +a.dataset.i; a.addEventListener('pointerenter', () => { stop(); show(i); }); a.addEventListener('focus', () => { stop(); show(i); }); a.addEventListener('click', e => { if (nodes[i].links && nodes[i].links.length > 1) { e.preventDefault(); stop(); show(i); } }); });
    box.addEventListener('pointerenter', stop);
    show(0);
    if (!reduce && 'IntersectionObserver' in window) { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !touched) timer = setInterval(() => show((cur + 1) % N), 3600); else clearInterval(timer); }, { threshold: 0.4 }); io.observe(box); }
    return box;
  }
  // Who we serve: eleven roles around one record
  const groups = document.querySelector('.groups');
  if (groups && groups.querySelectorAll('a.aud').length >= 5) {
    const nodes = []; let n = 0;
    groups.querySelectorAll('.group').forEach(g => { const c = (g.getAttribute('style') || '').match(/--c:([^;]+)/); g.querySelectorAll('a.aud').forEach(a => { n++; nodes.push({ n: String(n).padStart(2, '0'), c: c ? c[1].trim() : 'var(--persian-blue)', kicker: txt(g.querySelector('h3')), title: txt(a.querySelector('b')), desc: txt(a.querySelector('span')), href: a.getAttribute('href'), go: a.dataset.go, links: [{ t: txt(a.querySelector('b')) + ' →', href: a.getAttribute('href'), go: a.dataset.go }] }); }); });
    orbit(groups, nodes, txt(groups.closest('section').querySelector('h2'))); groups.classList.add('orb-on');
  }
  // Capabilities: eight groups around one record
  const cm = document.querySelector('.life.cmap-nav');
  if (cm && (document.querySelector('figure.cmap') || /^\/(ar\/|ms\/|tr\/|hi\/)?markets\/?$/.test(location.pathname))) {
    const sts = [...cm.querySelectorAll('.life-st')]; if (sts.length >= 4) {
      const nodes = sts.map(st => { const c = (st.getAttribute('style') || '').match(/--c:([^;]+)/); const links = [...st.querySelectorAll('li a')].map(a => ({ t: txt(a), href: a.getAttribute('href'), go: a.dataset.go })); return { n: txt(st.querySelector('.life-n')) || '', c: c ? c[1].trim() : 'var(--persian-blue)', kicker: '', title: txt(st.querySelector('h3')), desc: '', href: links[0] ? links[0].href : '#', go: links[0] && links[0].go, links }; });
      orbit(cm, nodes, txt(cm.closest('section').querySelector('h2'))); cm.classList.add('orb-on');
    }
  }
  // Contact: the local time at each office
  const offs = [...document.querySelectorAll('.offices .office')];
  if (offs.length >= 5) {
    const zones = ['Asia/Riyadh', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Kuala_Lumpur', 'Europe/Istanbul'];
    const lang = document.documentElement.lang || 'en'; const loc = { ar: 'ar-SA-u-nu-latn', hi: 'hi-IN-u-nu-latn' }[lang] || lang;
    const clocks = zones.map((z, i) => { const t = document.createElement('p'); t.className = 'office-t'; offs[i].appendChild(t); let f; try { f = new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: z }); } catch (e) { return null; } return { t, f, z }; }).filter(Boolean);
    const tick = () => clocks.forEach(({ t, f, z }) => { const h = +new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: z }).format(new Date()); t.innerHTML = `<i class="${h >= 6 && h < 19 ? 'day' : 'night'}" aria-hidden="true"></i><time>${f.format(new Date())}</time>`; });
    tick(); setInterval(tick, 20000);
  }
  // soft spotlight on cards
  if (matchMedia('(hover:hover)').matches && !reduce) document.querySelectorAll('.rcard, .ch-c, .aud').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
})();

/* ---------- Today / With T57: drag to compare (audience and market pages) ---------- */
(() => {
  const gl = document.querySelector('.glance .gl-rows'); if (!gl) return;
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '') || '/';
  if (!/^\/(who-we-serve\/.+|markets|markets\/global-rollout|why-t57\/club-membership|platform\/domestic-trade)\/?$/.test(path)) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const sr = el => { const c = el.cloneNode(true); c.querySelectorAll('.sr').forEach(x => x.remove()); return c.textContent.trim().replace(/\s+/g, ' '); };
  const rows = [...gl.children].map(li => ({ ic: li.querySelector('.gl-ic'), k: sr(li.querySelector('.gl-k')), b: sr(li.querySelector('.gl-b')), a: sr(li.querySelector('.gl-a')) })).filter(r => r.b && r.a);
  if (rows.length < 2) return;
  const legend = [...document.querySelectorAll('.glance .gl-legend span')].map(x => x.textContent.trim()); const title = (document.querySelector('.glance .gl-h') || {}).textContent || '';
  const sec = document.querySelector('main .chapter, .chapter'); if (!sec) return;
  const layer = (cls, key) => `<ul class="cmp-l ${cls}">${rows.map(r => `<li>${r.ic ? r.ic.outerHTML : ''}<span class="cmp-k">${esc(r.k)}</span><b>${esc(r[key])}</b></li>`).join('')}</ul>`;
  const el = document.createElement('section'); el.className = 'chapter cmp-sec gutter'; el.setAttribute('aria-label', title.trim());
  el.innerHTML = `<div class="wrap"><h2 class="h2">${esc(title.trim())}</h2><div class="cmp" style="--x:50%;--v:.5"><div class="cmp-tags"><span>${esc(legend[0] || '')}</span><span>${esc(legend[1] || '')}</span></div>${layer('cmp-with', 'a')}<div class="cmp-today">${layer('cmp-was', 'b')}</div><input class="cmp-r" type="range" min="0" max="100" value="50" aria-label="${esc((legend[0] || '') + ' / ' + (legend[1] || ''))}"></div></div>`;
  sec.insertAdjacentElement('afterend', el);
  const cmp = el.querySelector('.cmp'), r = el.querySelector('.cmp-r');
  const set = v => { cmp.style.setProperty('--x', v + '%'); cmp.style.setProperty('--v', (v / 100).toFixed(3)); cmp.classList.toggle('is-with', v >= 50); }; r.addEventListener('input', () => set(r.value));
  if (!reduce && 'IntersectionObserver' in window) { const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now(); const f = now => { const k = (now - t0) / 2600; if (k >= 1 || cmp.dataset.touched) return; const v = 50 + Math.sin(k * Math.PI * 2) * 34 * (1 - k); r.value = v; set(v.toFixed(1)); requestAnimationFrame(f); }; requestAnimationFrame(f); }, { threshold: 0.5 }); io.observe(cmp); r.addEventListener('pointerdown', () => { cmp.dataset.touched = '1'; }); }
})();

/* ---------- Blog index: articles by topic ---------- */
(() => {
  const bar = document.querySelector('.bl-bar'); if (!bar) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const btns = [...bar.querySelectorAll('button[data-t]')].filter(b => b.dataset.t !== 'all' && b.querySelector('em'));
  if (btns.length < 3) return;
  const rows = btns.map(b => ({ b, n: +b.querySelector('em').textContent, label: b.cloneNode(true) })); rows.forEach(r => { r.label.querySelector('em').remove(); r.label = r.label.textContent.trim(); });
  const total = rows.reduce((a, r) => a + r.n, 0), max = Math.max(...rows.map(r => r.n));
  const all = bar.querySelector('button[data-a="all"] em');
  const fig = document.createElement('div'); fig.className = 'tbars'; fig.setAttribute('role', 'group');
  fig.innerHTML = `<p class="tb-t"><b>${total}</b></p><ul>${rows.sort((a, b) => b.n - a.n).map((r, i) => `<li style="--k:${i};--w:${Math.round(r.n / max * 100)}"><button type="button" data-t="${r.b.dataset.t}"><span class="tb-l">${esc(r.label)}</span><span class="tb-b"><i></i></span><span class="tb-n">${r.n}</span></button></li>`).join('')}</ul>`;
  bar.insertAdjacentElement('beforebegin', fig);
  fig.querySelectorAll('button').forEach(x => x.addEventListener('click', () => { const t = btns.find(b => b.dataset.t === x.dataset.t); if (t) { t.click(); bar.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } }));
  const sync = () => fig.querySelectorAll('button').forEach(x => { const t = btns.find(b => b.dataset.t === x.dataset.t); x.classList.toggle('on', !!t && t.getAttribute('aria-pressed') === 'true'); });
  bar.addEventListener('click', () => setTimeout(sync, 0)); sync();
  if (reduce || !('IntersectionObserver' in window)) fig.classList.add('in'); else { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fig.classList.add('in'); o.disconnect(); } }, { threshold: 0.3 }); o.observe(fig); }
})();

/* ---------- Leadership: people filter; Careers: five countries, live ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const ph = (document.getElementById('srch-q') || {}).placeholder || '';
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  if (path === '/about/leadership') {
    const cards = [...document.querySelectorAll('.pc, .adv, .roster li')]; if (!cards.length) return;
    const secs = [...document.querySelectorAll('.chapter')].map(sec => ({ sec, n: sec.querySelectorAll('.pc, .adv, .roster li').length, h: txt(sec.querySelector('h2')) })).filter(x => x.n && x.h);
    const first = document.querySelector('.chapter .standfirst, .chapter .lede'); const anchor = first ? first.closest('.wrap') || first : null;
    const box = document.createElement('div'); box.className = 'ppl';
    const advs = [...document.querySelectorAll('.adv')]; const exp = {}; advs.forEach(a => { const e = txt(a.querySelector('em')); if (e) exp[e] = (exp[e] || 0) + 1; });
    box.innerHTML = `<ul class="ppl-c">${secs.map(x => `<li><b data-n="${x.n}">${x.n}</b><span>${esc(x.h)}</span></li>`).join('')}</ul>${ph ? `<input class="hfilter ppl-f" type="search" placeholder="${esc(ph)}" aria-label="${esc(ph)}" autocomplete="off">` : ''}<div class="ppl-e" role="group">${Object.entries(exp).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<button type="button" aria-pressed="false" data-e="${esc(k)}">${esc(k)}<em>${n}</em></button>`).join('')}</div>`;
    if (anchor) anchor.insertAdjacentElement('beforeend', box); else document.querySelector('main, body').prepend(box);
    let q = '', ex = '';
    const apply = () => cards.forEach(c => { const t = c.textContent.toLowerCase(); const okq = !q || t.includes(q); const okx = !ex || (c.classList.contains('adv') && txt(c.querySelector('em')) === ex); c.hidden = !(okq && okx); });
    const inp = box.querySelector('.ppl-f'); if (inp) inp.addEventListener('input', () => { q = inp.value.toLowerCase().trim(); apply(); });
    box.querySelectorAll('.ppl-e button').forEach(b => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; box.querySelectorAll('.ppl-e button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', on ? 'true' : 'false'); ex = on ? b.dataset.e : ''; apply(); }));
    if (!reduce && 'IntersectionObserver' in window) { const o = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; o.disconnect(); const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / 1200); box.querySelectorAll('[data-n]').forEach(b => { b.textContent = Math.round(+b.dataset.n * (1 - (1 - k) ** 3)); }); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }, { threshold: 0.5 }); o.observe(box); }
  }
  if (path === '/about/careers') {
    const f = document.querySelector('.fmts'); if (!f) return;
    const lang = document.documentElement.lang || 'en'; const loc = { ar: 'ar-SA-u-nu-latn', hi: 'hi-IN-u-nu-latn' }[lang] || lang;
    const co = [['SA', 'Asia/Riyadh'], ['AE', 'Asia/Dubai'], ['IN', 'Asia/Kolkata'], ['MY', 'Asia/Kuala_Lumpur'], ['TR', 'Europe/Istanbul']];
    let dn; try { dn = new Intl.DisplayNames([lang], { type: 'region' }); } catch (e) { dn = null; }
    const ul = document.createElement('ul'); ul.className = 'five-co';
    ul.innerHTML = co.map(([r, z]) => `<li><b>${esc(dn ? dn.of(r) : r)}</b><span class="fc-t"></span></li>`).join('');
    f.insertAdjacentElement('afterend', ul);
    const tick = () => co.forEach(([r, z], i) => { const d = new Date(); const h = +new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: z }).format(d); ul.children[i].querySelector('.fc-t').innerHTML = `<i class="${h >= 6 && h < 19 ? 'day' : 'night'}" aria-hidden="true"></i><time>${new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: z }).format(d)}</time>`; });
    tick(); setInterval(tick, 20000);
  }
})();

/* ---------- Investors numbers, Demo progress, Media tiles and copy ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const lang = document.documentElement.lang || 'en';
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  if (path === '/about/investors') {
    const els = [...document.querySelectorAll('.facts dd, .feats .feat b')];
    const targets = [];
    els.forEach(el => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const m = n.nodeValue.match(/(?<![A-Za-z0-9])(\$?)(\d[\d,]*(?:\.\d+)?)(\+|%)?/); if (m) { const sp = document.createElement('b'); sp.className = 'numhi'; sp.dataset.to = m[2].replace(/,/g, ''); sp.dataset.dec = (m[2].split('.')[1] || '').length; sp.dataset.pre = m[1]; sp.dataset.suf = m[3] || ''; sp.textContent = m[0]; const i = m.index; const after = n.splitText(i); after.nodeValue = after.nodeValue.slice(m[0].length); n.parentNode.insertBefore(sp, after); targets.push(sp); break; } } });
    if (!reduce && 'IntersectionObserver' in window) { const o = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; o.unobserve(e.target); const t = e.target, to = +t.dataset.to, dec = +t.dataset.dec, t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / 1400); t.textContent = t.dataset.pre + (to * (1 - (1 - k) ** 3)).toFixed(dec) + t.dataset.suf; if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }), { threshold: 0.6 }); targets.forEach(t => { t.textContent = t.dataset.pre + (0).toFixed(+t.dataset.dec) + t.dataset.suf; o.observe(t); }); }
  }
  if (path === '/contact/demo') {
    const form = document.querySelector('form.mform'), see = [...document.querySelectorAll('.demo-see ul.need li')]; if (!form || !see.length) return;
    const req = [...form.querySelectorAll('input[required], select[required]')]; const fields = req.length ? req : [...form.querySelectorAll('input:not([type=checkbox]):not([type=hidden])')].slice(0, 3);
    const submit = form.querySelector('button[type=submit], .btn'); const bar = document.createElement('div'); bar.className = 'demo-meter'; bar.innerHTML = '<span class="dm-bar" aria-hidden="true"><i></i></span><b class="dm-c" aria-live="polite">0 / ' + fields.length + '</b>';
    (submit ? submit.parentNode : form).insertBefore(bar, submit || null);
    const fill = bar.querySelector('i'), cnt = bar.querySelector('.dm-c');
    const upd = () => { const k = fields.filter(f => f.value.trim() && (f.type !== 'email' || f.checkValidity())).length; fill.style.transform = 'scaleX(' + (k / fields.length) + ')'; cnt.textContent = k + ' / ' + fields.length; const lit = Math.ceil(k / fields.length * see.length); see.forEach((li, i) => li.classList.toggle('lit', i < lit)); };
    form.addEventListener('input', upd); upd();
  }
  if (path === '/about/media') {
    const need = document.querySelector('ul.need'); if (need) need.classList.add('dl-tiles');
    const facts = document.querySelector('dl.facts');
    if (facts) { const L = { en: ['Copy fact sheet', 'Copied'], ar: ['نسخ ورقة الحقائق', 'تم النسخ'], ms: ['Salin helaian fakta', 'Disalin'], tr: ['Bilgi notunu kopyala', 'Kopyalandı'], hi: ['तथ्य-पत्र कॉपी करें', 'कॉपी हो गया'] }[lang] || ['Copy fact sheet', 'Copied'];
      const b = document.createElement('button'); b.type = 'button'; b.className = 'copy-btn'; b.textContent = L[0]; facts.insertAdjacentElement('beforebegin', b);
      b.addEventListener('click', async () => { const text = [...facts.querySelectorAll(':scope > div')].map(d => d.querySelector('dt').textContent.trim() + ': ' + d.querySelector('dd').textContent.trim()).join('\n'); try { await navigator.clipboard.writeText(text); } catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e2) {} ta.remove(); } b.textContent = L[1]; b.classList.add('ok'); setTimeout(() => { b.textContent = L[0]; b.classList.remove('ok'); }, 1800); }); }
  }
})();

/* ---------- Journey HUD, Food Security supply swap and Hormuz range, SDG ring ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  // Journey: a running tally while you read the timeline
  const tl = document.querySelector('.jr-tl');
  if (tl) {
    const items = [...tl.querySelectorAll('.jr-i')]; const fbtn = [...document.querySelectorAll('.jr-f button[data-f]')].filter(b => b.dataset.f !== 'all');
    const names = {}; fbtn.forEach(b => { const c = b.cloneNode(true); const em = c.querySelector('em'); if (em) em.remove(); names[b.dataset.f] = c.textContent.trim(); });
    const keys = fbtn.map(b => b.dataset.f);
    if (items.length && keys.length) {
      const hud = document.createElement('div'); hud.className = 'jr-hud'; hud.setAttribute('aria-hidden', 'true');
      hud.innerHTML = `<b class="jh-y"></b><span class="jh-n"></span><ul>${keys.map(k => `<li data-f="${k}"><b>0</b><span>${esc(names[k])}</span></li>`).join('')}</ul>`; document.body.appendChild(hud);
      const yEls = [...tl.querySelectorAll('.jr-y')];
      const f = () => { const r = tl.getBoundingClientRect(); hud.classList.toggle('on', r.top < innerHeight * .5 && r.bottom > innerHeight * .4); if (!hud.classList.contains('on')) return;
        const mid = innerHeight * .62; const vis = items.filter(i => !i.hidden && i.offsetParent !== null); const seen = vis.filter(i => i.getBoundingClientRect().top < mid);
        const counts = {}; keys.forEach(k => counts[k] = 0); seen.forEach(i => (i.dataset.k || '').split(/\s+/).forEach(k => { if (k in counts) counts[k]++; }));
        hud.querySelector('.jh-n').textContent = seen.length + ' / ' + vis.length; hud.querySelectorAll('li').forEach(li => { li.querySelector('b').textContent = counts[li.dataset.f]; });
        const y = yEls.filter(h => h.getBoundingClientRect().top < mid).pop() || yEls[0]; hud.querySelector('.jh-y').textContent = txt(y); };
      addEventListener('scroll', () => requestAnimationFrame(f), { passive: true }); addEventListener('resize', f); f();
    }
  }
  // Food security: the at-risk origin hands over to a surplus origin
  const sb = document.querySelector('.sboard ul');
  if (sb) {
    const rows = [...sb.children]; const risky = rows.filter(r => r.classList.contains('sb-at-risk') || r.classList.contains('sb-short')); const sur = rows.filter(r => r.classList.contains('sb-surplus'));
    if (risky.length && sur.length) {
      sb.style.position = 'relative'; const NS = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'sb-link'); svg.setAttribute('aria-hidden', 'true'); const pth = document.createElementNS(NS, 'path'); pth.setAttribute('pathLength', '1'); svg.appendChild(pth); sb.appendChild(svg);
      let n = 0, timer = null;
      const step = () => { const a = risky[n % risky.length]; const prod = txt(a.querySelector('b')); const b = sur.find(r => txt(r.querySelector('b')) === prod) || sur[0];
        rows.forEach(r => r.classList.remove('sw-a', 'sw-b')); a.classList.add('sw-a');
        const ay = a.offsetTop + a.offsetHeight / 2, by = b.offsetTop + b.offsetHeight / 2, w = sb.offsetWidth, x = w - 10;
        svg.setAttribute('viewBox', `0 0 ${w} ${sb.offsetHeight}`); pth.setAttribute('d', `M${x - 40} ${ay} H${x} V${by} H${x - 40}`); pth.style.transition = 'none'; pth.style.strokeDashoffset = 1; void pth.getBoundingClientRect(); pth.style.transition = 'stroke-dashoffset 1.1s .3s cubic-bezier(.2,.8,.2,1)'; pth.style.strokeDashoffset = 0;
        setTimeout(() => b.classList.add('sw-b'), 1200); n++; };
      if (!reduce && 'IntersectionObserver' in window) { const io = new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting) { step(); timer = setInterval(step, 5200); } }, { threshold: 0.5 }); io.observe(sb); }
    }
  }
  // Hormuz: a range band on a 0-100 scale
  if (path === '/about/food-security') document.querySelectorAll('.bigstats > div').forEach(d => { const b = d.querySelector('b'); const m = b && (b.dataset.n ? null : null); const t = d.textContent; const r = t.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})\s*%/); if (!r) return; const bar = d.querySelector('.bs-bar'); if (bar) { const lo = +r[1], hi = +r[2]; bar.classList.add('range'); const i = bar.querySelector('i'); i.style.setProperty('--w', hi - lo); i.style.marginInlineStart = lo + '%'; i.style.width = (hi - lo) + '%'; } });
  // SDG: 17 goals in a ring, the ones T57 contributes to lit
  const sdgs = [...document.querySelectorAll('.sdgs .sdg')];
  if (sdgs.length) {
    const cov = {}; sdgs.forEach(t => { cov[+txt(t.querySelector('.sdg-n'))] = { c: (t.getAttribute('style') || '').match(/--s:([^;]+)/)?.[1] || '#8f93ff', title: txt(t.querySelector('b')), tg: txt(t.querySelector('em')), d: txt(t.querySelector('p')) }; });
    const C = 180, R = 136, W = 44, N = 17, gap = 1.6; const pol = (a, r) => [C + r * Math.cos((a - 90) * Math.PI / 180), C + r * Math.sin((a - 90) * Math.PI / 180)];
    const seg = Array.from({ length: N }, (_, i) => { const a0 = i * 360 / N + gap / 2, a1 = (i + 1) * 360 / N - gap / 2; const [x0, y0] = pol(a0, R), [x1, y1] = pol(a1, R); const [lx, ly] = pol((a0 + a1) / 2, R); const g = cov[i + 1]; return `<g class="sr-g${g ? ' cov' : ''}" data-g="${i + 1}" style="--s:${g ? g.c : '#ffffff'};--k:${i}"${g ? ' tabindex="0"' : ''}><path pathLength="1" d="M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}"/><text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle">${i + 1}</text></g>`; }).join('');
    const box = document.createElement('div'); box.className = 'sdg-ring dv'; box.setAttribute('role', 'group');
    const total = Object.keys(cov).length;
    box.innerHTML = `<svg viewBox="0 0 360 360" class="sr-svg">${seg}<text class="sr-c" x="180" y="186" text-anchor="middle">${total}</text><text class="sr-c2" x="180" y="214" text-anchor="middle">/ ${N}</text></svg><div class="sr-info" aria-live="polite"><p class="sr-k"></p><h3 class="sr-t"></h3><p class="sr-d"></p></div>`;
    sdgs[0].closest('.sdgs').insertAdjacentElement('beforebegin', box);
    const k = box.querySelector('.sr-k'), t = box.querySelector('.sr-t'), d = box.querySelector('.sr-d'); let cur = 0, timer = null, touched = false; const list = Object.keys(cov).map(Number);
    const show = n => { cur = n; const g = cov[n]; box.style.setProperty('--c', g.c); k.textContent = n + ' · ' + g.tg; t.textContent = g.title; d.textContent = g.d; box.querySelectorAll('.sr-g').forEach(x => x.classList.toggle('now', +x.dataset.g === n)); };
    box.querySelectorAll('.sr-g.cov').forEach(x => { const n = +x.dataset.g; x.addEventListener('pointerenter', () => { touched = true; clearInterval(timer); show(n); }); x.addEventListener('focus', () => { touched = true; clearInterval(timer); show(n); }); });
    show(list[0]);
    const go = () => { box.classList.add('in'); if (!reduce && !touched) timer = setInterval(() => show(list[(list.indexOf(cur) + 1) % list.length]), 3400); };
    if (reduce || !('IntersectionObserver' in window)) box.classList.add('in'); else { const io = new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting) go(); }, { threshold: 0.4 }); io.observe(box); }
  }
})();

/* ---------- Resources hubs: video theatre, events year ribbon, newsroom by year ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const lang = document.documentElement.lang || 'en';
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  // Videos: one big player and a playlist
  if (path === '/resources/videos') {
    const grid = document.querySelector('.vids'); const figs = grid ? [...grid.querySelectorAll(':scope > figure.vid')] : [];
    if (figs.length >= 3) {
      const items = figs.map(f => { const v = f.querySelector('video'); return { poster: v.getAttribute('poster'), src: (v.querySelector('source') || {}).src || v.getAttribute('src'), track: v.querySelector('track'), title: txt(f.querySelector('figcaption b')), d: txt(f.querySelector('figcaption p')), t: txt(f.querySelector('.vid-f > span')), label: v.getAttribute('aria-label') || '' }; });
      const th = document.createElement('div'); th.className = 'theatre';
      th.innerHTML = `<div class="th-main"><div class="th-f"><video controls playsinline preload="none"></video></div><div class="th-cap"><b></b><p></p></div></div><ol class="th-list">${items.map((x, i) => `<li><button type="button" data-i="${i}"><img src="${esc(x.poster || '')}" alt="" loading="lazy" width="160" height="90"><span><b>${esc(x.title)}</b><em>${esc(x.t)}</em></span></button></li>`).join('')}</ol>`;
      grid.insertAdjacentElement('beforebegin', th); grid.hidden = true;
      const vid = th.querySelector('video'), cb = th.querySelector('.th-cap b'), cp = th.querySelector('.th-cap p'); let cur = -1;
      const load = (i, play) => { cur = i; const x = items[i]; vid.pause(); vid.setAttribute('poster', x.poster || ''); vid.setAttribute('aria-label', x.label || x.title); vid.innerHTML = `<source src="${esc(x.src)}" type="video/mp4">` + (x.track ? x.track.outerHTML : ''); vid.load(); cb.textContent = x.title; cp.textContent = x.d; th.querySelectorAll('.th-list button').forEach(b => b.classList.toggle('on', +b.dataset.i === i)); if (play) vid.play().catch(() => {}); };
      th.querySelectorAll('.th-list button').forEach(b => b.addEventListener('click', () => { load(+b.dataset.i, true); th.querySelector('.th-main').scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }));
      vid.addEventListener('ended', () => { if (cur < items.length - 1) load(cur + 1, true); });
      load(0, false);
    }
  }
  // Newsroom: announcements per year, click to filter
  if (path === '/resources/newsroom') {
    const ol = document.querySelector('ol.news-tl'); const lis = ol ? [...ol.children] : [];
    if (lis.length >= 4) {
      const yr = li => (txt(li.querySelector('time')).match(/(20\d\d)/) || [])[1]; const by = {}; lis.forEach(li => { const y = yr(li); if (y) { li.dataset.y = y; by[y] = (by[y] || 0) + 1; } });
      const years = Object.keys(by).sort((a, b) => b - a); const max = Math.max(...Object.values(by));
      const bar = document.createElement('div'); bar.className = 'yrs'; bar.setAttribute('role', 'group');
      const allL = { en: 'All', ar: 'الكل', ms: 'Semua', tr: 'Tümü', hi: 'सभी' }[lang] || 'All';
      bar.innerHTML = `<button type="button" aria-pressed="true" data-y="all"><b>${lis.length}</b><span>${esc(allL)}</span></button>` + years.map(y => `<button type="button" aria-pressed="false" data-y="${y}"><b>${by[y]}</b><i style="--h:${Math.round(by[y] / max * 100)}"></i><span>${y}</span></button>`).join('');
      ol.insertAdjacentElement('beforebegin', bar);
      bar.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); lis.forEach(li => { li.hidden = b.dataset.y !== 'all' && li.dataset.y !== b.dataset.y; }); }));
    }
  }
  // Events: a year ribbon with today and the one dated event the site already states
  if (path === '/resources/events') {
    const ev = document.querySelector('.evs'); if (ev) {
      const loc = { ar: 'ar-SA-u-nu-latn', hi: 'hi-IN-u-nu-latn' }[lang] || lang; const now = new Date(); const y = now.getFullYear();
      const f = new Intl.DateTimeFormat(loc, { month: 'short' }); const mo = Array.from({ length: 12 }, (_, m) => f.format(new Date(y, m, 1)));
      const past = ev.querySelector('.ev-c.past b'); const name = txt(past);
      const box = document.createElement('div'); box.className = 'yrib'; box.setAttribute('aria-hidden', 'true');
      box.innerHTML = `<p class="yr-y">${y}</p><ol>${mo.map((m, i) => `<li style="--k:${i}" class="${i < now.getMonth() ? 'past' : ''}${i === now.getMonth() ? ' now' : ''}"><span>${esc(m)}</span></li>`).join('')}</ol>`;
      ev.insertAdjacentElement('beforebegin', box);
      if (!reduce && 'IntersectionObserver' in window) { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { box.classList.add('in'); o.disconnect(); } }, { threshold: 0.5 }); o.observe(box); } else box.classList.add('in');
    }
  }
})();

/* ---------- AI sub-pages: before / with AI reveal; Platform sub-pages: parts wheel ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  // before / with AI
  document.querySelectorAll('.ba').forEach(ba => {
    const b = ba.querySelector('.ba-b'), a = ba.querySelector('.ba-a'); if (!b || !a) return;
    const kb = txt(b.querySelector('.ba-k')), ka = txt(a.querySelector('.ba-k')), pb = txt(b.querySelector('p:not(.ba-k)')), pa = txt(a.querySelector('p:not(.ba-k)'));
    const box = document.createElement('div'); box.className = 'bax'; box.style.setProperty('--v', 0);
    box.innerHTML = `<div class="bx-tags"><span>${esc(kb)}</span><span>${esc(ka)}</span></div><div class="bx-st"><p class="bx-b">${esc(pb)}</p><p class="bx-a">${esc(pa)}</p></div><input class="cmp-r bx-r" type="range" min="0" max="100" value="0" aria-label="${esc(kb + ' / ' + ka)}">`;
    ba.insertAdjacentElement('afterend', box); ba.hidden = true;
    const r = box.querySelector('input'); const set = v => { box.style.setProperty('--v', (v / 100).toFixed(3)); box.style.setProperty('--x', v + '%'); box.classList.toggle('is-ai', v >= 50); };
    r.addEventListener('input', () => { box.dataset.t = '1'; set(+r.value); }); set(0);
    if (!reduce && 'IntersectionObserver' in window) { const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now(); const f = now => { if (box.dataset.t) return; const k = Math.min(1, (now - t0) / 2200); const v = 100 * (1 - Math.cos(k * Math.PI)) / 2; r.value = v; set(v); if (k < 1) requestAnimationFrame(f); }; setTimeout(() => requestAnimationFrame(f), 500); }, { threshold: 0.6 }); io.observe(box); } else { r.value = 100; set(100); }
  });
  // parts wheel from an accordion
  document.querySelectorAll('.acc').forEach(acc => {
    const parts = [...acc.querySelectorAll(':scope > details.acc-i')].map(d => ({ t: txt(d.querySelector('summary')), d: txt(d.querySelector('div')) })).filter(x => x.t);
    if (parts.length < 4 || parts.length > 12) return;
    const N = parts.length, C = 180, R = 136, gap = 1.6; const pol = (a, r) => [C + r * Math.cos((a - 90) * Math.PI / 180), C + r * Math.sin((a - 90) * Math.PI / 180)];
    const seg = parts.map((x, i) => { const a0 = i * 360 / N + gap / 2, a1 = (i + 1) * 360 / N - gap / 2; const [x0, y0] = pol(a0, R), [x1, y1] = pol(a1, R); const [lx, ly] = pol((a0 + a1) / 2, R); return `<g class="sr-g cov" data-g="${i}" tabindex="0" style="--s:${i % 2 ? '#8f93ff' : '#5b5fef'};--k:${i}"><path pathLength="1" d="M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}"/><text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle">${i + 1}</text></g>`; }).join('');
    const box = document.createElement('div'); box.className = 'sdg-ring dv pw'; box.setAttribute('role', 'group'); box.style.setProperty('--c', 'var(--rosy-copper)');
    box.innerHTML = `<svg viewBox="0 0 360 360" class="sr-svg">${seg}<text class="sr-c" x="180" y="186" text-anchor="middle">${N}</text><text class="sr-c2" x="180" y="214" text-anchor="middle"></text></svg><div class="sr-info" aria-live="polite"><p class="sr-k"></p><h3 class="sr-t"></h3><p class="sr-d"></p></div>`;
    acc.insertAdjacentElement('beforebegin', box); acc.classList.add('acc-alt');
    const k = box.querySelector('.sr-k'), t = box.querySelector('.sr-t'), d = box.querySelector('.sr-d'); let cur = 0, timer = null, touched = false;
    const show = n => { cur = n; const x = parts[n]; k.textContent = String(n + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); t.textContent = x.t; d.textContent = x.d; box.querySelectorAll('.sr-g').forEach(g => g.classList.toggle('now', +g.dataset.g === n)); };
    box.querySelectorAll('.sr-g').forEach(g => { const n = +g.dataset.g; const take = () => { touched = true; clearInterval(timer); show(n); }; g.addEventListener('pointerenter', take); g.addEventListener('focus', take); g.addEventListener('click', take); });
    show(0);
    const go = () => { box.classList.add('in'); if (!reduce && !touched) timer = setInterval(() => show((cur + 1) % N), 3600); };
    if (reduce || !('IntersectionObserver' in window)) box.classList.add('in'); else { const io = new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting) go(); }, { threshold: 0.4 }); io.observe(box); }
  });
})();

/* ---------- Capability feature explorer; blog contents ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  // capability pages: features as an explorer
  if (/^\/capabilities\/[^/]+\/[^/]+/.test(path) || /^\/markets\/[^/]+\/features$/.test(path)) document.querySelectorAll('.chapter .feats').forEach(fe => {
    const items = [...fe.querySelectorAll(':scope > .feat')].map(f => ({ b: txt(f.querySelector('b')), d: txt(f.querySelector('span')) })).filter(x => x.b && x.d);
    if (items.length < 5 || items.length > 14 || fe.querySelector('a.feat')) return;
    const N = items.length;
    const box = document.createElement('div'); box.className = 'fxe'; box.setAttribute('role', 'group');
    box.innerHTML = `<ol class="fx-l">${items.map((x, i) => `<li><button type="button" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(x.b)}</b></button></li>`).join('')}</ol><div class="fx-p" aria-live="polite"><p class="fx-n"></p><h3 class="fx-t"></h3><p class="fx-d"></p><div class="fxe-bar" aria-hidden="true"><i></i></div></div>`;
    fe.insertAdjacentElement('beforebegin', box); fe.classList.add('fx-alt');
    const n = box.querySelector('.fx-n'), t = box.querySelector('.fx-t'), d = box.querySelector('.fx-d'), bar = box.querySelector('.fxe-bar i'); let cur = 0, timer = null, touched = false;
    const show = i => { cur = i; n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); t.textContent = items[i].b; d.textContent = items[i].d; box.querySelectorAll('.fx-l button').forEach(b => b.classList.toggle('on', +b.dataset.i === i)); bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; void bar.offsetWidth; if (!touched && !reduce) { bar.style.transition = 'transform 5s linear'; bar.style.transform = 'scaleX(1)'; } };
    box.querySelectorAll('.fx-l button').forEach(b => b.addEventListener('click', () => { touched = true; clearInterval(timer); show(+b.dataset.i); bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; }));
    show(0);
    if (!reduce && 'IntersectionObserver' in window) { const io = new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting && !touched) { show(cur); timer = setInterval(() => show((cur + 1) % N), 5000); } }, { threshold: 0.4 }); io.observe(box); }
  });
  // blog posts: contents with the section you are reading
  const body = document.querySelector('.post-body'), side = document.querySelector('.post-side');
  if (body && side) {
    const hs = [...body.querySelectorAll('h2')]; if (hs.length >= 3) {
      hs.forEach((h, i) => { if (!h.id) h.id = 'sec-' + (i + 1); });
      const L = { en: ['In this article', 'Copy link', 'Copied'], ar: ['في هذا المقال', 'نسخ الرابط', 'تم النسخ'], ms: ['Dalam artikel ini', 'Salin pautan', 'Disalin'], tr: ['Bu yazıda', 'Bağlantıyı kopyala', 'Kopyalandı'], hi: ['इस लेख में', 'लिंक कॉपी करें', 'कॉपी हो गया'] }[document.documentElement.lang || 'en'] || ['In this article', 'Copy link', 'Copied'];
      const nav = document.createElement('nav'); nav.className = 'post-toc'; nav.setAttribute('aria-label', L[0]);
      nav.innerHTML = `<p class="eyebrow">${esc(L[0])}</p><ol>${hs.map(h => `<li><a href="#${h.id}">${esc(txt(h))}</a></li>`).join('')}</ol><button type="button" class="copy-btn">${esc(L[1])}</button>`;
      side.appendChild(nav);
      const btn = nav.querySelector('button'); btn.addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); } catch (e) {} btn.textContent = L[2]; btn.classList.add('ok'); setTimeout(() => { btn.textContent = L[1]; btn.classList.remove('ok'); }, 1800); });
      if ('IntersectionObserver' in window) { const links = [...nav.querySelectorAll('a')]; const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-20% 0px -70% 0px' }); hs.forEach(h => io.observe(h)); }
    }
  }
})();

/* ---------- Audience pages: where this role sits among the eleven ---------- */
(() => {
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  if (!/^\/who-we-serve\/[^/]+$/.test(path)) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lang = document.documentElement.lang || 'en'; const cta = document.querySelector('.cta'); if (!cta) return;
  const file = lang === 'ar' ? 'search-ar' : lang === 'ms' ? 'search-ms' : lang === 'tr' ? 'search-tr' : lang === 'hi' ? 'search-hi' : 'search';
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const T = { en: ['One record, eleven roles', 'You are here'], ar: ['سجلّ واحد، إحدى عشرة صفة', 'أنت هنا'], ms: ['Satu rekod, sebelas peranan', 'Anda di sini'], tr: ['Tek kayıt, on bir rol', 'Buradasınız'], hi: ['एक रिकॉर्ड, ग्यारह भूमिकाएँ', 'आप यहाँ हैं'] }[lang] || ['One record, eleven roles', 'You are here'];
  fetch('/proto/' + file + '.json').then(r => r.json()).then(d => {
    const base = path; const all = d.filter(p => /^\/who-we-serve\/[^/]+$/.test(p[1].replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '')) && !/\/who-we-serve$/.test(p[1]));
    const me = all.find(p => p[1].replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') === base); if (!me || all.length < 6) return;
    const others = all.filter(p => p !== me); const N = others.length, C = 250, R = 190;
    const pos = others.map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [C + Math.cos(a) * R, C + Math.sin(a) * R]; });
    const sec = document.createElement('section'); sec.className = 'chapter aud-ring gutter'; sec.setAttribute('aria-label', T[0]);
    sec.innerHTML = `<div class="wrap"><h2 class="h2">${esc(T[0])}</h2><div class="ar-wrap"><svg viewBox="0 0 500 500" class="ar-svg">${pos.map((q, i) => `<line class="ar-l" style="--k:${i}" x1="${C}" y1="${C}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}"/>`).join('')}<circle class="ar-c" cx="${C}" cy="${C}" r="74"/><foreignObject x="${C - 66}" y="${C - 40}" width="132" height="80"><div xmlns="http://www.w3.org/1999/xhtml" class="ar-me"><small>${esc(T[1])}</small><b>${esc(me[2])}</b></div></foreignObject></svg><ul class="ar-n">${others.map((p, i) => { const q = pos[i]; return `<li style="left:${(q[0] / 5).toFixed(2)}%;top:${(q[1] / 5).toFixed(2)}%;--k:${i}"><a href="${p[1]}" data-go="${p[0]}">${esc(p[2])}</a></li>`; }).join('')}</ul></div></div>`;
    cta.parentNode.insertBefore(sec, cta);
    if (reduce || !('IntersectionObserver' in window)) sec.classList.add('in'); else { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sec.classList.add('in'); o.disconnect(); } }, { threshold: 0.3 }); o.observe(sec); }
  }).catch(() => {});
})();

/* ---------- Partners technology stack; country corridors ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  const marks = '<use href="#mk-ring"></use><use href="#mk-trade"></use><use href="#mk-tech"></use><use href="#mk-logistics"></use><use href="#mk-finance"></use><use href="#mk-agri"></use>';
  const watch = (el, th = 0.35) => { if (reduce || !('IntersectionObserver' in window)) { el.classList.add('in'); return; } const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); o.disconnect(); } }, { threshold: th }); o.observe(el); };
  // technology partners: four kinds of module plug into one record, on a cloud base
  if (path === '/partners/technology') {
    const card = document.querySelector('.ms-card'), fe = card && card.nextElementSibling;
    if (card && fe && fe.classList.contains('feats')) {
      const mods = [...fe.children].map(f => ({ b: txt(f.querySelector('b')), d: txt(f.querySelector('span')), href: f.getAttribute('href') })).filter(m => m.b);
      if (mods.length >= 3) {
        const box = document.createElement('div'); box.className = 'tstack'; box.setAttribute('role', 'group');
        box.innerHTML = `<div class="ts-mods">${mods.map((m, i) => `<${m.href ? 'a href="' + m.href + '"' : 'div'} class="ts-m" style="--k:${i}"><b>${esc(m.b)}</b><span>${esc(m.d)}</span><i aria-hidden="true"></i></${m.href ? 'a' : 'div'}>`).join('')}</div><div class="ts-rec"><svg viewBox="774 418 250 244" aria-hidden="true">${marks}</svg><b>T57</b></div><div class="ts-base"><small>${esc(txt(card.querySelector('.eyebrow')))}</small><b>${esc(txt(card.querySelector('.ms-name')))}</b><span>${esc(txt(card.querySelector('p:not(.eyebrow):not(.ms-name)')))}</span></div>`;
        card.insertAdjacentElement('beforebegin', box); card.hidden = true; fe.hidden = true; watch(box);
      }
    }
  }
  // country overview: the four corridors, with goods moving both ways
  const corr = document.querySelector('.corr');
  if (corr && /^\/markets\/[^/]+\/overview$/.test(path)) {
    const items = [...corr.querySelectorAll('.corr-i')].map(c => ({ b: txt(c.querySelector('b')), d: txt(c.querySelector('span')) })).filter(x => x.b);
    const me = (document.title.split(/\s[|·–—-]\s/)[0] || '').replace(/overview/i, '').trim();
    if (items.length >= 3) {
      const N = items.length, C = 250, R = 170; const pos = items.map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N + Math.PI / N; return [C + Math.cos(a) * R, C + Math.sin(a) * R]; });
      const box = document.createElement('div'); box.className = 'crr'; box.setAttribute('role', 'group');
      box.innerHTML = `<svg viewBox="0 0 500 500" class="crr-svg">${pos.map((q, i) => `<g class="crr-g" data-i="${i}"><path id="cr${i}" class="crr-p" d="M${C} ${C} L${q[0].toFixed(1)} ${q[1].toFixed(1)}"/><path class="crr-p2" d="M${q[0].toFixed(1)} ${q[1].toFixed(1)} L${C} ${C}"/>${reduce ? '' : `<circle r="4" class="crr-d out"><animateMotion dur="${2.6 + i * .3}s" repeatCount="indefinite" path="M${C} ${C} L${q[0].toFixed(1)} ${q[1].toFixed(1)}"/></circle><circle r="4" class="crr-d in"><animateMotion dur="${2.6 + i * .3}s" begin="${(1.3).toFixed(1)}s" repeatCount="indefinite" path="M${q[0].toFixed(1)} ${q[1].toFixed(1)} L${C} ${C}"/></circle>`}<a href="#" class="crr-n"><circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="34"/><text x="${q[0].toFixed(1)}" y="${(q[1] + 4).toFixed(1)}" text-anchor="middle">${esc(items[i].b)}</text></a></g>`).join('')}<circle class="crr-c" cx="${C}" cy="${C}" r="58"/><text class="crr-me" x="${C}" y="${C + 5}" text-anchor="middle">${esc(me)}</text></svg><div class="crr-p3" aria-live="polite"><p class="orb-k"></p><h3 class="orb-t"></h3><p class="orb-d"></p></div>`;
      corr.insertAdjacentElement('beforebegin', box); corr.hidden = true;
      const k = box.querySelector('.orb-k'), t = box.querySelector('.orb-t'), d = box.querySelector('.orb-d'); let cur = 0, timer = null, touched = false;
      const show = i => { cur = i; k.textContent = me + ' ⇄'; t.textContent = items[i].b; d.textContent = items[i].d; box.querySelectorAll('.crr-g').forEach(g => g.classList.toggle('now', +g.dataset.i === i)); };
      box.querySelectorAll('.crr-n').forEach(a => { const i = +a.closest('.crr-g').dataset.i; a.addEventListener('click', e => e.preventDefault()); a.addEventListener('pointerenter', () => { touched = true; clearInterval(timer); show(i); }); a.addEventListener('focus', () => { touched = true; clearInterval(timer); show(i); }); });
      show(0);
      if (!reduce && 'IntersectionObserver' in window) { const io = new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting && !touched) timer = setInterval(() => show((cur + 1) % N), 4200); }, { threshold: 0.4 }); io.observe(box); }
    }
  }
})();

/* ---------- Pricing overview: fee calculator; Government: programme builder ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const txt = el => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
  const lang = document.documentElement.lang || 'en';
  const path = location.pathname.replace(/^\/(ar|ms|tr|hi)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  if (path === '/pricing') {
    const fx = document.querySelector('.fee-ex'), steps = [...document.querySelectorAll('.ladder .ld-step')], fees = [...document.querySelectorAll('.ladder .ld-fee text')];
    if (fx && steps.length >= 3 && fees.length === steps.length) {
      const plans = steps.map((st, i) => ({ n: txt(st.querySelector('.ld-n')), m: txt(st.querySelector('.ld-p')), r: parseFloat(txt(fees[i]).replace(',', '.')) })).filter(x => x.n && x.r);
      const L = { en: ['Try it: what a trade costs', 'Trade value', 'Plan', 'Fee per side', 'Each side pays this. Finance, escrow, insurance and logistics are quoted by licensed partners.'], ar: ['جرّب: كم تكلّف الصفقة', 'قيمة الصفقة', 'الخطة', 'الرسوم لكل طرف', 'يدفع كل طرف هذا المبلغ. التمويل والضمان والتأمين والخدمات اللوجستية تسعّرها الجهات المرخّصة.'], ms: ['Cuba: kos sesuatu dagangan', 'Nilai dagangan', 'Pelan', 'Yuran setiap pihak', 'Setiap pihak membayar ini. Pembiayaan, eskrow, insurans dan logistik ditawarkan oleh rakan berlesen.'], tr: ['Deneyin: bir işlemin maliyeti', 'İşlem tutarı', 'Plan', 'Taraf başına ücret', 'Her taraf bunu öder. Finansman, emanet, sigorta ve lojistik lisanslı ortaklarca fiyatlanır.'], hi: ['आज़माइए: एक सौदे की लागत', 'सौदे का मूल्य', 'प्लान', 'प्रति पक्ष शुल्क', 'हर पक्ष यह चुकाता है। वित्त, एस्क्रो, बीमा और लॉजिस्टिक्स की कीमत लाइसेंस प्राप्त भागीदार तय करते हैं।'] }[lang] || [];
      const fmt = v => new Intl.NumberFormat({ ar: 'ar-SA-u-nu-latn', hi: 'hi-IN-u-nu-latn' }[lang] || lang, { style: 'currency', currency: 'USD', maximumFractionDigits: v < 100 ? 2 : 0 }).format(v);
      const box = document.createElement('div'); box.className = 'feec'; let plan = Math.min(1, plans.length - 1), val = 20000;
      box.innerHTML = `<h3>${esc(L[0])}</h3><div class="fc-row"><label for="fc-v">${esc(L[1])}</label><output class="fc-val"></output></div><input id="fc-v" class="cmp-r fc-r" type="range" min="0" max="100" value="50" step="1"><div class="fc-plans" role="group" aria-label="${esc(L[2])}">${plans.map((x, i) => `<button type="button" data-i="${i}" aria-pressed="${i === plan}"><b>${esc(x.n)}</b><span>${x.r.toFixed(2)}%</span></button>`).join('')}</div><div class="fc-out"><p class="fc-k">${esc(L[3])}</p><p class="fc-n"></p></div><ul class="fc-bars">${plans.map((x, i) => `<li data-i="${i}"><span>${esc(x.n)}</span><i><b></b></i><em></em></li>`).join('')}</ul><p class="fc-note">${esc(L[4])}</p>`;
      fx.insertAdjacentElement('afterend', box); fx.hidden = true;
      const r = box.querySelector('input'), vo = box.querySelector('.fc-val'), no = box.querySelector('.fc-n'); let shown = 0, raf = 0;
      const toVal = pos => Math.round(Math.pow(10, 3 + pos / 100 * 2.7) / 500) * 500 || 1000; // $1,000 .. $500,000
      const render = () => { const f = val * plans[plan].r / 100; vo.textContent = fmt(val); const t0 = performance.now(), from = shown; cancelAnimationFrame(raf); const step = now => { const k = reduce ? 1 : Math.min(1, (now - t0) / 380); shown = from + (f - from) * (1 - (1 - k) ** 3); no.textContent = fmt(shown); if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step);
        const max = val * plans[0].r / 100; box.querySelectorAll('.fc-bars li').forEach((li, i) => { const x = val * plans[i].r / 100; li.querySelector('b').style.width = (x / max * 100) + '%'; li.querySelector('em').textContent = fmt(x); li.classList.toggle('on', i === plan); }); box.querySelectorAll('.fc-plans button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.i === plan ? 'true' : 'false')); };
      r.value = Math.round((Math.log10(val) - 3) / 2.7 * 100); r.addEventListener('input', () => { val = toVal(+r.value); render(); });
      box.querySelectorAll('.fc-plans button').forEach(b => b.addEventListener('click', () => { plan = +b.dataset.i; render(); })); shown = val * plans[plan].r / 100; render();
    }
  }
  if (path === '/pricing/government') {
    const grid = document.querySelector('.gov-grid'), cards = grid ? [...grid.querySelectorAll('.gov-c')] : [];
    const progs = cards.map(c => ({ b: txt(c.querySelector('b')), d: txt(c.querySelector('span')), o: txt(c.querySelector('em')) })).filter(x => x.b && x.o);
    if (progs.length >= 4) {
      const L = { en: ['Build a national programme', 'Choose what your country needs', 'selected', 'What it means'], ar: ['ابنِ برنامجاً وطنياً', 'اختر ما يحتاجه بلدك', 'مختار', 'ماذا يعني ذلك'], ms: ['Bina program kebangsaan', 'Pilih apa yang negara anda perlukan', 'dipilih', 'Maksudnya'], tr: ['Ulusal program oluşturun', 'Ülkenizin ihtiyacını seçin', 'seçildi', 'Ne anlama gelir'], hi: ['राष्ट्रीय कार्यक्रम बनाइए', 'चुनिए आपके देश को क्या चाहिए', 'चुने गए', 'इसका मतलब'] }[lang] || [];
      const box = document.createElement('div'); box.className = 'gpb'; const on = new Set([0, 3]);
      box.innerHTML = `<div class="gp-l"><h3>${esc(L[0])}</h3><p>${esc(L[1])}</p><ul>${progs.map((x, i) => `<li><button type="button" data-i="${i}" aria-pressed="${on.has(i)}"><span class="gp-ck" aria-hidden="true"></span><span><b>${esc(x.b)}</b><small>${esc(x.d)}</small></span></button></li>`).join('')}</ul></div><div class="gp-r" aria-live="polite"><p class="gpb-c"><b></b> / ${progs.length} <span>${esc(L[2])}</span></p><ol></ol></div>`;
      grid.insertAdjacentElement('beforebegin', box); grid.classList.add('gov-alt');
      const ol = box.querySelector('ol'), nb = box.querySelector('.gpb-c b');
      const render = () => { nb.textContent = on.size; ol.innerHTML = progs.map((x, i) => on.has(i) ? `<li><i aria-hidden="true"></i><span><small>${esc(x.b)}</small>${esc(x.o)}</span></li>` : '').join(''); box.querySelectorAll('.gp-l button').forEach(b => b.setAttribute('aria-pressed', on.has(+b.dataset.i) ? 'true' : 'false')); };
      box.querySelectorAll('.gp-l button').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.i; on.has(i) ? on.delete(i) : on.add(i); render(); })); render();
    }
  }
})();
