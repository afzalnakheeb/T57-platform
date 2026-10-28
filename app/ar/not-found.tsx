import DocumentLang from '../../components/DocumentLang';
import { chrome } from '../../lib/site';

// Shown for any /ar address that is not a translated page, inside the Arabic header and footer.
export const metadata = { title: 'الصفحة غير موجودة | T57', robots: { index: false } };

const set = `document.documentElement.lang='ar';document.documentElement.dir='rtl'`;

export default function NotFound() {
  return (
    <div lang="ar" dir="rtl" className="lang-ar">
      <script dangerouslySetInnerHTML={{ __html: set }} />
      <DocumentLang lang="ar" dir="rtl" title={metadata.title} />
      <div dangerouslySetInnerHTML={{ __html: chrome('top', 'ar', 'home') }} />
      <main id="main">
        <section className="gutter" style={{ padding: '120px 0 140px', maxWidth: 760, margin: '0 auto' }}>
          <p className="eyebrow">404</p>
          <h1>لم نعثر على هذه الصفحة.</h1>
          <p className="std">ربما تغيّر العنوان. ابدأ من الصفحة الرئيسية، أو أخبرنا بما تبحث عنه على <a href="mailto:hello@t57.ai">hello@t57.ai</a>.</p>
          <p><a className="btn btn-indigo" href="/ar">العودة إلى الصفحة الرئيسية</a></p>
        </section>
      </main>
      <div dangerouslySetInnerHTML={{ __html: chrome('bottom', 'ar') }} />
    </div>
  );
}
