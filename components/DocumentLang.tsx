'use client';
import { useEffect } from 'react';

// Keeps the document language, direction and title right on pages React renders in the browser, such as not-found,
// where the inline script in the page markup does not run.
export default function DocumentLang({ lang, dir, title }: { lang: string; dir: 'ltr' | 'rtl'; title?: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (title) document.title = title;
  }, [lang, dir, title]);
  return null;
}
