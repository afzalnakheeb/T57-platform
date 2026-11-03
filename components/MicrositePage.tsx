import { chrome, dirOf, jsonLd, markup, type Lang } from '../lib/site';

// One microsite page in one language: the shared header and footer, the server-rendered page markup
// (crawlable) and its structured data. A translated page carries its own lang and dir.
export default function MicrositePage({ id, lang = 'en' }: { id: string; lang?: Lang }) {
  const page = (
    <>
      <div dangerouslySetInnerHTML={{ __html: chrome('top', lang, id) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(id, lang)) }} />
      <main id="main" dangerouslySetInnerHTML={{ __html: markup(id, lang) }} />
      <div dangerouslySetInnerHTML={{ __html: chrome('bottom', lang) }} />
    </>
  );
  if (lang === 'en') return page;
  // Set the document language before first paint, so right-to-left layout and fonts apply at once.
  const set = `document.documentElement.lang='${lang}';document.documentElement.dir='${dirOf(lang)}'`;
  return (
    <div lang={lang} dir={dirOf(lang)} className={`lang-${lang}`}>
      <script dangerouslySetInnerHTML={{ __html: set }} />
      {page}
    </div>
  );
}
