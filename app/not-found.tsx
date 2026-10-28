import { chrome } from '../lib/site';

// Shown for any address that is not a sitemap page, inside the shared header and footer.
export const metadata = { title: 'Page not found | T57', robots: { index: false } };

export default function NotFound() {
  return (
    <>
    <div dangerouslySetInnerHTML={{ __html: chrome('top') }} />
    <main id="main">
      <section className="gutter" style={{ padding: '120px 0 140px', maxWidth: 760, margin: '0 auto' }}>
        <p className="eyebrow">404</p>
        <h1>We could not find that page.</h1>
        <p className="std">The address may have changed. Start from the home page, or tell us what you were looking for at <a href="mailto:hello@t57.ai">hello@t57.ai</a>.</p>
        <p><a className="btn btn-indigo" href="/">Go to the home page</a></p>
      </section>
    </main>
    <div dangerouslySetInnerHTML={{ __html: chrome('bottom') }} />
    </>
  );
}
