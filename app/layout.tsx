import React from 'react';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { SITE, assetVersion, assistantVersion } from '../lib/site';

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'T57.ai',
  description: 'AI-native digital trade infrastructure for food.',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: '48x48' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport = { themeColor: '#2f2e7d' };

// Each page renders the header, menu, footer and transition veil in its own language (components/MicrositePage).
// The inline script covers the screen (or, inside a microsite, hides the content) before first paint when arriving from
// another microsite, so the petal transition continues without a flash. If the page script is slow or fails to load,
// the cover lifts after 3 seconds anyway, so a page can never stay hidden. Arabic pages get their language and right-to-left
// direction here too, before anything paints.
const arrive = `var d=document.documentElement,p=location.pathname;if(p==='/ar'||p.indexOf('/ar/')===0){d.lang='ar';d.dir='rtl'}try{var g=sessionStorage.getItem('t57-go');if(g)document.documentElement.classList.add(g.indexOf('lift:')===0?'lifting':'arriving')}catch(e){}setTimeout(function(){d.classList.remove('arriving','lifting')},3000)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: arrive }} />
        {/* Roboto is self-hosted (public/fonts, Latin subset), so no third-party font request delays the first paint. */}
        <link rel="preload" href="/fonts/roboto-400.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/roboto-700.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        {children}
        <Script src={`/proto/worlds.js?v=${assetVersion}`} strategy="afterInteractive" />
        {/* T57 AI, the site assistant (public/assistant, app/api/assistant): loads once the page is idle. */}
        <Script src={`/assistant/assistant.js?v=${assistantVersion}`} strategy="lazyOnload" />
        {/* Vercel Web Analytics (cookie-free visits) and Speed Insights (real-visitor Core Web Vitals); both stay idle until switched on in the Vercel project. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
