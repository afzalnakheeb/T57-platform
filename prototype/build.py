# Builds the prototype into the Next.js app as real pages, one per sitemap route:
#   app/globals.css                 shared styles
#   content/chrome-top.html         icon defs, header and menu (shared by every page)
#   content/chrome-bottom.html      footer and the page-transition veil
#   content/pages/<id>.html         one microsite page per sitemap route
#   content/pages.json              route, title, description, H1 and FAQs per page (metadata and JSON-LD)
#   public/proto/worlds.js          scenes, explainers and transitions
#   public/llms.txt                 plain-language site summary for AI answer engines
# Run: python3 prototype/build.py
import json, re, os, html, sys
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
parts = json.load(open(f'{D}/parts.json')); led = open(f'{D}/ledger.tpl').read()
META = json.load(open(f'{D}/meta.json'))
sys.path.insert(0, D); import blog, legal, investors, photos
from svgslim import slim
META.update(blog.meta()); META.update(legal.meta()); META.update(investors.meta())
orig = ["Buyer match","AI MATCHED","Offer","PRICE INTELLIGENCE","Contract","SMART CONTRACT","Logistics","TRACKED SHIPMENT","Payment","ESCROW RELEASE"]
n = [0]
def ledger(m):
    labels, aria = m.group(1).split('|'), m.group(2)
    n[0] += 1; s = led
    for a, b in zip(orig, labels): s = s.replace(f'>{a}<', f'>{b}<', 1)
    s = s.replace('id="hexes"', f'id="hexes{n[0]}"').replace('url(#hexes)', f'url(#hexes{n[0]})')
    if aria: s = re.sub(r'aria-label="[^"]*"', f'aria-label="{aria}"', s, count=1)
    return '<figure class="ledger">\n' + s + '</figure>'
worlds = re.sub(r'\{\{LEDGER:([^}#]*)(?:#([^}]*))?\}\}', ledger, open(f'{D}/worlds.html').read()) + investors.articles() + blog.articles() + legal.articles()
worlds = photos.apply(worlds)
# The homepage partner strip scrolls through every partner on the /partnerships wall, so a logo added there shows here too.
def partner_strip():
    items = re.findall(r'<li(?: class="([^"]*)")?>(.*?)</li>', re.search(r'<ul class="pwall"[^>]*>(.*?)</ul>', worlds, re.S).group(1))
    li = lambda c, x: f'<li class="lm-tx">{x}</li>' if 'pw-tx' in c else f'<li>{x}</li>'
    run = ''.join(li(c, x) for c, x in items)
    copy = re.sub(r' alt="[^"]*"', ' alt=""', run)
    return (f'<div class="logo-marquee" role="region" aria-label="Partners" dir="ltr"><div class="lm-track">'
            f'<ul class="lm-run">{run}</ul><ul class="lm-run" aria-hidden="true">{copy}</ul></div></div>')
worlds = worlds.replace('{{PARTNER_STRIP}}', partner_strip())
# Leadership cards: a LinkedIn link for each person whose profile is confirmed, and a personal website where there is one.
LINKS = json.load(open(f'{D}/people-links.json'))
def plinks(m):
    l = LINKS.get(html.unescape(m.group(2)), {})
    a = [f'<a href="{l[k]}" target="_blank" rel="noopener">{t}</a>' for k, t in (('linkedin', 'LinkedIn'), ('web', re.sub(r'^https?://(www\.)?', '', l.get('web', '')).rstrip('/'))) if l.get(k)]
    return m.group(1) + (f'<span class="pc-links">{"".join(a)}</span>' if a else '')
worlds = re.sub(r'(<b>([^<]+)</b><em>[^<]*</em>)', plinks, worlds)
# Headshots replace the initials on cards, and lead each board roster entry, wherever a photo is on file.
def headshot(name):
    p = LINKS.get(html.unescape(name), {}).get('photo')
    return f'<img class="pc-av pc-ph" src="{p}" alt="" width="96" height="96" loading="lazy" decoding="async">' if p else ''
worlds = re.sub(r'(<span class="pc-av" aria-hidden="true">[A-Z]{1,3}</span>)((?:<div>)?<b>([^<]+)</b>)', lambda m: (headshot(m.group(3)) or m.group(1)) + m.group(2), worlds)
worlds = re.sub(r'<li><b>([^<]+)</b>', lambda m: f'<li>{headshot(m.group(1))}<b>{m.group(1)}</b>', worlds)

# Sitemap v7 routes (IDs 1-13)
# Sitemap v7 routes: an article's data-route, else Home, Who We Serve and its audiences (IDs 1-13)
arts = re.findall(r'<article class="world" id="([a-z0-9-]+)"([^>]*)>', worlds)
ROUTE = {}
for i, attrs in arts:
    m = re.search(r'data-route="([^"]+)"', attrs)
    ROUTE[i] = m.group(1) if m else '/' if i == 'home' else '/who-we-serve' if i == 'who-we-serve' else f'/who-we-serve/{i}'
PETAL = {i: re.search(r'data-petal="([^"]+)"', a).group(1) for i, a in arts if 'data-petal=' in a}

def relink(s, page=None):
    s = re.sub(r'href="#([a-z0-9-]+)"', lambda m: f'href="{ROUTE[m.group(1)]}"' if m.group(1) in ROUTE else m.group(0), s)
    if page != 'home': s = s.replace('href="#cta-home"', 'href="/#cta-home"')
    return s

t = open(f'{D}/template.html').read()
for k, v in {'DEFS': slim(parts['defs']), 'LOGO': slim(parts['logo']), 'MARK': slim(parts['mark'])}.items():
    t = t.replace('{{' + k + '}}', v)
a = t.index('<style>') + 7; b = t.index('</style>')
open(f'{R}/app/globals.css', 'w').write(t[a:b].strip() + '\n')
body = t[b + 8:]
top, bottom = body.split('{{WORLDS}}')
top = top.replace('<main id="main">', '').strip() + '\n'
bottom = bottom.replace('</main>', '', 1).strip() + '\n'
assert '{{' not in top + bottom
os.makedirs(f'{R}/content/pages', exist_ok=True)
open(f'{R}/content/chrome-top.html', 'w').write(relink(top))
open(f'{R}/content/chrome-bottom.html', 'w').write(relink(bottom))

# One hero per page: nothing hero-sized is stacked under the hero. The explainer, an arrival photo and the "Watch"
# films move below the opening challenge, and the photo band becomes a breather further down (or is dropped when the
# page already opens with a photo). Media and resource pages, whose films are the content, keep their order.
def one_hero(i, art):
    if i == 'home' or i.startswith(('res-', 'help')): return art
    parts = re.split(r'(?=\n  <(?:section|div|figure|nav)\b)', art)
    h = next((k for k, p in enumerate(parts) if p.lstrip().startswith('<section class="hero')), None)
    if h is None: return art
    kind = lambda p: ('band' if p.lstrip().startswith('<div class="pband') else 'cover' if p.lstrip().startswith('<div class="cover') else
                      'watch' if 'class="chapter gutter watch"' in p[:200] else 'arrival' if p.lstrip().startswith('<section class="arrival') else
                      'chapter' if p.lstrip().startswith('<section class="chapter') else 'other')
    lead, k = {}, h + 1
    while k < len(parts) and kind(parts[k]) in ('band', 'cover', 'watch', 'arrival'):
        lead.setdefault(kind(parts[k]), parts[k]); k += 1
    if not lead: return art
    rest = parts[k:]
    ch = [n for n, p in enumerate(rest) if kind(p) == 'chapter']
    if not ch: return art
    if '<img' in parts[h] or 'arrival' in lead: lead.pop('band', None)
    if 'cover' in lead:
        # the explainer's own caption repeats the H1: the H1 already says it
        h1 = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', re.search(r'<h1[^>]*>(.*?)</h1>', parts[h], re.S).group(1))).strip()
        lead['cover'] = re.sub(r'\s*<text class="fx-cap"[^>]*>(.*?)</text>', lambda m: '' if m.group(1).strip() == h1 else m.group(0), lead['cover'])
    ins = {}
    first = [lead[x] for x in ('arrival', 'cover') if x in lead]
    if first: ins.setdefault(ch[0], []).extend(first)
    if 'watch' in lead: ins.setdefault(ch[1] if len(ch) > 2 else ch[0], []).append(lead['watch'])
    if 'band' in lead: ins.setdefault(ch[3] if len(ch) > 4 else ch[-1] if len(ch) > 1 else ch[0], []).append(lead['band'])
    out = []
    for n, p in enumerate(rest):
        out.append(p); out.extend(ins.get(n, []))
    return ''.join(parts[:h + 1] + out)

text = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
pages, ARTS = {}, {}
for m in re.finditer(r'(<article class="world" id="([a-z0-9-]+)".*?</article>)', worlds, re.S):
    art, i = m.group(1), m.group(2)
    art = art.replace(' hidden>', '>', 1)
    art = one_hero(i, art)
    ARTS[i] = art
    h1 = text(re.search(r'<h1[^>]*>(.*?)</h1>', art, re.S).group(1))
    std = text(re.search(r'<p class="std">(.*?)</p>', art, re.S).group(1))
    faqs = [{'q': text(q), 'a': text(x)} for q, x in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', art, re.S)]
    name = re.search(r'aria-label="([^"]+)"', art).group(1)
    pages[i] = dict(route=ROUTE[i], section=ROUTE[i].strip('/').split('/')[0], name='Home' if i == 'home' else name, h1=h1, answer=std, faqs=faqs, **META[i])
    pm = re.search(r'data-parent="([^"]+)"', art[:400])
    if pm: pages[i]['parent'] = pm.group(1)
json.dump(pages, open(f'{R}/content/pages.json', 'w'), indent=1, ensure_ascii=False)

# Microsite bar: every page shows the real pages of its microsite, never jump links within the page.
# A section's bar lists its overview and first-level pages; a group with pages of its own (a capability
# group, a market) lists the group and its pages. Who We Serve lists the audiences.
BY_ROUTE = {p['route']: i for i, p in pages.items()}
def up(i):
    p = pages[i]
    if p.get('parent'): return p['parent']
    parts = p['route'].strip('/').split('/')
    for k in range(len(parts) - 1, 0, -1):
        r = '/' + '/'.join(parts[:k])
        if r in BY_ROUTE: return BY_ROUTE[r]
    return None
PARENT = {i: up(i) for i in pages if i != 'home'}
# Blog articles hang under Blog & Insights for breadcrumbs, but are not pages of the microsite bar or the menu.
POSTS = set(re.findall(r'<article class="world" id="([a-z0-9-]+)"[^>]*data-kind="post"', worlds))
KIDS = {}
for i, q in PARENT.items():
    if q and i not in POSTS: KIDS.setdefault(q, []).append(i)
def short(i, role=''):
    n = re.sub(r'\s+and\s+', ' & ', html.unescape(pages[i]['name']))
    if ': ' in n: n = n.split(': ')[0] if role == 'group' else n.split(': ', 1)[1]
    if role == 'section': n = re.sub(r' Overview$', '', n)
    return n
AUD = re.findall(r'data-go="([a-z-]+)"', re.search(r'<div class="menu-aud">.*?</ul>', t, re.S).group(0))
def bar(i):
    chain = [i]
    while PARENT.get(chain[-1]): chain.append(PARENT[chain[-1]])
    top = chain[-1]                      # section overview
    group = next((c for c in chain if c != top and KIDS.get(c) and PARENT.get(c) == top), None)
    if group:
        head, items = top, [group] + KIDS[group]
    else:
        kids = KIDS.get(top, [])
        if top == 'who-we-serve': kids = sorted(kids, key=lambda k: AUD.index(k) if k in AUD else 99)
        head, items = None, [top] + kids
    links = []
    for k in items:
        label = 'Overview' if k == top else short(k, 'group' if KIDS.get(k) else '')
        cur = ' aria-current="page"' if k == i or (k in chain and k != top and k != group) else ''
        links.append(f'<a href="#{k}" data-go="{k}"{cur}>{html.escape(label, quote=False)}</a>')
    return head, ''.join(links)
def seq(i):
    # the pages of i's microsite, in bar order
    chain = [i]
    while PARENT.get(chain[-1]): chain.append(PARENT[chain[-1]])
    top = chain[-1]
    group = next((c for c in chain if c != top and KIDS.get(c) and PARENT.get(c) == top), None)
    if group: return [group] + KIDS[group]
    kids = KIDS.get(top, [])
    if top == 'who-we-serve': kids = sorted(kids, key=lambda k: AUD.index(k) if k in AUD else 99)
    return [top] + kids
def pager(i):
    items = seq(i)
    if i not in items or len(items) < 2: return ''
    k = items.index(i)
    prev, nxt = (items[k - 1] if k else None), (items[k + 1] if k + 1 < len(items) else None)
    up_ = items[0] if i != items[0] else (PARENT.get(items[0]) or 'home')
    if prev == up_: prev = None
    cell = lambda c, cls, word: f'<a class="pg-{cls}" href="#{c}" data-go="{c}"><small>{word}</small><b>{html.escape(short(c, "group") if KIDS.get(c) and c != items[0] else ("Overview" if c == items[0] and not PARENT.get(c) else short(c)), quote=False)}</b></a>'
    back = f'<a class="pg-up" href="#{up_}" data-go="{up_}"><small>Back to</small><b>{"Home" if up_ == "home" else html.escape(short(up_, "section") if not PARENT.get(up_) else short(up_, "group"), quote=False)}</b></a>'
    return ('<nav class="pager gutter" aria-label="Pages in this section"><div class="wrap pager-in">'
            + (cell(prev, 'prev', 'Previous') if prev else '<span></span>') + back
            + (cell(nxt, 'next', 'Next') if nxt else '<span></span>') + f'<p class="pg-n">Page {k + 1} of {len(items)}</p></div></nav>\n  ')
# Breadcrumbs: every page below Home shows its trail (Home > section > group > page) in place of the
# hero eyebrow, so a visitor always sees where they are and can step back up one level at a time.
def label(k):
    if k in POSTS: return 'Article'
    if not PARENT.get(k): return short(k, 'section')
    return short(k, 'group') if KIDS.get(k) else short(k)
def crumbs(i):
    chain = [i]
    while PARENT.get(chain[-1]): chain.append(PARENT[chain[-1]])
    items = ['<li><a href="#home" data-go="home">Home</a></li>']
    for k in reversed(chain[1:]): items.append(f'<li><a href="#{k}" data-go="{k}">{html.escape(label(k), quote=False)}</a></li>')
    items.append(f'<li><span aria-current="page">{html.escape(label(i), quote=False)}</span></li>')
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + ''.join(items) + '</ol></nav>'
for i in pages:
    if PARENT.get(i): pages[i]['parent'] = PARENT[i]
json.dump(pages, open(f'{R}/content/pages.json', 'w'), indent=1, ensure_ascii=False)
CRUMBS = {i: crumbs(i) for i in pages if i != 'home'}
# Site search: a small index of every page (name, H1, summary, headings and FAQ questions), loaded only when
# a visitor opens search from the header.
def heads(a): return ' · '.join(text(h) for h in re.findall(r'<h[23][^>]*>(.*?)</h[23]>', a, re.S))[:900]
def sec_of(i):
    while PARENT.get(i): i = PARENT[i]
    return i
SEARCH = [[i, p['route'], html.unescape(p['name']), re.sub(r' Overview$', '', html.unescape(pages[sec_of(i)]['name'])) if sec_of(i) != i else '', p['h1'], p['answer'], heads(ARTS[i]), ' · '.join(f['q'] for f in p['faqs'])] for i, p in pages.items()]
os.makedirs(f'{R}/public/proto', exist_ok=True)
json.dump(SEARCH, open(f'{R}/public/proto/search.json', 'w'), ensure_ascii=False, separators=(',', ':'))


# Menu: each section opens to show its pages (and a group's pages under it), so all 141 pages are two taps away.
def sub_items(k, depth=0):
    out = []
    for c in KIDS.get(k, []):
        lab = html.escape(label(c) if not KIDS.get(c) else short(c, 'group'), quote=False)
        if KIDS.get(c) and depth == 0:
            out.append(f'<li class="grp"><a href="#{c}" data-go="{c}">{lab}</a><ul>' + ''.join(f'<li><a href="#{g}" data-go="{g}">{html.escape(label(g), quote=False)}</a></li>' for g in KIDS[c]) + '</ul></li>')
        else:
            out.append(f'<li><a href="#{c}" data-go="{c}">{lab}</a></li>')
    return ''.join(out)
def menu_sec(mm):
    k, name = mm.group(1), mm.group(2)
    if k in ('home', 'who-we-serve') or not KIDS.get(k): return mm.group(0)
    n = len(KIDS[k]) + sum(len(KIDS.get(c, [])) for c in KIDS[k])
    return (f'<li class="has-sub"><a href="#{k}" data-go="{k}">{name}<em>{n} pages</em></a>'
            f'<button class="sub-t" type="button" aria-expanded="false" aria-controls="ms-{k}"><span class="sr">Show the pages in {name}</span></button>'
            f'<ul class="menu-sub" id="ms-{k}" hidden><li><a href="#{k}" data-go="{k}">{name} overview</a></li>{sub_items(k)}</ul></li>')
top2 = re.sub(r'(<ul class="menu-l0">.*?</ul>)', lambda mm: re.sub(r'<li><a href="#([a-z0-9-]+)" data-go="[^"]+">([^<]+)<em></em></a></li>', menu_sec, mm.group(1)), top, count=1, flags=re.S)
assert top2.count('class="has-sub"') >= 10, top2.count('class="has-sub"')
open(f'{R}/content/chrome-top.html', 'w').write(relink(top2))

for i, art in ARTS.items():
    if i in CRUMBS:
        art, k = re.subn(r'(<div class="hero-copy">\s*)<p class="eyebrow">.*?</p>', lambda mm: mm.group(1) + CRUMBS[i], art, count=1, flags=re.S)
        if not k: art, k = re.subn(r'(<section class="hero[^>]*>.*?)<p class="eyebrow">.*?</p>', lambda mm: mm.group(1) + CRUMBS[i], art, count=1, flags=re.S)
        assert k, f'no hero eyebrow on {i}'
    m = re.search(r'(<div class="micro gutter">\s*<div class="wrap micro-in">\s*)(<b>.*?</b>)?(.*?)(\s*</div>\s*</div>)', art, re.S)
    if m and i != 'home':
        head, links = bar(i)
        b = m.group(2) or ''
        if b:
            # the section name in the bar always links to the section overview
            top = head or [c for c in [i] + [PARENT.get(i)] if c][-1]
            sec = i
            while PARENT.get(sec): sec = PARENT[sec]
            b = re.sub(r'(</svg>).*?(</b>)', lambda mm: f'{mm.group(1)}<a href="#{sec}" data-go="{sec}">{html.escape(short(sec, 'section'), quote=False)}</a>{mm.group(2)}', b, count=1, flags=re.S)
        art = art[:m.start()] + m.group(1) + b + '\n      ' + links + m.group(4) + art[m.end():]
    if i != 'home':
        pg = pager(i)
        if pg: art = re.sub(r'(<section class="cta[^"]*" id="cta-)', lambda mm: pg + mm.group(1), art, count=1)
    open(f'{R}/content/pages/{i}.html', 'w').write(relink(art, i) + '\n')

os.makedirs(f'{R}/public/proto', exist_ok=True)
names = {i: html.unescape(re.search(r'aria-label="([^"]+)"', a).group(1)) for i, a in arts}
open(f'{R}/public/proto/worlds.js', 'w').write(f'window.T57_PAGES = {json.dumps({"petal": PETAL, "name": names, "parent": {k: v for k, v in PARENT.items() if v}, "site": {i: (i if p['route'].startswith('/who-we-serve/') else {'partners': 'partnerships', '': 'home'}.get(p['section'], p['section'])) for i, p in pages.items()}}, ensure_ascii=False)};\n' + open(f'{D}/script.js').read())

# llms.txt: a plain summary that AI assistants can read and cite (llmstxt.org format)
SITE = 'https://www.t57.ai'
L = ['# T57.ai', '', '> T57 is an AI-native digital trade platform for food. It connects verified farmers, processors, traders, buyers, financiers, service providers and regulators on one trade record, from quote to payment. T57 does not lend or hold funds; finance, escrow and insurance come from licensed partners.', '',
     'T57 works with the Islamic Organization for Food Security (IOFS), an OIC institution, under a 10-year memorandum of understanding, and has signed more than 150 memoranda and letters of intent across 67 countries. Founding markets: Saudi Arabia, UAE, India, Malaysia and Türkiye.']
for sec, head in [('who-we-serve', 'Who we serve'), ('why-t57', 'Why T57'), ('capabilities', 'Capabilities'), ('ai-native', 'AI Native'), ('platform', 'Platform'), ('trust', 'Trust and compliance'), ('markets', 'Markets'), ('pricing', 'Pricing'), ('resources', 'Resources'), ('help', 'Help Center'), ('partnerships', 'Partnerships'), ('partners', 'Partner programs'), ('about', 'About T57'), ('contact', 'Contact')]:
    L += ['', f'## {head}', '']
    for i, p in pages.items():
        if p['section'] == sec: L.append(f'- [{p["name"]}]({SITE}{p["route"]}): {p["answer"]}')
L += ['', '## Common questions', '']
for i, p in pages.items():
    for f in p['faqs'][:2]: L.append(f'- [{f["q"]}]({SITE}{p["route"]}): {f["a"]}')
open(f'{R}/public/llms.txt', 'w').write('\n'.join(L) + '\n')
print('built', len(pages), 'pages,', n[0], 'ledgers')

# Other languages: a page is built under /<lang> once every text unit on it, and its title and description,
# have a translation in prototype/<lang>/*.json (see i18n.py). Links to translated pages stay in the language.
import glob, i18n
LANGS = ['ar', 'ms', 'tr', 'hi']
# The header's language switch lists every other language, each named in its own language.
SWITCH = {'en': ('/', 'English', 'EN'), 'ar': ('/ar', 'العربية', 'عربي'), 'ms': ('/ms', 'Bahasa Malaysia', 'BM'), 'tr': ('/tr', 'Türkçe', 'TR'), 'hi': ('/hi', 'हिन्दी', 'हिं')}
def switch(lang):
    return '<div class="langs">' + ''.join(f'<a class="lang-sw" href="{h}" hreflang="{l}" lang="{l}"><span class="ls-l">{a}</span><span class="ls-s" aria-hidden="true">{b}</span></a>'
                                           for l, (h, a, b) in SWITCH.items() if l != lang) + '</div>'
LANGSW = re.compile(r'<div class="langs">.*?</div>')
for lang in LANGS:
    tr = {}
    for f in sorted(glob.glob(f'{D}/{lang}/*.json')): tr.update(json.load(open(f)))
    if not tr: continue
    if lang == 'ar':
        # a right-to-left mark after closing punctuation keeps it at the end of the line inside left-to-right SVG text
        tr = {k: re.sub(r'([.:!؟،])$', '\\1\u200f', v) for k, v in tr.items()}
    done, out = {}, {}
    for i, p in pages.items():
        src = open(f'{R}/content/pages/{i}.html').read()
        miss = set(); art = i18n.apply(src, tr, miss)
        if miss or p['title'] not in tr or p['description'] not in tr: continue
        done[i] = art
    pre = lambda r: f'/{lang}' + ('' if r == '/' else r)
    LR = {pages[i]['route'] for i in done}
    def relang(s):
        return re.sub(r'href="(/[^"#?]*)(#[^"]*)?"', lambda m: f'href="{pre(m.group(1))}{m.group(2) or ""}"' if m.group(1) in LR else m.group(0), s)
    os.makedirs(f'{R}/content/{lang}/pages', exist_ok=True)
    for f in glob.glob(f'{R}/content/{lang}/pages/*.html'): os.remove(f)
    lp = {}
    for i, art in done.items():
        if lang == 'ar':  # redone films have their own Arabic cut and captions
            art = re.sub(r'/video/([a-z0-9-]+)\.en\.', r'/video/\1.ar.', art).replace('srclang="en" label="English"', 'srclang="ar" label="العربية"')
        open(f'{R}/content/{lang}/pages/{i}.html', 'w').write(relang(art))
        h1 = text(re.search(r'<h1[^>]*>(.*?)</h1>', art, re.S).group(1))
        std = text(re.search(r'<p class="std">(.*?)</p>', art, re.S).group(1))
        faqs = [{'q': text(q), 'a': text(x)} for q, x in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', art, re.S)]
        name = html.unescape(re.search(r'aria-label="([^"]+)"', art).group(1))
        lp[i] = dict(pages[i], route=pre(pages[i]['route']), name=tr.get('Home', 'Home') if i == 'home' else name, h1=h1, answer=std, faqs=faqs,
                     title=tr[pages[i]['title']], description=tr[pages[i]['description']])
    json.dump(lp, open(f'{R}/content/{lang}/pages.json', 'w'), indent=1, ensure_ascii=False)
    # the site search index for this language: translated pages only, in the same shape as search.json
    sec_l = lambda i: re.sub(r' Overview$', '', lp[sec_of(i)]['name']) if sec_of(i) != i and sec_of(i) in lp else ''
    json.dump([[i, q['route'], q['name'], sec_l(i), q['h1'], q['answer'], heads(done[i]), ' · '.join(f['q'] for f in q['faqs'])] for i, q in lp.items()],
              open(f'{R}/public/proto/search-{lang}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    for part in ('top', 'bottom'):
        src, k = LANGSW.subn('<div class="langs"></div>', open(f'{R}/content/chrome-{part}.html').read())
        assert part == 'bottom' or k == 1
        miss = set(); c = i18n.apply(src, tr, miss)
        assert not miss, f'{lang} chrome-{part} untranslated: {sorted(miss)[:8]}'
        # the switch goes in after relang, so its links keep pointing at the other languages
        open(f'{R}/content/{lang}/chrome-{part}.html', 'w').write(relang(c).replace('<div class="langs"></div>', switch(lang)))
    print(lang, len(done), 'pages translated')
