import DocumentLang from '../../../components/DocumentLang';
import { chrome } from '../../../lib/site';

// Shown for any /hi address that is not a translated page, inside the Hindi header and footer.
export const metadata = { title: 'पेज नहीं मिला | T57', robots: { index: false } };

const set = `document.documentElement.lang='hi';document.documentElement.dir='ltr'`;

export default function NotFound() {
  return (
    <div lang="hi" dir="ltr" className="lang-hi">
      <script dangerouslySetInnerHTML={{ __html: set }} />
      <DocumentLang lang="hi" dir="ltr" title={metadata.title} />
      <div dangerouslySetInnerHTML={{ __html: chrome('top', 'hi', 'home') }} />
      <main id="main">
        <section className="gutter" style={{ padding: '120px 0 140px', maxWidth: 760, margin: '0 auto' }}>
          <p className="eyebrow">404</p>
          <h1>आप जो पेज खोज रहे हैं, वह नहीं मिला।</h1>
          <p className="std">हो सकता है इसका पता बदल गया हो। आप होम पेज से आगे बढ़ सकते हैं, या हमें <a href="mailto:hello@t57.ai">hello@t57.ai</a> पर बताएँ कि आप क्या ढूँढ रहे थे।</p>
          <p><a className="btn btn-indigo" href="/hi">होम पेज पर लौटें</a></p>
        </section>
      </main>
      <div dangerouslySetInnerHTML={{ __html: chrome('bottom', 'hi') }} />
    </div>
  );
}
