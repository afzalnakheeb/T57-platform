import { notFound } from 'next/navigation';
import MicrositePage from '../../../../components/MicrositePage';
import { byRouteIn, metadataFor, pagesIn } from '../../../../lib/site';

// Bahasa Malaysia pages, under /ms, for every page prototype/build.py has a complete translation for.
type Params = { params: { slug?: string[] } };
const routeOf = ({ params }: Params) => '/ms' + (params.slug?.length ? '/' + params.slug.join('/') : '');

// Unknown /ms addresses render the Malay not-found page (app/ms/not-found.tsx).
export const dynamicParams = true;
export const generateStaticParams = () =>
  Object.values(pagesIn.ms).map((p) => ({ slug: p.route === '/ms' ? [] : p.route.slice(4).split('/') }));
export const generateMetadata = (props: Params) => {
  const id = byRouteIn.ms[routeOf(props)];
  return id ? metadataFor(id, 'ms') : {};
};

export default function Page(props: Params) {
  const id = byRouteIn.ms[routeOf(props)];
  if (!id) notFound();
  return <MicrositePage id={id} lang="ms" />;
}
