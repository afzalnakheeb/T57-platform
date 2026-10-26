import { notFound } from 'next/navigation';
import MicrositePage from '../../components/MicrositePage';
import { byRoute, metadataFor, pages } from '../../lib/site';

// Every built sitemap page is generated statically from content/pages.json.
type Params = { params: { slug?: string[] } };
const routeOf = ({ params }: Params) => '/' + (params.slug || []).join('/');

export const dynamicParams = false;
export const generateStaticParams = () =>
  Object.values(pages).map((p) => ({ slug: p.route === '/' ? [] : p.route.slice(1).split('/') }));
export const generateMetadata = (props: Params) => {
  const id = byRoute[routeOf(props)];
  return id ? metadataFor(id) : {};
};

export default function Page(props: Params) {
  const id = byRoute[routeOf(props)];
  if (!id) notFound();
  return <MicrositePage id={id} />;
}
