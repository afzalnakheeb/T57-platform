import DocumentLang from '../../../components/DocumentLang';
import { chrome } from '../../../lib/site';

// Shown for any /ms address that is not a translated page, inside the Malay header and footer.
export const metadata = { title: 'Halaman tidak ditemui | T57', robots: { index: false } };

const set = `document.documentElement.lang='ms';document.documentElement.dir='ltr'`;

export default function NotFound() {
  return (
    <div lang="ms" dir="ltr" className="lang-ms">
      <script dangerouslySetInnerHTML={{ __html: set }} />
      <DocumentLang lang="ms" dir="ltr" title={metadata.title} />
      <div dangerouslySetInnerHTML={{ __html: chrome('top', 'ms', 'home') }} />
      <main id="main">
        <section className="gutter" style={{ padding: '120px 0 140px', maxWidth: 760, margin: '0 auto' }}>
          <p className="eyebrow">404</p>
          <h1>Halaman ini tidak ditemui.</h1>
          <p className="std">Alamatnya mungkin telah berubah. Mulakan dari halaman utama, atau beritahu kami apa yang anda cari di <a href="mailto:hello@t57.ai">hello@t57.ai</a>.</p>
          <p><a className="btn btn-indigo" href="/ms">Kembali ke halaman utama</a></p>
          <p className="nf-links"><button type="button" className="btn btn-ghost" data-open-search>Cari di T57.ai</button><a href="/ms/who-we-serve">Siapa Yang Kami Bantu</a><a href="/ms/pricing">Harga</a><a href="/ms#cta-home" data-form="demo">Tempah demo</a><a href="/ms/help">Pusat Bantuan</a></p>
        </section>
      </main>
      <div dangerouslySetInnerHTML={{ __html: chrome('bottom', 'ms') }} />
    </div>
  );
}
