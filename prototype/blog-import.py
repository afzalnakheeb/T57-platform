# One-off import of the T57 Insights articles from the old site (trade57.ai, built on Tilda) into
# prototype/blog-posts.json, with each cover image saved to public/blog/<slug>.webp (page) and .jpg (social cards).
# The article text is kept word for word; only the markup is cleaned (Tilda line breaks become paragraphs,
# bold one-line headings become h2, Quill tables become plain tables, links to trade57.ai point to the new pages).
# Run: python3 prototype/blog-import.py <folder of saved trade57.ai pages> <folder of downloaded cover images>
import json, re, os, sys, html, math
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
raw, imgs = sys.argv[1], sys.argv[2]

# The 25 articles in the order of the Insights index (newest first), with author and topic keys used by its filters.
POSTS = [
    ('systems-marketing-ai-global-food-trade', 'habeeba', 'tech'),
    ('t57-gulfood-2026-mous-learning-sales-engine', 'umair', 'news'),
    ('future-of-ai-food-trade-t57', 'umair', 'news'),
    ('marketing-11-crore-farmers-digital-agriculture-mission-t57', 'habeeba', 'markets'),
    ('food-trade-deals-before-handshake-virtual-trade-infrastructure', 'afzal', 'tech'),
    ('model-support-centers-missing-middle-food-systems', 'afzal', 'farmers'),
    ('gcc-food-security-strategy-hormuz-crisis', 'afzal', 'security'),
    ('hormuz-shock-gcc-food-security-risk', 'afzal', 'security'),
    ('saudi-date-industry-challenges-t57-supply-chain', 'moaz', 'farmers'),
    ('t57-club-membership-agriculture-trust-model', 'afzal', 'farmers'),
    ('india-avocado-market-growth-farmer-challenge', 'bari', 'markets'),
    ('structural-shifts-reshaping-turkish-agriculture-2026', 'afzal', 'markets'),
    ('blockchain-food-supply-chain', 'bari', 'tech'),
    ('five-forces-reshaping-malaysian-agriculture-2026', 'afzal', 'markets'),
    ('five-forces-reshaping-middle-east-agriculture-2026', 'afzal', 'markets'),
    ('agriculture-ai-stack', 'bari', 'tech'),
    ('india-us-trade-deal-2026-agriculture-impact', 'afzal', 'markets'),
    ('smart-contracts-in-global-agri-trade', 'afzal', 'finance'),
    ('gulfood-2026-farm-to-fork', 'bari', 'tech'),
    ('gulfood-2026-ai-powered-food-decisions', 'afzal', 'tech'),
    ('india-farm-sector-2026-strategic-outlook', 'afzal', 'markets'),
    ('digital-agri-finance-alliance-global-food-system-transformation', 'afzal', 'finance'),
    ('escrow-crypto-ai-agents-agriculture', 'afzal', 'finance'),
    ('rewriting-trade-finance-for-global-agriculture', 'afzal', 'finance'),
    ('how-data-can-save-farmers-lives', 'afzal', 'farmers'),
]
SLUGS = {s for s, _, _ in POSTS}
# Titles as the Insights index shows them (the old pages have missing spaces and straight quotes in a few titles);
# where the old page carries a longer or footnoted title, that full title is used instead.
FULL_TITLE = {
    'saudi-date-industry-challenges-t57-supply-chain': 'Date Farming in Saudi Arabia: How One Platform Can Rewrite a Centuries-Old Struggle (and Reshape Farming Across the World)',
    'blockchain-food-supply-chain': 'Can Blockchain Finally Close the $1 Trillion Annual Global Cost of Food Waste?*',
}
# Wording changes agreed with T57 (positioning: T57 is a Saudi initiative, so no reference to T57 operations in Dubai).
EDITS = {
    'escrow-crypto-ai-agents-agriculture': [('between my Dubai and Saudi operations', 'between two of my Gulf operations')],
}
MONTHS = {m: k + 1 for k, m in enumerate(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])}
index = {re.sub(r'^.*/', '', c['url']): c for c in json.load(open('/mnt/project-files/t57-website/blog-index-trade57.json'))}

def iso(d):
    m = re.match(r'([A-Za-z]+)\s*(\d+),\s*(\d{4})', d.strip())
    return f'{m.group(3)}-{MONTHS[m.group(1)[:3].lower()]:02d}-{int(m.group(2)):02d}'

def link(m):
    attrs, inner = m.group(1), m.group(2)
    href = html.unescape(re.search(r'href="([^"]*)"', attrs).group(1)).strip()
    k = re.sub(r'^(https?://(www\.)?trade57\.ai)?/', '', href).strip('/') if re.match(r'(https?://(www\.)?trade57\.ai)?/', href) else None
    if k is not None:
        if k in SLUGS: return f'<a href="#blog-{k}" data-go="blog-{k}">{inner}</a>'
        return inner                          # the old home page: the brand name needs no link on its own site
    return f'<a href="{html.escape(href)}" target="_blank" rel="noopener">{inner}</a>'

def table(m):
    rows = []
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', m.group(0), re.S):
        rows.append(['<br>'.join(x.strip() for x in re.findall(r'<p[^>]*>(.*?)</p>', td, re.S)) for td in re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)])
    bold = lambda c: re.fullmatch(r'\s*<strong>(.*?)</strong>\s*', c, re.S)
    head = rows[0] if all(bold(c) for c in rows[0] if c) else None
    out = '<div class="post-table" role="region" tabindex="0" aria-label="Table, scroll sideways to see every column"><table>'
    if head:
        out += '<thead><tr>' + ''.join(f'<th scope="col">{bold(c).group(1) if c else ""}</th>' for c in head) + '</tr></thead>'
        rows = rows[1:]
    out += '<tbody>' + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table></div>'
    return '\n' + out + '\n'

def clean(b):
    b = re.sub(r'<div class="quill-table__wrapper">.*?</table>\s*</div>', table, b, flags=re.S)
    b = re.sub(r'<a([^>]*)>(.*?)</a>', link, b, flags=re.S)
    b = b.replace('<li data-list="bullet">', '<li>').replace('&nbsp;', ' ')
    blocks = []
    for seg in re.split(r'(<ul>.*?</ul>|\n<div class="post-table".*?</table></div>\n)', b, flags=re.S):
        if seg.startswith('<ul>') or seg.startswith('\n<div'):
            blocks.append(seg.strip()); continue
        for line in re.split(r'<br\s*/?>', seg):
            line = re.sub(r'\s+', ' ', line).strip()
            if not re.sub(r'<[^>]+>', '', line).strip(): continue
            h = re.fullmatch(r'<strong>([^<]*(?:<(?!/?strong)[^<]*)*)</strong>', line)
            if h and len(re.sub(r'<[^>]+>', '', h.group(1))) <= 140: blocks.append(f'<h2>{h.group(1).strip()}</h2>')
            elif re.fullmatch(r'_{3,}', line): blocks.append('<hr>')
            elif line.startswith('<em>*'): blocks.append(f'<p class="post-fn">{line}</p>')
            else: blocks.append(f'<p>{line}</p>')
    return '\n'.join(blocks)

out = []
os.makedirs(f'{R}/public/blog', exist_ok=True)
for slug, author, topic in POSTS:
    s = open(f'{raw}/{slug}.html').read()
    t017 = [m.start() for m in re.finditer(r'<!-- T017 -->', s)]
    head = s[t017[0]:t017[1]]
    field = lambda f: re.search(rf'field="{f}">(.*?)</div>', head, re.S).group(1).strip()
    start = s.index('field="descr">', t017[1]) + len('field="descr">')
    body = s[start:s.index('<!-- T396 -->', start)]
    for _ in range(4): body = body[:body.rindex('</div>')]   # close of descr, col, container, record
    body = body.strip()
    for a, b in EDITS.get(slug, []):
        assert a in body, (slug, a); body = body.replace(a, b)
    body = clean(body)
    c = index[slug]
    img = re.search(r'data-original="([^"]+)"', head).group(1)
    src = [f for f in os.listdir(imgs) if f.rsplit('.', 1)[0] == slug][0]
    im = Image.open(f'{imgs}/{src}').convert('RGB')
    if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(f'{R}/public/blog/{slug}.webp', 'WEBP', quality=82, method=6)
    og = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS) if im.width > 1200 else im
    og.save(f'{R}/public/blog/{slug}.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
    desc = re.search(r'property="og:description" content="([^"]*)"', s)
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    out.append(dict(slug=slug, title=FULL_TITLE.get(slug, c['title']), card=c['title'], date=iso(field('subtitle')),
                    author=author, topic=topic, summary=c['summary'], description=html.unescape(desc.group(1)) if desc else c['summary'],
                    image=dict(w=im.width, h=im.height, source=img), minutes=max(1, math.ceil(words / 230)), body=body))
json.dump(out, open(f'{D}/blog-posts.json', 'w'), indent=1, ensure_ascii=False)
print('imported', len(out), 'articles')
