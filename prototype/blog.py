# T57 Insights article pages, one per post in blog-posts.json (imported from trade57.ai by blog-import.py).
# build.py appends these articles to the worlds and their titles and descriptions to the page metadata.
# Each post sits under Blog & Insights (/resources/blog/<slug>) but stays out of the menu and the Resources bar,
# which list sections, not individual articles.
import json, os, html
D = os.path.dirname(os.path.abspath(__file__))
POSTS = json.load(open(f'{D}/blog-posts.json'))
AUTHORS = {
    'afzal': ('Afzal Hussain Mohammed Nakheeb', 'Founder, Chairman & Head of Strategy', 'AN'),
    'bari': ('Abdul Bari Kareem', 'Co-founder & CTO', 'AB'),
    'habeeba': ('Umme Habeeba Khanum', 'Chief Marketing Officer', 'UH'),
    'umair': ('Mohammed Umair', 'Chief Sales Officer', 'MU'),
    'moaz': ('Dr. Moaz Abdullah Mohammed Mojaddidi', 'Geo Head, Saudi Arabia', 'MM'),
}
# topic: label, hero scene, petal for the page transition
TOPICS = {
    'tech': ('AI and technology', 'chain', 'tech'),
    'markets': ('Markets and corridors', 'globe', 'trade'),
    'security': ('Food security', 'globe', 'logistics'),
    'finance': ('Trade finance', 'value', 'finance'),
    'farmers': ('Farmers and value chains', 'seed', 'agri'),
    'news': ('Inside T57', 'market', 'tech'),
}
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
MARK = '<svg viewBox="774 418 250 244" aria-hidden="true"><use href="#mk-ring"></use><use href="#mk-trade"></use><use href="#mk-tech"></use><use href="#mk-logistics"></use><use href="#mk-finance"></use><use href="#mk-agri"></use></svg>'
e = lambda s: html.escape(s, quote=False)
a = lambda s: html.escape(s, quote=True)
ids = [f'blog-{p["slug"]}' for p in POSTS]

def day(d):
    y, m, dd = d.split('-')
    return f'{int(dd)} {MONTHS[int(m) - 1]} {y}'

def byline(k, tag='span'):
    name, role, ini = AUTHORS[k]
    return f'<{tag} class="bl-by"><span class="bl-av bl-{k}" aria-hidden="true">{ini}</span><span><b>{e(name)}</b><small>{e(role)}</small></span></{tag}>'

def card(p, k):
    return (f'<li class="bl-c" style="--k:{k}"><a href="#blog-{p["slug"]}" data-go="blog-{p["slug"]}"><span class="bl-k">{TOPICS[p["topic"]][0]}</span>'
            f'<b>{e(p["card"])}</b><span class="bl-x">{e(p["summary"])}</span><span class="bl-foot">{byline(p["author"])}<time datetime="{p["date"]}">{day(p["date"])}</time></span></a></li>')

def related(p):
    same = [q for q in POSTS if q is not p and q['topic'] == p['topic']]
    rest = [q for q in POSTS if q is not p and q not in same]
    return (same + rest)[:3]

def article(n, p):
    i, slug = f'blog-{p["slug"]}', p['slug']
    topic, scene, petal = TOPICS[p['topic']]
    name, role, _ = AUTHORS[p['author']]
    k = POSTS.index(p)
    newer, older = (POSTS[k - 1] if k else None), (POSTS[k + 1] if k + 1 < len(POSTS) else None)
    step = lambda q, cls, word: (f'<a class="pg-{cls}" href="#blog-{q["slug"]}" data-go="blog-{q["slug"]}"><small>{word} article</small><b>{e(q["card"])}</b></a>' if q else '<span></span>')
    return f'''
<article class="world" id="{i}" data-world="res-blog" data-route="/resources/blog/{slug}" data-petal="{petal}" data-parent="res-blog" data-kind="post" aria-label="{a(p["card"])}" hidden>
  <div class="micro gutter">
    <div class="wrap micro-in">
      <b>{MARK}<a href="#resources" data-go="resources">Resources</a></b>
    </div>
  </div>
  <section class="hero night gutter post-hero" aria-labelledby="bp{n}-h1">
    <canvas data-scene="{scene}" aria-hidden="true"></canvas>
    <div class="hero-in">
      <div class="hero-copy">
        <p class="eyebrow">Resources · Insights</p>
        <p class="post-k"><span>T57 Insights</span>{topic}</p>
        <h1 id="bp{n}-h1">{e(p["title"])}</h1>
        <p class="std">{e(p["summary"])}</p>
        <div class="post-meta">{byline(p["author"])}<p class="post-facts"><time datetime="{p["date"]}">{day(p["date"])}</time><span>{p["minutes"]} min read</span></p></div>
      </div>
    </div>
  </section>
  <figure class="post-cover gutter"><img src="/blog/{slug}.webp" width="{p["image"]["w"]}" height="{p["image"]["h"]}" alt="Cover image for “{a(p["card"])}”" decoding="async" fetchpriority="high"></figure>
  <section class="chapter gutter post" aria-label="Article">
    <div class="wrap post-in">
      <div class="post-body">
{p["body"]}
      </div>
      <aside class="post-side" aria-label="About this article">
        <p class="eyebrow">Written by</p>
        {byline(p["author"], "div")}
        <dl class="post-dl"><div><dt>Published</dt><dd><time datetime="{p["date"]}">{day(p["date"])}</time></dd></div><div><dt>Topic</dt><dd>{topic}</dd></div><div><dt>Reading time</dt><dd>{p["minutes"]} minutes</dd></div></dl>
        <a class="post-all" href="#res-blog" data-go="res-blog">All 25 articles in T57 Insights</a>
      </aside>
    </div>
  </section>
  <nav class="pager gutter post-pager" aria-label="More articles"><div class="wrap pager-in">{step(newer, "prev", "Newer")}<a class="pg-up" href="#res-blog" data-go="res-blog"><small>Back to</small><b>Blog &amp; Insights</b></a>{step(older, "next", "Older")}<p class="pg-n">Article {k + 1} of {len(POSTS)}</p></div></nav>
  <section class="chapter alt gutter" aria-labelledby="bp{n}-more">
    <div class="wrap">
      <p class="eyebrow">Keep reading</p>
      <h2 class="h2" id="bp{n}-more">More from T57 Insights</h2>
      <ol class="bl-grid">{"".join(card(q, j) for j, q in enumerate(related(p)))}</ol>
    </div>
  </section>
  <section class="cta night gutter" id="cta-{i}" aria-labelledby="bp{n}-cta">
    <div class="cta-in">
      <div><h2 id="bp{n}-cta">Practical insight on food trade, markets and technology.</h2><div class="actions"><a class="btn btn-world" href="#cta-home">Subscribe to T57 Insights</a><a class="btn btn-ghost" href="#res-blog" data-go="res-blog">Browse all articles</a></div></div>
      {MARK.replace('<svg ', '<svg class="petal-big" ', 1)}
    </div>
  </section>
</article>
'''

def articles():
    return ''.join(article(n, p) for n, p in enumerate(POSTS, 1))

# Search titles (60 characters or fewer) and descriptions (160 or fewer) where the headline or summary runs longer.
SEO = {'systems-marketing-ai-global-food-trade': ('Marketing Trade Infrastructure, Not a Product | T57', None),
    't57-gulfood-2026-mous-learning-sales-engine': ('How Gulfood MoUs Became a Learning Machine | T57', 'How T57 uses the MoUs and LoIs signed at Gulfood 2026 as live market signals to find high-intent buyers and sharpen its sales strategy.'),
    'future-of-ai-food-trade-t57': ('Why 150 Gulfood MoUs Change T57’s Growth Math | T57', None),
    'marketing-11-crore-farmers-digital-agriculture-mission-t57': ('Selling AI to India’s Farms | T57 Insights', 'How T57 fits India’s Digital Agriculture Mission, with AgriStack, AI and digital farmer IDs, to reach 11 crore farmers at scale.'),
    'food-trade-deals-before-handshake-virtual-trade-infrastructure': ('Food Trade Deals Before the Handshake | T57 Insights', None),
    'model-support-centers-missing-middle-food-systems': ('The Missing Middle of Food Systems | T57 Insights', None),
    'gcc-food-security-strategy-hormuz-crisis': ('Turning a Gulf Food Crisis into Advantage | T57', 'How the GCC can turn a food supply crisis into long-term advantage: a roadmap for supply chains, reserves, production and digital infrastructure.'),
    'hormuz-shock-gcc-food-security-risk': ('Hormuz Shock and Gulf Food Security | T57 Insights', 'With most Gulf food imports passing through Hormuz, the crisis is a stress test. What it reveals about supply chain weak points and resilience.'),
    'saudi-date-industry-challenges-t57-supply-chain': ('Saudi Date Farming and a Better Supply Chain | T57', 'Saudi Arabia leads global date exports, yet farmers face waste, price swings and limited market access. How T57 changes the date supply chain.'),
    't57-club-membership-agriculture-trust-model': ('Why a Club Membership Model Builds Trust | T57', 'How T57’s verified club membership builds trust, reduces disputes and changes agricultural trading with verified members, AI and tamper-evident records.'),
    'india-avocado-market-growth-farmer-challenge': ('India’s Emerging Avocado Industry | T57 Insights', None),
    'structural-shifts-reshaping-turkish-agriculture-2026': ('Shifts Redefining Turkish Agriculture in 2026 | T57', None),
    'blockchain-food-supply-chain': ('Can Blockchain Cut the $1T Cost of Food Waste? | T57', None),
    'five-forces-reshaping-malaysian-agriculture-2026': ('Five Forces Reshaping Malaysian Agriculture | T57', 'Five shifts changing Malaysian agriculture in 2026, toward higher-value, resilient and traceable supply chains that support food security and rural incomes.'),
    'five-forces-reshaping-middle-east-agriculture-2026': ('Five Forces Reshaping Middle East Agriculture | T57', None),
    'agriculture-ai-stack': ('The Quiet Upload of Agriculture into AI | T57', 'Agriculture is becoming an AI-native, automation-first industry, where software, sensing and robotics matter as much as soil and seeds.'),
    'india-us-trade-deal-2026-agriculture-impact': ('India-US Trade Deal and Agriculture | T57 Insights', None),
    'smart-contracts-in-global-agri-trade': ('How Smart Contracts Repair Trust in Agri Trade | T57', 'Smart contracts build trust through code that runs once agreed conditions are met, automating delivery confirmation, quality checks and payment release.'),
    'gulfood-2026-farm-to-fork': ('Farm to Fork at Gulfood: AI, Blockchain, Talent | T57', None),
    'gulfood-2026-ai-powered-food-decisions': ('From Data to Dinner: AI Food Decisions | T57', 'Insights from the Gulfood 2026 panel on breakthrough technologies and AI-powered automation as value creators for an intelligent food system.'),
    'india-farm-sector-2026-strategic-outlook': ('5 Strategic Shifts for India’s Farms in 2026 | T57', None),
    'digital-agri-finance-alliance-global-food-system-transformation': ('How a Digital Agri-Finance Alliance Helps | T57', None),
    'escrow-crypto-ai-agents-agriculture': ('Escrow, Crypto and AI Agents in Agriculture | T57', None),
    'rewriting-trade-finance-for-global-agriculture': ('Rewriting Trade Finance for Agriculture | T57', None),
    'how-data-can-save-farmers-lives': ('How Data Can Break the Middlemen Cartel | T57', None)}

def meta():
    # page title and description, plus the article facts lib/site.ts turns into BlogPosting structured data
    return {f'blog-{p["slug"]}': dict(title=SEO.get(p['slug'], (f'{p["card"]} | T57 Insights',))[0], description=(SEO.get(p['slug'], (None, None))[1] or p['description']),
            post=dict(author=AUTHORS[p['author']][0], role=AUTHORS[p['author']][1], date=p['date'], topic=TOPICS[p['topic']][0],
                      image=f'/blog/{p["slug"]}.jpg', minutes=p['minutes'])) for p in POSTS}
