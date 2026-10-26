# Builds the prototype into the Next.js app as real pages, one per sitemap route:
#   app/globals.css                 shared styles
#   content/chrome-top.html         icon defs, header and menu (shared by every page)
#   content/chrome-bottom.html      footer and the page-transition veil
#   content/pages/<id>.html         one microsite page per sitemap route
#   content/pages.json              route, title, description, H1 and FAQs per page (metadata and JSON-LD)
#   public/proto/worlds.js          scenes, explainers and transitions
#   public/llms.txt                 plain-language site summary for AI answer engines
# Run: python3 prototype/build.py
import json, re, os, html
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
parts = json.load(open(f'{D}/parts.json')); led = open(f'{D}/ledger.tpl').read()
META = json.load(open(f'{D}/meta.json'))
orig = ["Buyer match","AI MATCHED","Offer","PRICE INTELLIGENCE","Contract","SMART CONTRACT","Logistics","TRACKED SHIPMENT","Payment","ESCROW RELEASE"]
n = [0]
def ledger(m):
    labels, aria = m.group(1).split('|'), m.group(2)
    n[0] += 1; s = led
    for a, b in zip(orig, labels): s = s.replace(f'>{a}<', f'>{b}<', 1)
    s = s.replace('id="hexes"', f'id="hexes{n[0]}"').replace('url(#hexes)', f'url(#hexes{n[0]})')
    if aria: s = re.sub(r'aria-label="[^"]*"', f'aria-label="{aria}"', s, count=1)
    return '<figure class="ledger">\n' + s + '</figure>'
worlds = re.sub(r'\{\{LEDGER:([^}#]*)(?:#([^}]*))?\}\}', ledger, open(f'{D}/worlds.html').read())

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
for k, v in {'DEFS': parts['defs'], 'LOGO': parts['logo'], 'MARK': parts['mark']}.items():
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

text = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
pages = {}
for m in re.finditer(r'(<article class="world" id="([a-z0-9-]+)".*?</article>)', worlds, re.S):
    art, i = m.group(1), m.group(2)
    art = art.replace(' hidden>', '>', 1)
    open(f'{R}/content/pages/{i}.html', 'w').write(relink(art, i) + '\n')
    h1 = text(re.search(r'<h1[^>]*>(.*?)</h1>', art, re.S).group(1))
    std = text(re.search(r'<p class="std">(.*?)</p>', art, re.S).group(1))
    faqs = [{'q': text(q), 'a': text(x)} for q, x in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', art, re.S)]
    name = re.search(r'aria-label="([^"]+)"', art).group(1)
    pages[i] = dict(route=ROUTE[i], section=ROUTE[i].strip('/').split('/')[0], name='Home' if i == 'home' else name, h1=h1, answer=std, faqs=faqs, **META[i])
    pm = re.search(r'data-parent="([^"]+)"', art[:400])
    if pm: pages[i]['parent'] = pm.group(1)
json.dump(pages, open(f'{R}/content/pages.json', 'w'), indent=1, ensure_ascii=False)

os.makedirs(f'{R}/public/proto', exist_ok=True)
names = {i: html.unescape(re.search(r'aria-label="([^"]+)"', a).group(1)) for i, a in arts}
open(f'{R}/public/proto/worlds.js', 'w').write(f'window.T57_PAGES = {json.dumps({"petal": PETAL, "name": names}, ensure_ascii=False)};\n' + open(f'{D}/script.js').read())

# llms.txt: a plain summary that AI assistants can read and cite (llmstxt.org format)
SITE = 'https://t57.ai'
L = ['# T57.ai', '', '> T57 is an AI-native digital trade platform for food. It connects verified farmers, processors, traders, buyers, financiers, service providers and regulators on one trade record, from quote to payment. T57 does not lend or hold funds; finance, escrow and insurance come from licensed partners.', '',
     'T57 works with the Islamic Organization for Food Security (IOFS), an OIC institution, under a 10-year memorandum of understanding, and has signed more than 150 memoranda and letters of intent across 67 countries. Founding markets: Saudi Arabia, UAE, India, Malaysia and Türkiye.']
for sec, head in [('who-we-serve', 'Who we serve'), ('why-t57', 'Why T57'), ('capabilities', 'Capabilities'), ('ai-native', 'AI Native'), ('platform', 'Platform'), ('trust', 'Trust and compliance')]:
    L += ['', f'## {head}', '']
    for i, p in pages.items():
        if p['section'] == sec: L.append(f'- [{p["name"]}]({SITE}{p["route"]}): {p["answer"]}')
L += ['', '## Common questions', '']
for i, p in pages.items():
    for f in p['faqs'][:2]: L.append(f'- [{f["q"]}]({SITE}{p["route"]}): {f["a"]}')
open(f'{R}/public/llms.txt', 'w').write('\n'.join(L) + '\n')
print('built', len(pages), 'pages,', n[0], 'ledgers')
