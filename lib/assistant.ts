import en from '../content/assistant/en.json';
import ar from '../content/assistant/ar.json';
import ms from '../content/assistant/ms.json';
import tr from '../content/assistant/tr.json';

// The T57 AI assistant's knowledge: the site's own pages in English, Arabic, Malay and Turkish (scripts/assistant_index.py).
// Each question is matched against the passages with BM25, and the best few are given to Claude with the site map,
// so every answer comes from what t57.ai already says, with links to the pages it came from.
type Index = { pages: [string, string, string, string][]; chunks: [number, string, string][] };
export type AssistantLang = 'en' | 'ar' | 'ms' | 'tr';

const STOP = new Set(('a an and are as at be by can do does for from has have how i if in is it its me my of on or our so that the their this to us was we what when where which who why will with you your about into than then them they there these those would could should also any all more most other some such only own same just very am been being did doing had having here hers him his her she he out over under again further once both each few nor not no off up down too s t ' +
  'yang dan di ke dari untuk dengan ini itu ialah adalah apa apakah bagaimana berapa bila mana siapa mengapa kenapa adakah boleh saya kami kita anda awak dia mereka atau juga tidak tak ada akan sudah telah pada oleh bagi sahaja lagi ' +
  've ile bir bu şu o da de mi mı mu mü ne nasıl neden nerede hangi kim için gibi daha çok en ama veya ya ki var yok olan olarak sonra önce her tüm bana beni siz sizin biz bizim ' +
  'في من على إلى الى عن مع هل ما ماذا كيف لماذا أين متى هذا هذه ذلك تلك التي الذي الذين هو هي هم نحن انا أنا انت أنت كان تكون يكون او أو ثم قد لا لم لن ان أن إن كل بعض عند لدى كم').split(' '));

// Arabic letters vary in writing (hamza forms, final yaa, taa marbuta, short vowels), so they are folded to one form.
function fold(word: string) {
  let w = word.replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  if (/[؀-ۿ]/.test(w)) {
    for (const p of ['وال', 'بال', 'فال', 'كال', 'لل', 'ال']) if (w.startsWith(p) && w.length - p.length >= 3) { w = w.slice(p.length); break; }
    // a light stem: common plural, feminine and pronoun endings
    for (const e of ['يات', 'ات', 'ون', 'ين', 'ها', 'هم', 'نا', 'يه', 'ه', 'ي']) if (w.endsWith(e) && w.length - e.length >= 3) { w = w.slice(0, -e.length); break; }
  } else if (w.length > 4 && w.endsWith('ies')) w = w.slice(0, -3) + 'y';
  else if (w.length > 4 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  return w;
}
// (built with the constructor: the Unicode flag needs a newer compile target than this project sets)
const NOT_WORD = new RegExp('[^\\p{L}\\p{N}]+', 'u');
export const tokens = (s: string) =>
  s.toLowerCase().normalize('NFKC').split(NOT_WORD).filter((w) => w && !STOP.has(w)).map(fold).filter((w) => w.length > 1 || /\d/.test(w));

type Search = { idx: Index; tf: Map<string, number>[]; len: number[]; df: Map<string, number>; avg: number; byRoute: Map<string, number> };
function prepare(idx: Index): Search {
  const df = new Map<string, number>(), tf: Map<string, number>[] = [], len: number[] = [];
  for (const [p, heading, text] of idx.chunks) {
    // the page name and section heading count as part of the passage, so "pricing" finds the pricing pages
    const words = tokens(`${idx.pages[p][2]} ${heading} ${text}`);
    const m = new Map<string, number>();
    for (const w of words) m.set(w, (m.get(w) || 0) + 1);
    m.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1));
    tf.push(m); len.push(words.length);
  }
  const avg = len.reduce((a, b) => a + b, 0) / Math.max(1, len.length);
  return { idx, tf, len, df, avg, byRoute: new Map(idx.pages.map((p, i) => [p[1], i])) };
}
const SEARCH: Record<AssistantLang, Search> = { en: prepare(en as unknown as Index), ar: prepare(ar as unknown as Index), ms: prepare(ms as unknown as Index), tr: prepare(tr as unknown as Index) };

export type Passage = { route: string; page: string; heading: string; text: string };
export function search(lang: AssistantLang, query: string, route?: string, limit = 10, budget = 9000): Passage[] {
  const s = SEARCH[lang], q = Array.from(new Set(tokens(query))), N = s.tf.length, k1 = 1.2, b = 0.75;
  const here = route ? s.byRoute.get(route) : undefined;
  const scored: [number, number][] = [];
  s.tf.forEach((m, i) => {
    let score = 0;
    for (const w of q) {
      const f = m.get(w); if (!f) continue;
      const n = s.df.get(w) || 0, idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * s.len[i] / s.avg));
    }
    // the page the visitor is reading is the likeliest subject of "this", "here" and "it"
    if (here !== undefined && s.idx.chunks[i][0] === here) score = score * 1.4 + 0.6;
    if (score > 0) scored.push([score, i]);
  });
  scored.sort((x, y) => y[0] - x[0]);
  const out: Passage[] = []; let used = 0;
  for (const [, i] of scored) {
    const [p, heading, text] = s.idx.chunks[i];
    if (used + text.length > budget) continue;
    out.push({ route: s.idx.pages[p][1], page: s.idx.pages[p][2], heading, text });
    used += text.length;
    if (out.length >= limit) break;
  }
  return out;
}

// The opening passage, the price table and the questions of the pages most visitors ask about (what T57 is, membership and prices),
// given with every answer so the basics never depend on how a question is worded.
const CORE = ['home', 'pricing', 'pricing-plans'];
export function core(lang: AssistantLang, budget = 4500): Passage[] {
  const s = SEARCH[lang], out: Passage[] = []; let used = 0;
  for (const id of CORE) {
    const p = s.idx.pages.findIndex((x) => x[0] === id); if (p < 0) continue;
    const mine = s.idx.chunks.filter((c) => c[0] === p);
    for (const [, heading, text] of [mine[0], ...mine.filter((c) => /\$\d/.test(c[2])), ...mine.filter((c) => /[?؟]\s*$/.test(c[1]))].filter(Boolean)) {
      if (used + text.length > budget) break;
      out.push({ route: s.idx.pages[p][1], page: s.idx.pages[p][2], heading, text }); used += text.length;
    }
  }
  return out;
}

// Every page in one line (route, name, its one-sentence answer): enough for the assistant to send people to the right page.
export const siteMap = (lang: AssistantLang) => SEARCH[lang].idx.pages.map(([, route, name, answer]) => `${route} | ${name} | ${answer}`).join('\n');
export const isRoute = (lang: AssistantLang, route: string) => SEARCH[lang].byRoute.has(route);
