import React from 'react';
import './globals.css';

export const metadata = {
  title: 'T57.ai',
  description: 'Sovereign Trade & Food Security Infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
