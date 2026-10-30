import { notFound } from 'next/navigation';
import MicrositePage from '../../../components/MicrositePage';
import { byRouteIn, metadataFor, pagesIn } from '../../../lib/site';

// Turkish pages, under /tr, for every page prototype/build.py has a complete translation for.
type Params = { params: { slug?: string[] } };
const routeOf = ({ params }: Params) => '/tr' + (params.slug?.length ? '/' + params.slug.join('/') : '');

// Unknown /tr addresses render the Turkish not-found page (app/tr/not-found.tsx).
export const dynamicParams = true;
export const generateStaticParams = () =>
  Object.values(pagesIn.tr).map((p) => ({ slug: p.route === '/tr' ? [] : p.route.slice(4).split('/') }));
export const generateMetadata = (props: Params) => {
  const id = byRouteIn.tr[routeOf(props)];
  return id ? metadataFor(id, 'tr') : {};
};

export default function Page(props: Params) {
  const id = byRouteIn.tr[routeOf(props)];
  if (!id) notFound();
  return <MicrositePage id={id} lang="tr" />;
}
