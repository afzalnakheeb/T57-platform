#!/usr/bin/env python3
"""Builds the knowledge base for the T57 AI assistant (app/api/assistant) from the site's own pages.

For each language it reads content[/<lang>]/pages.json and the built page markup, keeps the readable text
(no navigation, buttons, scripts, drawings or hidden decoration), splits each page into passages at its
section headings, and writes content/assistant/<lang>.json:

  { "pages": [[id, route, name, answer], ...],            the site map the assistant always sees
    "chunks": [[page index, heading, text], ...] }        passages it searches for each question

Run it after prototype/build.py whenever page copy changes:  python3 scripts/assistant_index.py
"""
import json, os, re, html
from html.parser import HTMLParser

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_TAGS = {'script', 'style', 'svg', 'video', 'canvas', 'nav', 'button', 'form', 'dialog', 'template', 'noscript', 'select'}
SKIP_CLASS = {'micro', 'crumbs', 'pager', 'actions', 'pg-up', 'vid-f', 'bl-av', 'fx-pause'}
BLOCK = {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'dt', 'dd', 'tr', 'td', 'th', 'figcaption', 'blockquote', 'section', 'div', 'summary', 'br'}
SPACED = {'span', 'b', 'strong', 'i', 'em', 'time', 'small', 'label', 'figure', 'dl', 'ol', 'ul', 'table'}   # inline pieces that sit side by side in a layout
VOID = {'br', 'img', 'input', 'meta', 'link', 'source', 'hr', 'wbr', 'use', 'path', 'col'}
MAX = 1400   # characters per passage: long sections are split on sentence ends


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0        # depth inside skipped elements
        self.stack = []      # (tag, skipping) for each open element
        self.parts = []      # [heading, [text pieces]]
        self.head = None     # heading being collected
        self.new('')

    def new(self, heading):
        self.parts.append([heading, []])

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in VOID:
            if tag == 'br': self.parts[-1][1].append('\n')
            return
        cls = set((a.get('class') or '').split())
        skipping = self.skip > 0 or tag in SKIP_TAGS or bool(cls & SKIP_CLASS) or a.get('aria-hidden') == 'true' or 'hidden' in a
        self.stack.append((tag, skipping))
        if skipping:
            self.skip += 1
            return
        if tag in ('h1', 'h2'):
            self.head = []
        if tag in BLOCK:
            self.parts[-1][1].append('\n')
        elif tag in SPACED:
            self.parts[-1][1].append(' ')

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        # tolerate stray closing tags: pop to the matching element
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for t, s in self.stack[i:]:
                    if s: self.skip -= 1
                del self.stack[i:]
                break
        else:
            return
        if self.skip: return
        if tag in ('h1', 'h2') and self.head is not None:
            h = norm(''.join(self.head))
            self.head = None
            if h:
                # a heading starts a new passage; text gathered so far stays with the previous one
                self.new(h)
                self.parts[-1][1].append(h + '\n')
            return
        if tag in BLOCK:
            self.parts[-1][1].append('\n')
        elif tag in SPACED:
            self.parts[-1][1].append(' ')

    def handle_data(self, data):
        if self.skip: return
        if self.head is not None:
            self.head.append(data)
            return
        self.parts[-1][1].append(data)


def norm(s):
    s = re.sub(r'[ \t ]+', ' ', s)
    s = re.sub(r' *\n[ \n]*', '\n', s)
    return s.strip()


def split(text):
    if len(text) <= MAX: return [text]
    out, cur = [], ''
    for s in re.split(r'(?<=[.!?؟。।])\s+|\n', text):
        if cur and len(cur) + len(s) > MAX:
            out.append(cur.strip()); cur = ''
        cur += s + ' '
    if cur.strip(): out.append(cur.strip())
    return out


def build(lang):
    base = os.path.join(R, 'content') if lang == 'en' else os.path.join(R, 'content', lang)
    meta = json.load(open(os.path.join(base, 'pages.json'), encoding='utf8'))
    pages, chunks = [], []
    for pid, p in meta.items():
        f = os.path.join(base, 'pages', pid + '.html')
        if not os.path.exists(f): continue
        n = len(pages)
        pages.append([pid, p['route'], p['name'], p.get('answer', '')])
        t = Text(); t.feed(open(f, encoding='utf8').read()); t.close()
        h1 = p.get('h1') or p['name']
        for heading, bits in t.parts:
            body = norm(''.join(bits))
            if len(body) < 40: continue
            for piece in split(body):
                chunks.append([n, heading or h1, piece])
        # the page's own questions and answers, as written for search engines
        for q in p.get('faqs', []):
            chunks.append([n, q['q'], q['q'] + '\n' + q['a']])
    os.makedirs(os.path.join(R, 'content', 'assistant'), exist_ok=True)
    out = os.path.join(R, 'content', 'assistant', lang + '.json')
    json.dump({'pages': pages, 'chunks': chunks}, open(out, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print(lang, len(pages), 'pages', len(chunks), 'passages', os.path.getsize(out) // 1024, 'KB')


for lang in ('en', 'ar', 'ms', 'tr', 'hi'):
    build(lang)
