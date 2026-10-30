# Translation by text unit: the English page markup stays the single source of structure, and each language
# supplies a map from English unit to translated unit (prototype/<lang>/<id>.json).
# A unit is the inner HTML of a leaf text element (a paragraph, heading, list item, button, SVG text...),
# inline tags included, or a text-bearing attribute (alt, aria-label, title, placeholder).
import re, html

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
        'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'use', 'stop', 'image', 'feGaussianBlur'}
INLINE = {'a', 'b', 'strong', 'em', 'i', 'small', 'span', 'br', 'sup', 'sub', 'abbr', 'mark', 'u', 's', 'code', 'time', 'bdi'}
SKIP = {'script', 'style'}
ATTRS = ('alt', 'aria-label', 'title', 'placeholder', 'data-label')
TAG = re.compile(r'<(/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+))?)*)\s*(/?)>|<!--.*?-->', re.S)
letters = re.compile(r'[A-Za-z]')

def units(src):
    """Yield (start, end, text) spans of translatable units, outermost-leaf first, non-overlapping."""
    stack, out = [], []   # stack items: [tag, inner_start, has_block_child]
    for m in TAG.finditer(src):
        if m.group(0).startswith('<!--'): continue
        close, tag, selfclose = m.group(1), m.group(2), m.group(4)
        low = tag.lower()
        if not close:
            if stack and low not in INLINE: stack[-1][2] = True
            if low in VOID or selfclose: continue
            stack.append([low, m.end(), False])
        else:
            while stack and stack[-1][0] != low: stack.pop()
            if not stack: continue
            t, start, block = stack.pop()
            if block and stack: stack[-1][2] = True
            if t in SKIP or t in INLINE: continue
            if not block: out.extend(refine(src, start, m.start()))
    return sorted(out)

def children(src, a, b):
    """Top-level child elements of src[a:b] as (outer_start, inner_start, inner_end, outer_end), or None if
    there is loose text between them."""
    kids, depth, pos, cur = [], 0, a, None
    for m in TAG.finditer(src, a, b):
        if m.group(0).startswith('<!--'): continue
        if depth == 0 and letters.search(src[pos:m.start()]): return None
        close, tag, selfclose = m.group(1), m.group(2).lower(), m.group(4)
        if not close:
            if tag in VOID or selfclose:
                if depth == 0: pos = m.end()
                continue
            if depth == 0: cur = [m.start(), m.end()]
            depth += 1
        else:
            depth -= 1
            if depth == 0 and cur: kids.append((cur[0], cur[1], m.start(), m.end())); pos = m.end()
    if letters.search(src[pos:b]): return None
    return kids

def refine(src, a, b):
    # A unit made only of elements (a row of links, a label wrapped in a span) splits into one unit per element,
    # so link targets and classes never pass through translation.
    inner = src[a:b]
    if not letters.search(re.sub(r'<[^>]+>', '', inner)): return []
    kids = children(src, a, b)
    if kids:
        out = []
        for _, ia, ib, _ in kids: out.extend(refine(src, ia, ib))
        return out
    return [(a, b, inner)]

def attr_units(src):
    for m in re.finditer(r'\s(' + '|'.join(ATTRS) + r')="([^"]*)"', src):
        if letters.search(m.group(2)): yield m.start(2), m.end(2), m.group(2)

def norm(s): return re.sub(r'\s+', ' ', s).strip()

def loose(src):
    # text runs left outside any unit (a label beside an input, a link beside an icon): each one is a unit too
    for m in re.finditer(r'(<script.*?</script>|<style.*?</style>)|>([^<]+)<', src, re.S):
        if m.group(2) and letters.search(m.group(2)) and not re.search(r'[\u0600-\u06ff]', m.group(2)): yield m.start(2), m.end(2), m.group(2)

def extract(src):
    seen, res = set(), []
    def add(t):
        k = norm(t)
        if k and k not in seen: seen.add(k); res.append(k)
    for _, _, t in list(units(src)) + list(attr_units(src)): add(t)
    rest = apply(src, {k: '\x00' for k in res}, loose_pass=False)
    for _, _, t in loose(rest): add(t)
    return res

def apply(src, tr, missing=None, loose_pass=True):
    spans = [(a, b, t, False) for a, b, t in units(src)] + [(a, b, t, True) for a, b, t in attr_units(src)]
    spans.sort(key=lambda x: x[0])
    out, pos, done = [], 0, []
    for a, b, t, is_attr in spans:
        if a < pos: continue
        k = norm(t); v = tr.get(k)
        if v is None:
            if missing is not None: missing.add(k)
            continue
        if is_attr: v = v.replace('"', '&quot;')
        lead = t[:len(t) - len(t.lstrip())]; trail = t[len(t.rstrip()):]
        out.append(src[pos:a]); done.append(v); out.append(f'{lead}\x01{len(done) - 1}\x02{trail}'); pos = b
    out.append(src[pos:])
    # translated units are held as placeholders during the loose pass, so text in a Latin-script language
    # is never mistaken for English left untranslated
    put = lambda s: re.sub(r'\x01(\d+)\x02', lambda m: done[int(m.group(1))], s)
    if loose_pass:
        res, out, pos = ''.join(out), [], 0
        for a, b, t in loose(res):
            k = norm(t); v = tr.get(k)
            if v is None:
                if missing is not None: missing.add(k)
                continue
            out.append(res[pos:a]); out.append(t[:len(t) - len(t.lstrip())] + v + t[len(t.rstrip()):]); pos = b
        out.append(res[pos:])
    return put(''.join(out))
