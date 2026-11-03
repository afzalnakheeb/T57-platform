import { notFound } from 'next/navigation';
import MicrositePage from '../../../../components/MicrositePage';
import { byRouteIn, metadataFor, pagesIn } from '../../../../lib/site';

// Hindi pages, under /hi, for every page prototype/build.py has a complete translation for.
type Params = { params: { slug?: string[] } };
const routeOf = ({ params }: Params) => '/hi' + (params.slug?.length ? '/' + params.slug.join('/') : '');

// Unknown /hi addresses render the Hindi not-found page (app/hi/not-found.tsx).
export const dynamicParams = true;
export const generateStaticParams = () =>
  Object.values(pagesIn.hi).map((p) => ({ slug: p.route === '/hi' ? [] : p.route.slice(4).split('/') }));
export const generateMetadata = (props: Params) => {
  const id = byRouteIn.hi[routeOf(props)];
  return id ? metadataFor(id, 'hi') : {};
};

export default function Page(props: Params) {
  const id = byRouteIn.hi[routeOf(props)];
  if (!id) notFound();
  return <MicrositePage id={id} lang="hi" />;
}
