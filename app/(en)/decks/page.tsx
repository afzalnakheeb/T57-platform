import { chrome } from '../../../lib/site';
import { DECKS } from '../../../lib/decks';
import { FOLDERS } from '../../../lib/folders';

// The pitch decks page: one card per deck, each opened with the access code T57 sends to recipients.
// The decks themselves are served by app/decks/[deck]/route.ts. The page stays out of search.
export const metadata = {
  title: 'Pitch decks · T57.ai',
  description: 'T57 pitch decks, shared privately by access code.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.t57.ai/decks' },
};

const css = `
.decks{background:linear-gradient(160deg,#2f2e7d 0%,#02246c 55%,#0b1340 100%);color:#fff;position:relative;overflow:hidden}
.decks::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 85% 0%,rgba(91,95,239,.45),rgba(91,95,239,0) 50%),radial-gradient(circle at 0% 100%,rgba(0,139,140,.3),rgba(0,139,140,0) 50%)}
.decks .wrap{position:relative;padding-block:clamp(64px,9vw,120px)}
.decks .eyebrow{color:#f8b716;display:flex;align-items:center;gap:12px}
.decks .eyebrow::before{content:"";width:40px;height:2px;background:#f8b716}
.decks h1{font:700 clamp(34px,5vw,56px)/1.1 var(--font-display);letter-spacing:-.02em;margin:16px 0 12px}
.decks h1 span{display:block;font:600 clamp(22px,2.6vw,30px)/1.5 'Noto Kufi Arabic',var(--font-display);color:#e3d3c5;margin-top:8px}
.decks .lede{color:rgba(255,255,255,.82)}
.deck-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:24px;margin-top:48px}
.deck-card{display:flex;flex-direction:column;gap:14px;padding:32px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(12px);color:#fff;text-decoration:none;transition:border-color .2s,transform .2s,background .2s}
.deck-card:hover{border-color:#f8b716;background:rgba(255,255,255,.09);transform:translateY(-3px)}
.deck-card .lang.folder{background:#39c4c4}
.deck-card .lang{display:inline-flex;align-self:flex-start;padding:4px 12px;border-radius:999px;background:#f8b716;color:#2f2e7d;font:700 13px/20px var(--font-text);letter-spacing:.06em}
.deck-card h2{font:700 24px/1.3 var(--font-display);margin:0}
.deck-card p{margin:0;color:rgba(255,255,255,.78);font-size:16px;line-height:26px}
.deck-card .open{margin-top:auto;padding-top:10px;display:flex;align-items:center;gap:10px;font:500 15px/20px var(--font-text);color:#39c4c4}
.deck-card .open svg{flex:none}
.deck-card[dir=rtl] h2{font-family:'Noto Kufi Arabic',var(--font-display);line-height:1.6}
.deck-card[dir=rtl] p{font-family:'IBM Plex Sans Arabic','Noto Kufi Arabic',var(--font-text);line-height:28px}
.decks .note{margin-top:40px;font-size:14px;line-height:22px;color:rgba(255,255,255,.6)}
.decks .note a{color:#39c4c4}
`;

const lock = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export default function DecksPage() {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@600;700&family=IBM+Plex+Sans+Arabic:wght@400;500&display=swap" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: chrome('top', 'en') }} />
      <main id="main">
        <section className="decks gutter">
          <div className="wrap">
            <p className="eyebrow">Private · خاص</p>
            <h1>Pitch decks<span>العروض التقديمية</span></h1>
            <p className="lede">Each presentation is shared privately. Choose a language and enter the access code you received from T57.</p>
            <div className="deck-grid">
              {DECKS.map((d) => (
                <a key={d.id} className="deck-card" href={`/decks/${d.id}`} lang={d.lang} dir={d.lang === 'ar' ? 'rtl' : 'ltr'}>
                  <span className="lang">{d.label}</span>
                  <h2>{d.title}</h2>
                  <p>{d.summary}</p>
                  <span className="open">{lock}{d.lang === 'ar' ? 'يتطلب رمز الدخول' : 'Access code required'}</span>
                </a>
              ))}
              {FOLDERS.map((f) => (
                <a key={f.id} className="deck-card" href={`/decks/${f.id}`} lang="en">
                  <span className="lang folder">Folder</span>
                  <h2>{f.title}</h2>
                  <p>{f.summary}</p>
                  <span className="open">{lock}{`PIN required · ${f.items.length} items`}</span>
                </a>
              ))}
            </div>
            <p className="note">No code? Write to <a href="mailto:afzal@t57.ai">afzal@t57.ai</a> · <span lang="ar" dir="rtl">ليس لديك رمز؟ راسلنا</span></p>
          </div>
        </section>
      </main>
      <div dangerouslySetInnerHTML={{ __html: chrome('bottom', 'en') }} />
    </>
  );
}
