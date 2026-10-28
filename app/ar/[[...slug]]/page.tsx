import { notFound } from 'next/navigation';
import MicrositePage from '../../../components/MicrositePage';
import { byRouteIn, metadataFor, pagesIn } from '../../../lib/site';

// Arabic pages, under /ar, for every page prototype/build.py has a complete translation for.
type Params = { params: { slug?: string[] } };
const routeOf = ({ params }: Params) => '/ar' + (params.slug?.length ? '/' + params.slug.join('/') : '');

// Unknown /ar addresses render the Arabic not-found page (app/ar/not-found.tsx).
export const dynamicParams = true;
export const generateStaticParams = () =>
  Object.values(pagesIn.ar).map((p) => ({ slug: p.route === '/ar' ? [] : p.route.slice(4).split('/') }));
export const generateMetadata = (props: Params) => {
  const id = byRouteIn.ar[routeOf(props)];
  return id ? metadataFor(id, 'ar') : {};
};

export default function Page(props: Params) {
  const id = byRouteIn.ar[routeOf(props)];
  if (!id) notFound();
  return <MicrositePage id={id} lang="ar" />;
}
