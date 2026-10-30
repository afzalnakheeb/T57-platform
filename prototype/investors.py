# Investor Relations (/about/investors): why T57, the traction so far and how qualified investors request the
# investor pack. Projected returns, valuation and the financial plan stay in the pack (teaser, presentation,
# memorandum), which is shared only with qualified investors, in line with Saudi Capital Market Authority rules.
# build.py appends this article to the worlds and its title and description to the page metadata.
MARK = '<svg viewBox="774 418 250 244" aria-hidden="true"><use href="#mk-ring"></use><use href="#mk-trade"></use><use href="#mk-tech"></use><use href="#mk-logistics"></use><use href="#mk-finance"></use><use href="#mk-agri"></use></svg>'
DISCLAIMER = ('This page is for information only. It is not an offer of securities to the public or a solicitation to invest. Any offer is made only through '
              'definitive documents to qualified investors, in accordance with the Capital Market Law and the rules of the Capital Market Authority of '
              'Saudi Arabia and the laws of the investor\'s own country. Statements about the future are management plans, not guarantees.')

def articles():
    return f'''
<article class="world" id="about-investors" data-world="about-investors" data-route="/about/investors" data-petal="finance" data-parent="about" aria-label="Investor Relations" hidden>
  <div class="micro gutter">
    <div class="wrap micro-in">
      <b>{MARK}<a href="#about" data-go="about">About T57</a></b>
    </div>
  </div>
  <section class="hero night gutter" aria-labelledby="inv-h1">
    <canvas data-scene="value" aria-hidden="true"></canvas>
    <div class="hero-in has-glance">
      <div class="hero-copy">
        <p class="eyebrow">About T57 · Investors</p>
        <h1 id="inv-h1"><span class="ln">Invest in the rails</span> <span class="ln">food trade runs on.</span></h1>
        <p class="std">T57 is raising its launch round to open five founding markets from Riyadh. Qualified investors can request the investor pack today.</p>
        <div class="actions"><a class="btn btn-world" href="#cta-about-investors" data-form="invest">Request the investor pack</a><a class="btn btn-ghost" href="#inv-why">Why T57, why now</a></div>
      </div>
      <div class="glance hcard" role="group" aria-label="T57 at a glance for investors"><p class="gl-h">T57 at a glance</p><dl class="hc-rows">
        <div><dt>Built in</dt><dd>Saudi Arabia: started in Madinah, headquartered in Riyadh</dd></div>
        <div><dt>Traction</dt><dd>34 pilot shipments on the live beta, about $1M of trade</dd></div>
        <div><dt>Pipeline</dt><dd>150+ MoUs and letters of intent from 67 countries</dd></div>
        <div><dt>Model</dt><dd>Subscriptions plus a small fee on completed trades</dd></div>
      </dl><p class="gl-src">Pipeline agreements are non-binding. Figures as of October 2026.</p></div>
    </div>
  </section>
  <section class="chapter gutter" id="inv-why" aria-labelledby="inv-why-h">
    <div class="wrap">
      <p class="eyebrow">Why now</p>
      <h2 class="h2" id="inv-why-h">Two national priorities meet in one platform</h2>
      <p class="lede">Saudi Arabia declared 2026 its Year of Artificial Intelligence, and food security is a Vision 2030 priority. T57 is AI-native infrastructure for food trade, built in the Kingdom and designed to serve the world from here.</p>
      <div class="feats" style="margin-top:32px">
        <div class="feat"><b>$2.22 trillion</b><span>Global food import bill forecast for 2025 (FAO). Most of it still runs on paper, phone calls and separate providers.</span></div>
        <div class="feat"><b>$2.5 trillion</b><span>Global trade finance gap in 2025; 41% of SME applications are rejected (Asian Development Bank, 2026).</span></div>
        <div class="feat"><b>One record</b><span>Verification, contract, finance, logistics and payment on one trade record, with licensed partners providing regulated services.</span></div>
      </div>
    </div>
  </section>
  <section class="chapter alt gutter" aria-labelledby="inv-proof-h">
    <div class="wrap">
      <p class="eyebrow">What is already in place</p>
      <h2 class="h2" id="inv-proof-h">Traction, partners and a team that has done this before</h2>
      <dl class="facts"><div><dt>Live beta</dt><dd>Requests for quote, quotations and invoices are live; 34 pilot shipments worth about $1M have run on the platform.</dd></div>
      <div><dt>Institutional anchor</dt><dd>A 10-year MoU with the Islamic Organization for Food Security (IOFS), an OIC institution, since June 2023.</dd></div>
      <div><dt>Commercial pipeline</dt><dd>More than 150 MoUs and letters of intent from companies in 67 countries, including 120 signed at Gulfood 2026 (non-binding).</dd></div>
      <div><dt>Team</dt><dd>44 people, including a 26-member technology team, led by five founders with experience in food trade, technology, product and governance. <a href="#about-leadership" data-go="about-leadership">Meet the leadership</a></dd></div>
      <div><dt>Asset-light model</dt><dd>T57 does not lend, hold client funds or own goods. Revenue comes from published membership plans and a small fee per side on completed trades. <a href="#pricing" data-go="pricing">See pricing</a></dd></div>
      <div><dt>Roadmap</dt><dd>Five founding markets first, then phased expansion toward 101 markets. <a href="#markets-global" data-go="markets-global">See the global rollout</a></dd></div></dl>
    </div>
  </section>
  <section class="chapter gutter" aria-labelledby="inv-pack-h">
    <div class="wrap">
      <p class="eyebrow">The investor pack</p>
      <h2 class="h2" id="inv-pack-h">What you receive, and how the process works</h2>
      <ol class="steps"><span class="rail" aria-hidden="true"><i></i></span>
        <li><span class="dot">01</span><h3>Request the pack</h3><p>Tell us who you are and the type of investor you represent.</p></li>
        <li><span class="dot">02</span><h3>Teaser and presentation</h3><p>The opportunity, the plan and the base-case financials, with their assumptions.</p></li>
        <li><span class="dot">03</span><h3>Call with the founder</h3><p>A conversation with Afzal Hussain Mohammed Nakheeb, Founder and Chairman, and the leadership team.</p></li>
        <li><span class="dot">04</span><h3>Memorandum and data room</h3><p>The investor memorandum, detailed project report and diligence documents, under NDA.</p></li>
      </ol>
      <div class="actions" style="margin-top:28px"><a class="btn btn-world" href="#cta-about-investors" data-form="invest">Request the investor pack</a></div>
      <p class="soon-note" style="margin-top:28px">{DISCLAIMER}</p>
    </div>
  </section>
  <section class="cta night gutter" id="cta-about-investors" aria-labelledby="inv-cta">
    <div class="cta-in">
      <div><h2 id="inv-cta">Back the trusted infrastructure for food trade.</h2><div class="actions"><a class="btn btn-world" href="#cta-about-investors" data-form="invest">Request the investor pack</a><a class="btn btn-ghost" href="mailto:hello@t57.ai?subject=Investor%20enquiry">hello@t57.ai</a></div></div>
      {MARK.replace('<svg ', '<svg class="petal-big" ', 1)}
    </div>
  </section>
</article>
'''

def meta():
    return {'about-investors': dict(title='Investor Relations | Invest in T57',
                                    description='T57 is raising its launch round from Riyadh. See the traction, partners and team, and request the investor pack as a qualified investor.')}
