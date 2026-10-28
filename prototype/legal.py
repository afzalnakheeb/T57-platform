# Legal & Policies: an overview and four policy pages (privacy, terms, cookies, accessibility) at /legal/<slug>.
# build.py appends these articles to the worlds and their titles and descriptions to the page metadata; the
# footer links to each page. The text describes the website as built: the forms (app/api/forms), browser storage
# in prototype/script.js and the absence of analytics or advertising cookies.
import html
UPDATED = ('2026-10-28', '28 October 2026')
MARK = '<svg viewBox="774 418 250 244" aria-hidden="true"><use href="#mk-ring"></use><use href="#mk-trade"></use><use href="#mk-tech"></use><use href="#mk-logistics"></use><use href="#mk-finance"></use><use href="#mk-agri"></use></svg>'
e = lambda s: html.escape(s, quote=False)
CONTACT = ('T57, 6709 King Fahad Street, Riyadh, Saudi Arabia · <a href="mailto:hello@t57.ai">hello@t57.ai</a> · '
           '<a href="tel:+966569712222">+966 56 971 22 22</a>')

PRIVACY = f'''<p>This notice explains what personal data T57 collects through t57.ai, why we use it, who we share it with and the rights you have. It applies to visitors to this website and to people who contact us, request a demo, apply to join or apply to become a partner.</p>
<h2>Who we are</h2>
<p>T57 operates t57.ai and is the controller of the personal data described here. You can reach us at {CONTACT}.</p>
<h2>What we collect</h2>
<ul><li><strong>What you send us through a form:</strong> your name, work email, company, country, role, phone number, the products or plan you are interested in, a trade reference and your message. Only name, email and your consent are required; everything else is optional.</li>
<li><strong>What your browser sends:</strong> your IP address, browser type and the page you asked for. Our hosting provider records these in short-lived server logs to deliver the site and protect it from abuse.</li>
<li><strong>What we do not collect:</strong> this website has no analytics, advertising or social-media tracking, and it does not build a profile of you.</li></ul>
<p>Membership of the T57 platform, including identity and business verification, is covered by the separate privacy terms you accept when you open a T57 account.</p>
<h2>Why we use it</h2>
<ul><li>To answer your request, arrange a demo or review your application. The legal basis is your consent, which you give on the form, and our legitimate interest in responding to business enquiries.</li>
<li>To keep the website secure, for example by limiting repeated form submissions. The legal basis is our legitimate interest in protecting the service.</li>
<li>To meet legal obligations, such as keeping records a regulator asks for.</li></ul>
<p>We do not sell personal data, and we do not use it for automated decisions that affect you.</p>
<h2>Who we share it with</h2>
<p>We share personal data only with service providers that help us run this website, under contracts that require them to protect it and use it only on our instructions:</p>
<ul><li>Vercel Inc., which hosts the website and stores form submissions in private, access-controlled storage.</li>
<li>Our email delivery provider, which sends form notifications to our team.</li></ul>
<p>If you ask to be introduced to a country team or a partner, we share only what is needed for that introduction. We may disclose data where the law requires it.</p>
<h2>International transfers</h2>
<p>Our service providers may process data outside your country. Where the law requires it, including the Saudi Personal Data Protection Law and the EU and UK GDPR, we transfer data only with the safeguards those laws allow, such as standard contractual clauses.</p>
<h2>How long we keep it</h2>
<p>We keep enquiries and applications for up to 24 months after our last contact with you, unless you ask us to delete them sooner or the law requires us to keep them longer. Server logs are kept for no more than 30 days.</p>
<h2>Your rights</h2>
<p>Depending on where you live, you can ask us to tell you what data we hold about you, give you a copy, correct it, delete it, restrict how we use it or stop using it, and you can withdraw your consent at any time. Write to <a href="mailto:hello@t57.ai?subject=Privacy%20request">hello@t57.ai</a> with the subject "Privacy request". We reply within 30 days.</p>
<p>If you are not satisfied with our answer, you can complain to your data protection authority. In Saudi Arabia this is the Saudi Data and AI Authority (SDAIA).</p>
<h2>Security</h2>
<p>The site is served only over HTTPS. Form submissions are stored in private storage that is not publicly reachable, and only authorised T57 staff can read them. Read more in <a href="#trust-security" data-go="trust-security">Security &amp; Privacy</a> and <a href="#trust-data-protection" data-go="trust-data-protection">Data Protection</a>.</p>
<h2>Children</h2>
<p>This website is for businesses and is not directed at children. We do not knowingly collect data from anyone under 18.</p>
<h2>Changes to this notice</h2>
<p>We will post any change on this page and update the date below. If a change is significant, we will say so at the top of the page.</p>'''

TERMS = f'''<p>These terms govern your use of the t57.ai website. By using the site you accept them. If you do not accept them, please do not use the site.</p>
<h2>About these terms</h2>
<p>The website is operated by T57 ({CONTACT}). Membership of the T57 trade platform is governed by separate membership terms, which you accept when you open an account. If those terms and these terms conflict, the membership terms apply to your use of the platform.</p>
<h2>What the website is for</h2>
<p>The site explains T57's platform, services and plans for food and agri businesses, financiers, partners and public institutions. It is general information, not an offer to trade, lend, insure or invest, and not legal, financial or investment advice.</p>
<h2>Services from licensed partners</h2>
<p>T57 provides software, verification and workflow. It does not lend money, hold client funds, take ownership of goods or provide transport. Finance, escrow, payments, insurance, takaful, logistics, inspection and customs services described on this site are provided by licensed partners under their own terms and licences, where available in your market.</p>
<h2>Services in development</h2>
<p>Some features described on this site are in beta, in development or planned for a later phase, and are labelled where that applies. Availability, features, prices and partners can vary by country and can change. Prices shown are in US dollars unless stated and exclude taxes.</p>
<h2>Accuracy of information</h2>
<p>We take care to keep the site accurate and to cite the sources of statistics. Market data, indices and forecasts are provided for information only, may be delayed or revised, and should not be the sole basis for a trading or investment decision.</p>
<h2>Acceptable use</h2>
<p>You agree not to misuse the site. In particular, you will not try to gain unauthorised access to it, interfere with its operation, submit false or misleading information through its forms, or copy its content at scale by automated means for a competing service. Search engines and AI answer engines may index the site in line with our robots.txt file.</p>
<h2>Intellectual property</h2>
<p>The T57 name, logo, design, text, graphics and software on this site belong to T57 or its licensors. You may view the site and share links to it, and journalists may use the materials in our <a href="#about-media" data-go="about-media">media kit</a> to report on T57. Any other use needs our written permission.</p>
<h2>Links to other websites</h2>
<p>The site links to other websites, such as sources we cite. We are not responsible for their content or their privacy practices.</p>
<h2>Liability</h2>
<p>The site is provided as it is. To the extent the law allows, T57 is not liable for any loss arising from your use of the site or your reliance on its content. Nothing in these terms limits liability that cannot be limited by law.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of the Kingdom of Saudi Arabia. The competent courts of Riyadh have jurisdiction over any dispute about them, unless the law of your country gives you the right to bring a claim where you live.</p>
<h2>Changes</h2>
<p>We may update these terms. The version on this page, with the date below, is the one that applies.</p>'''

COOKIES = '''<p>This page explains how t57.ai uses cookies and similar browser storage. The short answer: the site sets no tracking or advertising cookies, so we do not need to ask for consent before you browse.</p>
<h2>What the site stores in your browser</h2>
<div class="tbl"><table><thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">How long</th></tr></thead><tbody>
<tr><td>t57-go</td><td>Session storage</td><td>Continues the page transition when you move from one section to another.</td><td>Until you close the tab</td></tr>
<tr><td>t57-seen</td><td>Session storage</td><td>Plays the opening logo animation once per visit, not on every page.</td><td>Until you close the tab</td></tr>
<tr><td>t57-tone</td><td>Local storage</td><td>Remembers the display setting you choose.</td><td>Until you clear it</td></tr>
</tbody></table></div>
<p>These items stay in your browser. They are not sent to us, and they contain no personal data.</p>
<h2>What the site does not use</h2>
<ul><li>No analytics cookies or analytics scripts.</li><li>No advertising or retargeting cookies.</li><li>No social-media pixels or embedded tracking.</li></ul>
<p>Fonts and every other file on the site are served from t57.ai itself, so loading a page does not send your IP address to a third party. Our hosting provider sees standard request data, as explained in the <a href="#legal-privacy" data-go="legal-privacy">Privacy Notice</a>.</p>
<h2>How to control browser storage</h2>
<p>You can clear or block site storage in your browser settings. The site still works if you do; page transitions and the opening animation simply play differently.</p>
<h2>Changes</h2>
<p>If we ever add cookies that need your consent, such as analytics, we will ask before setting them and update this page first.</p>'''

ACCESS = '''<p>T57 wants t57.ai to be usable by everyone, including people who use screen readers, keyboards, magnification or voice control, and people who prefer less motion.</p>
<h2>Our standard</h2>
<p>We design and test the site against the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. We believe the site is <strong>partially conformant</strong>: most pages meet the standard, and the known gaps are listed below.</p>
<h2>What we have built in</h2>
<ul><li>A skip link, a logical heading order and one main heading on every page.</li>
<li>Breadcrumbs, a section bar and previous and next links on every page, so you always know where you are.</li>
<li>Full keyboard access to the menu, search, forms and interactive charts, with a visible focus outline.</li>
<li>Text alternatives for images, and labels on charts, maps and explainer animations, which carry no sound.</li>
<li>Animations, page transitions and video stop when your device is set to reduce motion, and every explainer has a pause button.</li>
<li>Colour contrast that meets AA for text, and layouts that reflow on small screens and when zoomed, without sideways scrolling.</li></ul>
<h2>Known limitations</h2>
<ul><li>Some animated charts announce their final values only, not each step of the animation.</li>
<li>Older downloadable documents may not be fully tagged for screen readers. Ask us and we will send an accessible version.</li>
<li>The site is in English and Arabic. Malay and Turkish versions are in preparation.</li></ul>
<h2>How we test</h2>
<p>We test every release with automated checks (axe-core and Lighthouse) across all pages, and check key journeys by keyboard and with a screen reader. This statement was last reviewed on 28 October 2026.</p>
<h2>Tell us about a problem</h2>
<p>If something on the site does not work for you, write to <a href="mailto:hello@t57.ai?subject=Accessibility">hello@t57.ai</a> with the subject "Accessibility", or call <a href="tel:+966569712222">+966 56 971 22 22</a>. Tell us the page and what happened. We reply within five business days and can provide the information in another format.</p>'''

PAGES = [
    # id, slug, name, h1 lines, standfirst, title, description, body, scene
    ('legal-privacy', 'privacy', 'Privacy Notice', ('What we collect,', 'and why.'),
     'How T57 handles personal data sent through this website, and the rights you have over it.',
     'Privacy Notice | T57', 'What personal data t57.ai collects, why T57 uses it, who it is shared with, how long it is kept and how to exercise your rights.', PRIVACY, 'chain'),
    ('legal-terms', 'terms', 'Terms of Use', ('The terms for', 'using t57.ai.'),
     'The rules for using this website, and what it is and is not.',
     'Terms of Use | T57', 'The terms that govern use of the t57.ai website, including partner services, accuracy of information, intellectual property and governing law.', TERMS, 'value'),
    ('legal-cookies', 'cookies', 'Cookie Policy', ('No tracking.', 'No ad cookies.'),
     'What this website stores in your browser, and what it never does.',
     'Cookie Policy | T57', 't57.ai sets no tracking or advertising cookies. See the three small browser storage items the site uses and how to control them.', COOKIES, 'seed'),
    ('legal-accessibility', 'accessibility', 'Accessibility Statement', ('Built to be used', 'by everyone.'),
     'Our accessibility standard, what we have built in, the known gaps and how to tell us about a problem.',
     'Accessibility Statement | T57', 'How t57.ai meets WCAG 2.2 AA, the known limitations, how we test and how to report an accessibility problem to T57.', ACCESS, 'market'),
]

def head(i, route, name, h1, std, scene, n, eyebrow='Legal'):
    return f'''
<article class="world" id="{i}" data-world="trust-legal" data-route="{route}" data-petal="tech"{' data-parent="legal"' if i != 'legal' else ''} aria-label="{e(name)}" hidden>
  <div class="micro gutter">
    <div class="wrap micro-in">
      <b>{MARK}<a href="#legal" data-go="legal">Legal</a></b>
    </div>
  </div>
  <section class="hero night gutter" aria-labelledby="lg{n}-h1">
    <canvas data-scene="{scene}" aria-hidden="true"></canvas>
    <div class="hero-in">
      <div class="hero-copy">
        <p class="eyebrow">{eyebrow}</p>
        <h1 id="lg{n}-h1"><span class="ln">{e(h1[0])}</span> <span class="ln">{e(h1[1])}</span></h1>
        <p class="std">{e(std)}</p>
      </div>
    </div>
  </section>'''

def cta(i, n):
    q = 'Questions about our policies?' if i == 'legal' else 'Questions about this policy?'
    return f'''
  <section class="cta night gutter" id="cta-{i}" aria-labelledby="lg{n}-cta">
    <div class="cta-in">
      <div><h2 id="lg{n}-cta">{q}</h2><div class="actions"><a class="btn btn-world" href="mailto:hello@t57.ai">Write to hello@t57.ai</a><a class="btn btn-ghost" href="#contact" data-go="contact">Contact T57</a></div></div>
      {MARK.replace('<svg ', '<svg class="petal-big" ', 1)}
    </div>
  </section>
</article>
'''

def articles():
    out = head('legal', '/legal', 'Legal & Policies', ('Clear policies,', 'plainly written.'),
               'How T57 handles your data, the terms for using this website, the browser storage it uses and how we make it accessible.', 'chain', 0, 'Legal')
    cards = ''.join(f'<li class="bl-c" style="--k:{k}"><a href="#{i}" data-go="{i}"><span class="bl-k">Policy</span><b>{e(name)}</b><span class="bl-x">{e(std)}</span>'
                    f'<span class="bl-foot"><time datetime="{UPDATED[0]}">Updated {UPDATED[1]}</time></span></a></li>'
                    for k, (i, _, name, _, std, *_) in enumerate(PAGES))
    out += f'''
  <section class="chapter gutter" aria-labelledby="lg0-all">
    <div class="wrap">
      <p class="eyebrow">Our policies</p>
      <h2 class="h2" id="lg0-all">Four pages, in plain language</h2>
      <ol class="bl-grid two">{cards}</ol>
      <p class="lede" style="margin-top:28px">T57 does not lend, hold client funds or own goods. Finance, escrow, insurance and logistics come from licensed partners under their own terms. Security and data handling on the platform are described in <a href="#trust" data-go="trust">Trust &amp; Compliance</a>.</p>
    </div>
  </section>''' + cta('legal', 0)
    for n, (i, slug, name, h1, std, _t, _d, body, scene) in enumerate(PAGES, 1):
        out += head(i, f'/legal/{slug}', name, h1, std, scene, n, f'Legal · {name}')
        out += f'''
  <section class="chapter gutter post" aria-label="{e(name)}">
    <div class="wrap post-in">
      <div class="post-body">
{body}
      </div>
      <div class="post-side" role="group" aria-label="About this policy">
        <p class="eyebrow">Last updated</p>
        <p><time datetime="{UPDATED[0]}">{UPDATED[1]}</time></p>
        <p class="eyebrow">Contact</p>
        <p>6709 King Fahad Street<br>Riyadh, Saudi Arabia<br><a href="mailto:hello@t57.ai">hello@t57.ai</a><br><a href="tel:+966569712222">+966 56 971 22 22</a></p>
        <a class="post-all" href="#legal" data-go="legal">All policies</a>
      </div>
    </div>
  </section>''' + cta(i, n)
    return out

def meta():
    m = {'legal': dict(title='Legal & Policies | T57', description='T57 privacy notice, terms of use, cookie policy and accessibility statement for the t57.ai website, in plain language.')}
    m.update({i: dict(title=t, description=d) for i, _, _, _, _, t, d, *_ in PAGES})
    return m
