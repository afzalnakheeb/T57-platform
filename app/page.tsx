import MicrositePage from '../components/MicrositePage';
import { metadataFor } from '../lib/site';

export const metadata = metadataFor('home');

export default function Home() {
  return <MicrositePage id="home" />;
}
