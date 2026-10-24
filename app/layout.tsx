import React from 'react';

export const metadata = {
  title: 'T57 Platform',
  description: 'Sovereign Trade & Food Security Infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script src="https://cdn.tailwindcss.com"></script>
        {children}
      </body>
    </html>
  );
}
