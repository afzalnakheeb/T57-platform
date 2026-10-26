import MicrositePage from '../../components/MicrositePage';
import { metadataFor } from '../../lib/site';

export const metadata = metadataFor('who-we-serve');

export default function WhoWeServe() {
  return <MicrositePage id="who-we-serve" />;
}
