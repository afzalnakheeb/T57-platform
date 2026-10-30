import DocumentLang from '../../components/DocumentLang';
import { chrome } from '../../lib/site';

// Shown for any /tr address that is not a translated page, inside the Turkish header and footer.
export const metadata = { title: 'Sayfa bulunamadı | T57', robots: { index: false } };

const set = `document.documentElement.lang='tr';document.documentElement.dir='ltr'`;

export default function NotFound() {
  return (
    <div lang="tr" dir="ltr" className="lang-tr">
      <script dangerouslySetInnerHTML={{ __html: set }} />
      <DocumentLang lang="tr" dir="ltr" title={metadata.title} />
      <div dangerouslySetInnerHTML={{ __html: chrome('top', 'tr', 'home') }} />
      <main id="main">
        <section className="gutter" style={{ padding: '120px 0 140px', maxWidth: 760, margin: '0 auto' }}>
          <p className="eyebrow">404</p>
          <h1>Aradığınız sayfa bulunamadı.</h1>
          <p className="std">Adres değişmiş olabilir. Ana sayfadan devam edebilir ya da ne aradığınızı <a href="mailto:hello@t57.ai">hello@t57.ai</a> adresinden bize yazabilirsiniz.</p>
          <p><a className="btn btn-indigo" href="/tr">Ana sayfaya dön</a></p>
        </section>
      </main>
      <div dangerouslySetInnerHTML={{ __html: chrome('bottom', 'tr') }} />
    </div>
  );
}
