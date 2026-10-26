import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';

// Two-world prototype (Farmers, Financiers). Markup is rendered on the server
// so it is crawlable; the scenes and transitions run from public/proto/worlds.js.
const markup = fs.readFileSync(
  path.join(process.cwd(), 'content', 'worlds-body.html'),
  'utf8',
);

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      <Script src="/proto/worlds.js" strategy="afterInteractive" />
    </>
  );
}
