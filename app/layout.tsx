import React from 'react';
import Script from 'next/script';
import './globals.css';
import { SITE, chrome } from '../lib/site';

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
// The inline script covers the screen before first paint when arriving from
// another microsite, so the petal transition continues without a flash.
const arrive = `try{if(sessionStorage.getItem('t57-go'))document.documentElement.classList.add('arriving')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: arrive }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: chrome('top') }} />
        {children}
        <div dangerouslySetInnerHTML={{ __html: chrome('bottom') }} />
        <Script src="/proto/worlds.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
