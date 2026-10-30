import fs from 'node:fs';
import path from 'node:path';
import { SITE, LANGS, pagesIn, pages } from '../lib/site';

// Every page in every language, with its language alternates and the date its page was last built
// (a blog post's publication date).
const url = (route: string) => `${SITE}${route === '/' ? '' : route}`;
const built = (lang: string, id: string) => fs.statSync(path.join(process.cwd(), 'content', lang === 'en' ? '' : lang, 'pages', `${id}.html`)).mtime;

export default function sitemap() {
  return LANGS.flatMap((lang) => Object.entries(pagesIn[lang]).map(([id, p]) => {
    const languages: Record<string, string> = {};
    for (const l of LANGS) if (pagesIn[l][id]) languages[l] = url(pagesIn[l][id].route);
    languages['x-default'] = url(pages[id].route);
    return { url: url(p.route), lastModified: p.post?.date ?? built(lang, id), alternates: { languages } };
  }));
}
