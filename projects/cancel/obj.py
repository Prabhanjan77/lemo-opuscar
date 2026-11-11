"""Objects of the film's world. One geometry per object, reused everywhere."""
import math
from draw import (C, Cam, box, cyl, tone, mix, hx, clamp, seg, eo, ei, eio, ss, back, spring,
                  lerp, track, point_on, curve_pts, INK, INK2, INK3, PAPER, VIOLET, LAV, CORAL,
                  YELLOW, GRAY, GREEN, DARKMIX, COS30)

SRV_DARK = "#2A2733"
DB_DARK = "#332F3E"


def ground_lattice(c, cam, color, step=2.4, alpha=0.75, span=30):
    col = mix(c.bg, color, alpha)
    r = 1.5
    for i in range(-span, span + 1):
        for j in range(-span, span + 1):
            x, y = i * step, j * step
            u = (x - y) * COS30
            v = (x + y) * 0.5
            sx = cam.ox + (u - cam.cu) * cam.k
            sy = cam.oy + (v - cam.cv) * cam.k
            if -20 < sx < c.W + 20 and -20 < sy < c.H + 20:
                c.ellipse(sx, sy, r, r * 0.7, fill=col)


# ---------------------------------------------------------------- server
def server(c, cam, x, y, z=0.0, t=0.0, active=0.0, base=SRV_DARK, accent=VIOLET,
           w=4.6, d=3.4, h=5.0, slots=3, dim=1.0, led=True):
    box(c, cam, x, y, z, w, d, h, base)
    p = cam.pt
    for i in range(slots):
        z0 = z + h * (0.24 + i * 0.24)
        z1 = z0 + h * 0.10
        q = [p(x + w, y + d * 0.16, z0), p(x + w, y + d * 0.84, z0),
             p(x + w, y + d * 0.84, z1), p(x + w, y + d * 0.16, z1)]
        c.poly(q, fill=mix(base, DARKMIX, 0.22))
        f = clamp((active * 1.35 - i * 0.22) % 1.0) if active > 0 else 0.0
        if active > 0.02 and f > 0.02:
            q2 = [p(x + w, y + d * 0.18, z0), p(x + w, y + d * (0.18 + 0.64 * f), z0),
                  p(x + w, y + d * (0.18 + 0.64 * f), z1), p(x + w, y + d * 0.18, z1)]
            c.poly(q2, fill=mix(accent, base, 0.18 * dim))
    tx, ty = x + w * 0.78, y + d * 0.28
    if led:
        pulse = 0.55 + 0.45 * math.sin(t * 6.0)
        a = active if active > 0 else 0.12
        cxp, cyp = p(tx, ty, z + h)
        c.ellipse(cxp, cyp, 0.20 * cam.k, 0.12 * cam.k,
                  fill=mix(accent, base, 0.55 - 0.45 * a * pulse))
        if active > 0.05:
            rr = (0.30 + 0.28 * ((t * 1.2) % 1.0)) * cam.k
            c.ellipse(cxp, cyp, rr, rr * 0.58, outline=mix(accent, base, 0.55 * ((t * 1.2) % 1.0)), width=1.2)


# ---------------------------------------------------------------- database
def database(c, cam, x, y, z=0.0, t=0.0, active=0.0, base=DB_DARK, accent=VIOLET,
             r=1.95, h=3.3, plates=0, plate_col=None):
    cyl(c, cam, x, y, z, r, h, base, rings=2)
    p = cam.pt
    pc = plate_col or accent
    for i in range(int(plates)):
        zz = z + h + 0.30 + i * 0.26
        x0, y0, x1, y1 = cam.circle(x, y, zz, r * 0.98)
        c.ellipse((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2,
                  fill=mix(pc, base, 0.22 + 0.06 * i))
    cxp, cyp = p(x, y, z + h)
    rx, ry = 1.2247 * r * 0.66 * cam.k, 0.7071 * r * 0.66 * cam.k
    if active > 0.02:
        for k in range(3):
            a0 = (t * 200 * (0.4 + active) + k * 120) % 360
            c.arc(cxp, cyp, rx, ry, a0, a0 + 58, mix(accent, base, 0.10), 3.4)
    c.ellipse(cxp, cyp, 3.0, 2.0, fill=mix(accent, base, 0.15) if active > 0.02 else mix(GRAY, base, 0.55))


# ---------------------------------------------------------------- laptop / client
def laptop(c, cam, x, y, z=0.0, base=SRV_DARK, screen_glow=1.0, dead=0.0, w=4.8, d=3.3,
           glyph=0.0):
    box(c, cam, x, y, z, w, d, 0.30, base)
    p = cam.pt
    zb = z + 0.30
    hs = 2.9
    lean = 0.55
    scr = mix(PAPER, mix(VIOLET, PAPER, 0.62), 1 - dead)
    if dead >= 1:
        scr = mix(base, DARKMIX, 0.45)
    yb = y + d * 0.44
    A = p(x, yb, zb); B = p(x + w, yb, zb)
    Cc = p(x + w, yb - lean, zb + hs); D = p(x, yb - lean, zb + hs)
    c.poly([A, B, Cc, D], fill=mix(base, DARKMIX, 0.10))
    inset = [p(x + 0.16, yb - 0.10, zb + 0.14), p(x + w - 0.16, yb - 0.10, zb + 0.14),
             p(x + w - 0.16, yb - lean + 0.10, zb + hs - 0.16), p(x + 0.16, yb - lean + 0.10, zb + hs - 0.16)]
    c.poly(inset, fill=scr)

    def bil(u, v):
        return (lerp(lerp(inset[0][0], inset[1][0], u), lerp(inset[3][0], inset[2][0], u), v),
                lerp(lerp(inset[0][1], inset[1][1], u), lerp(inset[3][1], inset[2][1], u), v))
    if dead < 1:
        for i, (u0, v0, u1, v1) in enumerate([(0.12, 0.80, 0.50, 0.87), (0.12, 0.64, 0.34, 0.70)]):
            q = [bil(u0, v0), bil(u1, v0), bil(u1, v1), bil(u0, v1)]
            c.poly(q, fill=mix(scr, INK, 0.20 if i == 0 else 0.12))
        if screen_glow > 0.01:
            q = [bil(0.12, 0.34), bil(0.88, 0.34), bil(0.88, 0.45), bil(0.12, 0.45)]
            c.poly(q, fill=mix(scr, INK, 0.09))
            f = clamp(screen_glow) * 0.74
            q = [bil(0.14, 0.36), bil(0.14 + f, 0.36), bil(0.14 + f, 0.43), bil(0.14, 0.43)]
            c.poly(q, fill=VIOLET)
        if glyph > 0.01:
            cxp, cyp = bil(0.5, 0.16)
            rr = 16
            c.arc(cxp, cyp, rr, rr * 0.62, 0, 200 + 150 * glyph, mix(scr, INK, 0.30), 2.4)
    return inset


# ---------------------------------------------------------------- browser / UI card
def ui_card(c, x, y, w, h, fill=PAPER, edge=INK, title="", mono="", sub="", prog=None,
            t=0.0, scale=1.0, accent=VIOLET, dark=False):
    if scale <= 0.01:
        return
    cx, cy = x + w / 2, y + h / 2
    w, h = w * scale, h * scale
    x, y = cx - w / 2, cy - h / 2
    c.rrect(x + 4, y + 8, x + w + 4, y + h + 8, 10, fill=mix(PAPER, INK, 0.14) if not dark else (0, 0, 0))
    c.rrect(x, y, x + w, y + h, 9, fill=fill, outline=edge if not dark else None, width=1.6)
    bar = mix(fill, INK, 0.10) if not dark else mix(fill, PAPER, 0.08)
    c.rrect(x, y, x + w, y + 34 * scale, 9, fill=bar)
    c.rect(x, y + 26 * scale, x + w, y + 34 * scale, fill=bar)
    for i in range(3):
        c.ellipse(x + 20 * scale + i * 16 * scale, y + 17 * scale, 4.2 * scale, 4.2 * scale,
                  fill=mix(bar, INK, 0.35) if not dark else mix(bar, PAPER, 0.3))
    if title:
        c.text(x + 74 * scale, y + 17 * scale, title, 17 * scale,
               mix(fill, INK, 0.55) if not dark else mix(fill, PAPER, 0.55),
               family="mono", weight=500, anchor="lm")
    if mono:
        c.text(x + 30 * scale, y + h * 0.46, mono, 25 * scale,
               INK if not dark else PAPER, family="mono", weight=500, anchor="lm")
    if sub:
        c.text(x + 30 * scale, y + h * 0.66, sub, 17 * scale,
               mix(fill, INK, 0.55) if not dark else mix(fill, PAPER, 0.55), weight=400, anchor="lm")
    if prog is not None:
        ty = y + h - 34 * scale
        c.rrect(x + 30 * scale, ty, x + w - 30 * scale, ty + 9 * scale, 4.5 * scale,
                fill=mix(fill, INK, 0.12) if not dark else mix(fill, PAPER, 0.14))
        fw = (w - 60 * scale) * clamp(prog)
        if fw > 2:
            c.rrect(x + 30 * scale, ty, x + 30 * scale + max(fw, 10 * scale), ty + 9 * scale,
                    4.5 * scale, fill=accent)


# ---------------------------------------------------------------- packets & tokens
def packet(c, cam, x, y, z, s=0.55, color=VIOLET):
    box(c, cam, x - s / 2, y - s / 2, z, s, s, s, color, shadow=False)


def token(c, cam, x, y, z=1.4, t=0.0, color=VIOLET, size=0.95, rings=0):
    """the cancellation signal: a faceted cube with a ring, floating"""
    u, v = (x - y) * COS30, (x + y) * 0.5 - z
    cxp, cyp = cam.pt2(u, v)
    k = cam.k
    if rings:
        for i in range(rings):
            ph = ((t * 0.9) + i / rings) % 1.0
            r = (size * 0.9 + ph * 2.4) * k
            c.ellipse(cxp, cyp, r, r * 0.58, outline=mix(c.bg, color, 0.55 * (1 - ph)), width=2.0)
    a = t * 0.55
    s = size * 0.5
    pts_top = []
    for i in range(4):
        ang = a * 0.6 + i * math.pi / 2
        pts_top.append((cxp + math.cos(ang) * s * k * 0.95, cyp + math.sin(ang) * s * k * 0.50))
    dz = s * k * 0.85
    top = [(px, py - dz / 2) for px, py in pts_top]
    bot = [(px, py + dz / 2) for px, py in pts_top]
    for i in range(4):
        j = (i + 1) % 4
        col = mix(color, PAPER, 0.16) if i == 0 else (color if i == 1 else mix(color, DARKMIX, 0.22))
        c.poly([top[i], top[j], bot[j], bot[i]], fill=col)
    c.poly(top, fill=mix(color, PAPER, 0.34))
    c.poly(top, outline=mix(color, DARKMIX, 0.25), width=1.2)
    return cxp, cyp


def signal_wave(c, cam, x, y, z=0.0, t=0.0, color=CORAL, r0=0.6, r1=3.4, n=2, width=2.2, alpha=1.0):
    for i in range(n):
        ph = ((t * 0.85) + i / max(1, n)) % 1.0
        rr = lerp(r0, r1, ph)
        x0, y0, x1, y1 = cam.circle(x, y, z, rr)
        col = mix(c.bg, color, 0.85 * (1 - ph) * alpha)
        c.ellipse((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2, outline=col, width=width)


# ---------------------------------------------------------------- clock (timeout)
def clock(c, cam, x, y, z=0.0, r=2.2, remain=1.0, t=0.0, color=PAPER, face=INK2, alarm=0.0):
    x0, y0, x1, y1 = cam.circle(x, y, z, r)
    cxp, cyp = (x0 + x1) / 2, (y0 + y1) / 2
    rx, ry = (x1 - x0) / 2, (y1 - y0) / 2
    c.ellipse(cxp, cyp + 14, rx * 1.04, ry * 1.04, fill=(12, 10, 16))
    c.ellipse(cxp, cyp, rx, ry, fill=face)
    rem = clamp(remain)
    if rem > 0.002:
        a0 = -math.pi / 2
        a1 = a0 + 2 * math.pi * rem
        fan = [(cxp, cyp)]
        n = max(3, int(60 * rem) + 2)
        for i in range(n + 1):
            a = a0 + (a1 - a0) * i / n
            fan.append((cxp + rx * math.cos(a), cyp + ry * math.sin(a)))
        c.poly(fan, fill=mix(face, LAV, 0.34 + 0.10 * (1 - rem) + 0.18 * alarm))
        c.arc(cxp, cyp, rx * 0.995, ry * 0.995, math.degrees(a0), math.degrees(a1),
              CORAL if alarm > 0.45 else LAV, 4.5)
    for i in range(12):
        a = math.radians(i * 30 - 90)
        big = i % 3 == 0
        r0 = 0.80 if big else 0.88
        c.line([(cxp + math.cos(a) * rx * r0, cyp + math.sin(a) * ry * r0),
                (cxp + math.cos(a) * rx * 0.96, cyp + math.sin(a) * ry * 0.96)],
               color if big else mix(color, face, 0.45), 3.0 if big else 1.6)
    a = math.radians(-90 + 360 * (1 - rem))
    c.line([(cxp, cyp), (cxp + math.cos(a) * rx * 0.62, cyp + math.sin(a) * ry * 0.62)],
           color, 4.0, cap="round")
    c.ellipse(cxp, cyp, 6.0, 6.0, fill=color)
    val = max(0.0, rem * 3.0)
    c.text(cxp, cyp + ry + 58, f"{val:0.1f}s", 30, color, family="mono", weight=700, anchor="mm",
           tracking=0.5)


# ---------------------------------------------------------------- code panel
KIND_COL = {
    "kw": "#A694F5", "fn": "#F4F3F0", "arg": "#F8DC46", "com": "#6D6880",
    "op": "#D9D9DE", "err": "#EF5366", "ok": "#34C78A",
}
KIND_COL2 = dict(KIND_COL)


def code_panel(c, x, y, w, h, lines, t, dark=True, highlight=None, token_at=None,
               label=None, slide=0.0, font_px=27):
    if slide != 0:
        x += slide
    fill = INK2 if dark else mix(PAPER, INK, 0.04)
    edge = None if dark else mix(INK, PAPER, 0.75)
    c.rrect(x + 6, y + 10, x + w + 6, y + h + 10, 12, fill=(10, 9, 13))
    c.rrect(x, y, x + w, y + h, 11, fill=fill, outline=edge, width=1.4)
    bar = mix(fill, PAPER, 0.07) if dark else mix(fill, INK, 0.07)
    c.rrect(x, y, x + w, y + 38, 11, fill=bar)
    c.rect(x, y + 28, x + w, y + 38, fill=bar)
    for i in range(3):
        c.ellipse(x + 22 + i * 17, y + 19, 4.4, 4.4, fill=mix(bar, PAPER, 0.30) if dark else mix(bar, INK, 0.3))
    c.text(x + 86, y + 19, "report.py", 16, mix(fill, PAPER, 0.5) if dark else mix(fill, INK, 0.55),
           family="mono", weight=500, anchor="lm")
    if label:
        c.text(x + w - 20, y + 19, label, 14, mix(fill, PAPER, 0.42) if dark else mix(fill, INK, 0.45),
               family="mono", weight=500, anchor="rm", tracking=1.2)
    lh = font_px * 1.62
    y0 = y + 82
    gutter_x = x + 34
    tx = x + 86
    if highlight:
        for (idx, amt) in highlight:
            if amt > 0.01 and 0 <= idx < len(lines):
                yy = y0 + idx * lh - lh * 0.52
                band = LAV
                tw = c.measure(lines[idx][0], font_px, "mono", 500)
                x1 = min(x + w - 26, tx + tw + 26)
                c.rrect(tx - 14, yy, x1, yy + lh * 0.98, 5, fill=mix(fill, band, 0.16 * amt))
                c.rect(tx - 14, yy, tx - 10, yy + lh * 0.98, fill=mix(fill, band, 0.95 * amt))
    for i, ln in enumerate(lines):
        appear = t - (0.20 + i * 0.42)
        if appear <= 0:
            continue
        n = int(len(ln[0]) * clamp(appear / 0.34))
        s = ln[0][:n]
        col = KIND_COL[ln[1]]
        c.text(gutter_x, y0 + i * lh, str(i + 1), font_px * 0.78,
               mix(fill, PAPER, 0.28), family="mono", weight=500, anchor="lm")
        c.text(tx, y0 + i * lh, s, font_px, col, family="mono", weight=500, anchor="lm")
        if appear < 0.34:
            wpx = c.measure(s, font_px, "mono", 500)
            c.rect(tx + wpx + 3, y0 + i * lh - font_px * 0.62, tx + wpx + 5,
                   y0 + i * lh + font_px * 0.28, fill=LAV)
    return x, y


def mini_code(c, x, y, lines, px=28, t=0.0, t0=0.0, highlight=None, bg="#16131E"):
    if highlight is not None:
        i, a = highlight
        if a > 0.01:
            yy = y + i * px * 1.72
            c.rrect(x - 16, yy - px * 0.72, x + 470, yy + px * 0.66, 5, fill=mix(bg, YELLOW, 0.16 * a))
            c.rect(x - 16, yy - px * 0.72, x - 12, yy + px * 0.66, fill=mix(bg, YELLOW, 0.9 * a))
    for i, (s, k) in enumerate(lines):
        u = eo(seg(t, t0 + i * 0.14, t0 + i * 0.14 + 0.3))
        if u <= 0.01:
            continue
        yy = y + i * px * 1.72
        c.text(x, yy, s, px, mix(bg, KIND_COL2[k], u), family="mono", weight=500, anchor="lm")
