import { notFound } from 'next/navigation';
import MicrositePage from '../../../components/MicrositePage';
import { audiences, metadataFor } from '../../../lib/site';

export const dynamicParams = false;
export const generateStaticParams = () => audiences.map((slug) => ({ slug }));
export const generateMetadata = ({ params }: { params: { slug: string } }) => metadataFor(params.slug);

export default function Audience({ params }: { params: { slug: string } }) {
  if (!audiences.includes(params.slug)) notFound();
  return <MicrositePage id={params.slug} />;
}
