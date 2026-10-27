import React from 'react';
import Script from 'next/script';
import './globals.css';
import { SITE, chrome, assetVersion } from '../lib/site';

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

// Header, menu, footer and the transition veil are shared by every page.
// The inline script covers the screen (or, inside a microsite, hides the content) before first paint when arriving from
// another microsite, so the petal transition continues without a flash.
const arrive = `try{var g=sessionStorage.getItem('t57-go');if(g)document.documentElement.classList.add(g.indexOf('lift:')===0?'lifting':'arriving')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: arrive }} />
        <link rel="preload" href="/fonts/urbanist-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: chrome('top') }} />
        {children}
        <div dangerouslySetInnerHTML={{ __html: chrome('bottom') }} />
        <Script src={`/proto/worlds.js?v=${assetVersion}`} strategy="afterInteractive" />
      </body>
    </html>
  );
}
