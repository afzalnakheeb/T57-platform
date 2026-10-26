# Builds the prototype worlds into the Next.js app:
#   content/worlds-body.html (server-rendered markup), app/globals.css, public/proto/worlds.js
# Run: python3 prototype/build.py
import json, re, os
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
parts = json.load(open(f'{D}/parts.json')); led = open(f'{D}/ledger.tpl').read()
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
t = open(f'{D}/template.html').read()
for k, v in {'DEFS': parts['defs'], 'LOGO': parts['logo'], 'MARK': parts['mark'], 'WORLDS': worlds}.items():
    t = t.replace('{{' + k + '}}', v)
assert '{{' not in t, re.findall(r'\{\{[^}]*\}\}', t)[:3]
a = t.index('<style>') + 7; b = t.index('</style>')
open(f'{R}/app/globals.css', 'w').write(t[a:b].strip() + '\n')
open(f'{R}/content/worlds-body.html', 'w').write(t[b + 8:].strip() + '\n')
os.makedirs(f'{R}/public/proto', exist_ok=True)
open(f'{R}/public/proto/worlds.js', 'w').write(open(f'{D}/script.js').read())
print('built', n[0], 'ledgers')
