import { jsonLd, markup } from '../lib/site';

// One microsite page: server-rendered markup (crawlable) plus its structured data.
export default function MicrositePage({ id }: { id: string }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(id)) }} />
      <main id="main" dangerouslySetInnerHTML={{ __html: markup(id) }} />
    </>
  );
}
