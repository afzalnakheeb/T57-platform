# Shrinks the logo SVG exported from the brand PDF: gradients sampled at hundreds of stops become the few
# stops that draw the same ramp, and coordinates are rounded to 2 decimals. The logo looks the same.
import re
def _num(m):
    v = float(m.group(0)); r = round(v, 2)
    return ('%d' % r) if r == int(r) else ('%g' % r)
def _stops(m):
    head, body, tail = m.group(1), m.group(2), m.group(3)
    st = [(float(o), tuple(float(c) for c in (r, g, b)), op) for o, r, g, b, op in
          re.findall(r'<stop offset="([\d.]+)" stop-color="rgb\(([\d.]+)%, ([\d.]+)%, ([\d.]+)%\)" stop-opacity="([\d.]+)"/>', body)]
    if len(st) < 3: return m.group(0)
    keep, i = [0], 0
    while i < len(st) - 1:
        j = i + 2
        while j < len(st):
            o0, c0, _ = st[i]; o1, c1, _ = st[j]
            ok = all(abs(c0[k] + (c1[k] - c0[k]) * ((st[t][0] - o0) / ((o1 - o0) or 1)) - st[t][1][k]) < 0.4
                     for t in range(i + 1, j) for k in range(3))
            if not ok: break
            j += 1
        i = j - 1; keep.append(i)
    hx = lambda c: '#%02x%02x%02x' % tuple(round(v * 2.55) for v in c)
    out = ''.join(f'<stop offset="{round(st[k][0], 4):g}" stop-color="{hx(st[k][1])}"/>' for k in keep)
    return head + out + tail
def slim(svg):
    svg = re.sub(r'(<linearGradient[^>]*>)(.*?)(</linearGradient>)', _stops, svg, flags=re.S)
    svg = re.sub(r'(?<=[\s"(,-])\d+\.\d{2,}', _num, svg)
    svg = re.sub(r'>\s+<', '><', svg)
    return svg
