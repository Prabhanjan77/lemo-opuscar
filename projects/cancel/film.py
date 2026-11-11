"""Why Your API Keeps Working After the User Leaves — 120 s film.

python film.py stills 12 36 84           # review frames -> stills/
python film.py frames --from 0 --to 120 --step 1
python film.py video --fps 30            # out/video.mp4
python film.py srt                       # cancellation.srt
"""
import json, math, os, sys
from PIL import Image
from draw import (C, Cam, Layer, blit, box, cyl, tone, mix, hx, clamp, seg, eo, ei, eio, ss, back,
                  spring, lerp, track, point_on, curve_pts,
                  INK, INK2, INK3, PAPER, VIOLET, LAV, CORAL, YELLOW, GRAY, GREEN, DARKMIX)
from obj import (server, database, laptop, ui_card, packet, token, signal_wave, clock, code_panel,
                 mini_code, ground_lattice, SRV_DARK, DB_DARK)

HERE = os.path.dirname(os.path.abspath(__file__))
DUR = 120.0
SCENES = [(0.0, 12.6), (12.6, 27.6), (27.6, 40.0), (40.0, 53.2), (53.2, 66.8),
          (66.8, 80.8), (80.8, 96.2), (96.2, 107.0), (107.0, 120.0)]


# ------------------------------------------------------------------ type
def kicker(c, x, y, s, col, t=None, t0=0.0, px=20, tracking=3.2):
    u = 1.0 if t is None else eo(seg(t, t0, t0 + 0.45))
    if u <= 0.001:
        return
    c.text(x, y, s, px, mix(c.bg, col, u), family="mono", weight=500, anchor="lm", tracking=tracking)


def dark_bg(c):
    return sum(hx(c.bg)) < 420


# ------------------------------------------------------------------ subtitles
_CUES = None


def cues():
    global _CUES
    if _CUES is None:
        raw = json.load(open(os.path.join(HERE, "subs.json")))
        out = []
        for q in raw:
            if out and (out[-1]["t1"] - out[-1]["t0"] < 1.9 or q["t1"] - q["t0"] < 1.9) and \
                    (q["t0"] - out[-1]["t1"] < 0.35 and len(out[-1]["text"]) + len(q["text"]) < 96):
                out[-1]["t1"] = q["t1"]
                out[-1]["text"] = out[-1]["text"] + "\n" + q["text"]
            else:
                out.append(dict(q))
        _CUES = out
    return _CUES


def caption(c, t):
    for q in cues():
        if q["t0"] <= t <= q["t1"]:
            u = eo(seg(t, q["t0"] - 0.08, q["t0"] + 0.16)) * (1 - eio(seg(t, q["t1"] - 0.16, q["t1"])))
            lines = q["text"].split("\n")
            light_ground = c.bg in (PAPER, "#EDECE7")
            col = mix(c.bg, INK if light_ground else PAPER, u)
            for i, l in enumerate(lines):
                yy = 1004 + (i - (len(lines) - 1) / 2) * 42
                c.text(960, yy, l, 33, col, weight=500, anchor="mm", tracking=0.2)
            return


# ------------------------------------------------------------------ motion helpers
def wtravel(pts3, t, t0, t1, ease=eio):
    u = ease(seg(t, t0, t1))
    L = [math.dist(pts3[i], pts3[i + 1]) for i in range(len(pts3) - 1)]
    tot = sum(L) or 1
    target = u * tot
    acc = 0
    for i, l in enumerate(L):
        if acc + l >= target or i == len(L) - 1:
            k = (target - acc) / l if l else 0
            a, b = pts3[i], pts3[i + 1]
            return tuple(lerp(a[j], b[j], clamp(k)) for j in range(3))
        acc += l
    return pts3[-1]


def world_path(cam, pts3):
    return [cam.pt(*p) for p in pts3]


def label_tag(c, cam, wx, wy, wz, text, col, side="up", px=21, dy=0, t=None, t0=0.0):
    u = 1.0 if t is None else eo(seg(t, t0, t0 + 0.5))
    if u <= 0.001:
        return
    x, y = cam.pt(wx, wy, wz)
    sgn = -1 if side == "up" else 1
    y1 = y + sgn * (58 + dy)
    x1 = x + 34
    c.line([(x, y), (x, y1)], mix(c.bg, col, 0.85 * u), 1.6)
    c.line([(x, y1), (x1 + 74 * u, y1)], mix(c.bg, col, 0.85 * u), 1.6)
    c.ellipse(x, y, 4.2, 4.2, fill=col if u > 0.4 else c.bg, outline=col, width=1.4)
    c.text(x1 + 12, y1 - 13, text, px, mix(c.bg, col, u), family="mono", weight=500, anchor="lm",
           tracking=1.4)


def num(c, x, y, value, px, col, label_txt=None):
    c.text(x, y, f"{int(round(value)):02d}" if value < 10 else f"{int(round(value))}",
           px, col, family="mono", weight=700, anchor="rm", tracking=-1.0)
    if label_txt:
        c.text(x, y + 46, label_txt, 19, col, family="mono", weight=500, anchor="rm", tracking=3.0)


def snap_wire(c, cam, a, b, cut, col=CORAL, draw=1.0, width=2.2, sag=1.2):
    """a client connection that can be cut: cut 0 -> whole, 1 -> two stubs"""
    if draw <= 0.001:
        return
    pa, pb = cam.pt(*a), cam.pt(*b)
    pts = curve_pts(pa, pb, bow=(0, 34 * sag))
    if cut < 0.02:
        c.line(pts[:max(2, int(len(pts) * draw))], mix(c.bg, LAV, 0.85), width, dash=11, gap=8)
        return
    u = eio(cut)
    mid = point_on(pts, 0.5)
    left = pts[:len(pts) // 2]
    right = pts[len(pts) // 2:]
    off = 26 * u
    left = [(x - off * 0.6, y + off * 0.5) for x, y in left]
    right = [(x + off * 0.6, y + off * 0.5) for x, y in right]
    c.line(left, mix(c.bg, LAV, 0.55 * (1 - u * 0.5)), width, dash=11, gap=8)
    c.line(right, mix(c.bg, LAV, 0.55 * (1 - u * 0.5)), width, dash=11, gap=8)
    for sgn in (-1, 1):
        for j in range(2):
            r = 4 + 3 * j
            c.ellipse(mid[0] + sgn * off + sgn * (10 + j * 13), mid[1] - 12 - j * 4, r, r,
                      outline=mix(c.bg, col, 0.9 * (1 - j * 0.4)), width=2.0)


def bg_ground(c, cam, paper=True):
    if paper:
        c.rect(0, 0, c.W, c.H, fill=PAPER)
        ground_lattice(c, cam, mix(PAPER, GRAY, 0.55), 2.4, 0.75, 30)
    else:
        c.rect(0, 0, c.W, c.H, fill=INK)
        ground_lattice(c, cam, INK3, 2.4, 0.9, 30)


# ================================================================== SCENE 1
def scene1(c, t, gt):
    """the hook: a report starts, the browser closes, the server doesn't"""
    c.bg = PAPER
    cam = Cam(track([(0, -9.4), (3.4, -6.6), (6.4, -1.4), (12.6, -1.1)], t),
              track([(0, 0.7), (6.4, 0.15), (12.6, 0.1)], t),
              track([(0, 38), (3.4, 43), (6.3, 56), (12.6, 52)], t), 960, 590)
    bg_ground(c, cam, paper=True)
    lx = lerp(-16.5, -9.4, spring(seg(t, 0.0, 0.95)))
    layer = Layer(c.W, c.H, c.S)
    alive = 1 - eio(seg(t, 6.5, 7.6))
    laptop(layer, cam, lx, -1.0, 0.0, screen_glow=clamp(seg(t, 1.2, 4.6) * 0.75),
           dead=seg(t, 6.2, 6.6), glyph=seg(t, 1.0, 4.0))
    blit(c, layer, alpha=clamp(alive))
    # browser card
    cw, ch = 440, 210
    cx, cy = 250, 214 + 6 * math.sin(t * 1.1)
    s_open = spring(seg(t, 0.5, 1.2))
    sc = min(clamp(s_open), max(0.0, 1 - eio(seg(t, 6.1, 6.5))))
    ui_card(c, cx, cy, cw, ch, fill=PAPER, edge=mix(INK, PAPER, 0.2), title="reports.local",
            mono="Generating report\u2026", sub="POST /reports  \u00b7  202",
            prog=0.12 + 0.55 * eio(seg(t, 1.4, 6.2)), t=t, scale=max(0.001, sc))
    # request packet
    if 1.5 < t < 3.2:
        p3 = wtravel([(-9.4, -0.2, 1.9), (-7.0, -0.1, 2.4), (-4.4, 0.0, 2.6), (-1.6, 0.0, 2.4)],
                     t, 1.55, 2.75)
        packet(c, cam, p3[0], p3[1], p3[2], 0.62, VIOLET)
    active = clamp(seg(t, 2.7, 3.4)) * (1 - 0.15 * seg(t, 7, 8))
    srv_x = -0.2
    server(c, cam, srv_x, 0.0, 0.0, t=t, active=active, base=SRV_DARK, accent=LAV)
    if 2.8 < t < 9.5:
        signal_wave(c, cam, srv_x + 2.3, 1.7, 5.0, t, LAV, 0.25, 1.5, 2, 2.0, 0.55)
    # headline
    if t > 7.15:
        c.text(150, 806, "THE USER LEFT.", 84, mix(PAPER, INK, eo(seg(t, 7.15, 7.7))),
               weight=800, anchor="lm", tracking=1.2 - 0.8 * eo(seg(t, 7.15, 8.0)))
    if t > 8.9:
        u = eo(seg(t, 8.9, 9.45))
        x = 150
        w1 = c.text(x, 900, "THE SERVER ", 54, mix(PAPER, INK, u), weight=800, anchor="lm", tracking=0.4)
        c.text(x + w1, 900, "DIDN'T STOP.", 54, mix(PAPER, mix(VIOLET, INK, 0.15), u), weight=800,
               anchor="lm", tracking=0.4)
        c.rect(x, 934, x + 2 + (w1 + c.measure("DIDN'T STOP.", 54, "inter", 800, 0.4)) * u, 938,
               fill=mix(PAPER, VIOLET, u))
    caption(c, gt)


# ================================================================== SCENE 2
def scene2(c, t, gt):
    """the hidden problem: work continues, queries pile up"""
    c.bg = INK
    cam = Cam(track([(0, -2.2), (4.0, -0.2), (15, 1.6)], t),
              track([(0, 0.05), (15, 0.1)], t),
              track([(0, 52), (5, 50), (15, 48)], t), 960, 600)
    bg_ground(c, cam, paper=False)
    cut = seg(t, 0.35, 0.9)
    snap_wire(c, cam, (-14.5, -1.4, 1.2), (-1.6, 0.0, 2.6), cut, CORAL, draw=1.0, sag=0.35)
    if 0.45 < t < 4.0:
        kicker(c, 90, 130, "CONNECTION LOST", CORAL, t=t)
    dbx = 8.2
    u = spring(seg(t, 1.0, 1.9))
    database(c, cam, dbx, 0.2, lerp(-2.6, 0.0, u), t=t,
             active=clamp(seg(t, 2.2, 3.2)) * (1 - 0.35 * seg(t, 11, 13)), base=DB_DARK)
    server(c, cam, -1.4, -0.2, 0.0, t=t, active=clamp(seg(t, 0.2, 1.2)) * (1 - 0.3 * seg(t, 12, 14)),
           base=SRV_DARK)
    if t > 2.0:
        for i in range(7):
            t0 = 2.0 + i * 0.85
            if t0 < t < t0 + 0.95:
                p3 = wtravel([(1.4, 0.1, 2.4), (4.4, 0.15, 3.1), (7.2, 0.2, 3.4), (8.2, 0.2, 3.2)],
                             t, t0, t0 + 0.9)
                packet(c, cam, p3[0], p3[1], p3[2], 0.5, VIOLET)
    val = 0
    if t > 2.3:
        val = 1
    if t > 4.9:
        val = 4
    if t > 7.9:
        val = 12
    col = CORAL if t > 7.9 else YELLOW
    if t > 2.3:
        u = eo(seg(t, 2.3, 2.6))
        c.rect(1778 - 116 * u, 706, 1778, 712, fill=mix(INK, col, u))
        num(c, 1778, 850, val, 128, mix(INK, col, u), "ACTIVE QUERIES")
    if t > 9.6:
        label_tag(c, cam, dbx, 0.2, 3.6, "WASTED WORK", CORAL, side="up", t=t, t0=9.6, dy=10)
    if t > 13.2:
        u = eo(seg(t, 13.2, 14.2))
        cxp, cyp = cam.pt(3.4, 0.0, 3.2)
        s = 26 * (1 - u) + 0.55 * cam.k
        c.poly([(cxp - s, cyp - s * 0.55), (cxp, cyp - s * 1.1), (cxp + s, cyp - s * 0.55),
                (cxp, cyp)], fill=VIOLET)
        if u > 0.6:
            packet(c, cam, 3.4, 0.0, 2.2, 0.55, VIOLET)
    caption(c, gt)


# ================================================================== SCENE 3
def scene3(c, t, gt):
    """chapter 01, then the signal as an object"""
    c.bg = VIOLET if t < 2.9 else PAPER
    if t < 2.9:
        c.rect(0, 0, c.W, c.H, fill=VIOLET)
        u1 = eo(seg(t, 0.12, 0.7))
        u2 = eo(seg(t, 0.5, 1.05))
        c.text(150, 566 - 34 * (1 - u1), "01", 230, mix(VIOLET, PAPER, u1), weight=800, anchor="lm",
               tracking=-8)
        c.text(164, 700, "CANCELLATION", 52, mix(VIOLET, PAPER, 0.94 * u2),
               weight=500, anchor="lm", tracking=12 - 5 * u2)
        c.line([(164, 756), (164 + 560 * u2, 756)], mix(VIOLET, PAPER, 0.5 * u2), 2.0)
        caption(c, gt)
        return
    cam = Cam(track([(2.9, 1.4), (7.4, 1.4), (12.6, 3.2)], t),
              track([(2.9, 0.4), (7.4, 0.1), (12.6, 0.0)], t),
              track([(2.9, 40), (6.0, 44), (12.6, 62)], t), 960, 600)
    bg_ground(c, cam, paper=True)
    server(c, cam, -7.4, 0.0, 0.0, t=t, active=0.25, base=SRV_DARK)
    database(c, cam, 8.0, 0.0, 0.0, t=t, active=0.2, base=DB_DARK)
    tx, ty, tz = 0.4, -2.2, 4.6
    u = eo(seg(t, 1.5, 3.4))
    pa = world_path(cam, [(-4.0, 0.4, 4.2), (-2.4, -0.6, 5.6), (-0.6, -1.6, 6.0), (tx - 0.9, ty + 0.4, tz + 1.0)])
    pb = world_path(cam, [(tx + 0.9, ty + 0.4, tz + 1.0), (2.6, -0.6, 5.6), (4.6, 0.2, 4.0), (6.4, 0.2, 3.0)])
    c.line(pa[:max(2, int(len(pa) * min(1, u * 1.6)))], mix(PAPER, LAV, 0.9), 2.0, dash=13, gap=10)
    if u > 0.55:
        c.line(pb[:max(2, int(len(pb) * (u - 0.55) / 0.45))], mix(PAPER, LAV, 0.9), 2.0, dash=13, gap=10)
    if 3.2 < t < 5.2:
        u2 = seg(t, 3.2, 4.6)
        x0, y0, x1, y1 = cam.circle(tx, ty, tz - 0.5, 1.0 + u2 * 4.6)
        c.ellipse((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2,
                  outline=mix(PAPER, VIOLET, 0.7 * (1 - u2)), width=2.2)
    token(c, cam, tx, ty, tz - 0.5 + 0.16 * math.sin(t * 1.5), t=t, size=1.25, rings=2)
    label_tag(c, cam, tx, ty, tz, "CANCELLATION SIGNAL", VIOLET, side="down", t=t, t0=3.6, dy=26)
    label_tag(c, cam, -7.4, 0.0, 5.2, "SERVER", mix(INK, PAPER, 0.42), side="up", t=t, t0=2.2, dy=8)
    label_tag(c, cam, 8.0, 0.0, 3.6, "DATABASE", mix(INK, PAPER, 0.42), side="up", t=t, t0=2.4, dy=8)
    if t > 1.2:
        u3 = eo(seg(t, 1.2, 1.8))
        c.text(140, 782, "A cancellation signal is an object", 44, mix(PAPER, INK, u3),
               weight=700, anchor="lm", tracking=-0.3)
        c.text(140, 838, "the request can carry with it.", 44, mix(PAPER, INK, u3),
               weight=700, anchor="lm", tracking=-0.3)
    kicker(c, 140, 132, "THE SIGNAL", mix(INK, VIOLET, 0.3), t=t, t0=0.5)
    caption(c, gt)


# ================================================================== SCENE 4
def SCENE4_ARCH():
    return [("client", -20.0), ("api", -9.0), ("service", 1.6), ("db", 12.4)]


def draw_arch(c, cam, t, label_t=2.0, active=0.0, lit=1.0):
    nodes = dict(SCENE4_ARCH())
    cl, ap, sv, db = nodes["client"], nodes["api"], nodes["service"], nodes["db"]
    laptop(c, cam, cl - 2.4, -1.6, 0.0, screen_glow=0.55, glyph=0.9)
    server(c, cam, ap - 1.7, -1.5, 0.0, t=t, active=active, base=SRV_DARK)
    sx, sy = sv - 1.5, -2.0
    for i in range(3):
        box(c, cam, sx, sy, i * 0.60, 3.2, 2.7, 0.50, SRV_DARK)
        x0, y0, x1, y1 = cam.circle(sx + 1.6, sy + 1.35, i * 0.60 + 0.50, 0.30)
        c.ellipse((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 * 0.55, (y1 - y0) / 2 * 0.55,
                  fill=mix(LAV, SRV_DARK, 0.15) if lit > 0.5 else mix(GRAY, SRV_DARK, 0.6))
    database(c, cam, db, 0.0, 0.0, t=t, active=active, base=DB_DARK)
    tags = [("CLIENT", cl - 1.0, 1.4, 0), ("API", ap + 0.4, 1.2, 0.14),
            ("SERVICE", sv + 0.2, 1.2, 0.28), ("DATABASE", db, 1.4, 0.42)]
    for nm, wx, wy, dt in tags:
        u = eo(seg(t, label_t + dt, label_t + 0.5 + dt))
        if u <= 0.01:
            continue
        x, y = cam.pt(wx, wy, 0.0)
        c.line([(x, y + 8), (x, y + 8 + 26 * u)], mix(c.bg, GRAY, 0.9 * u), 1.4)
        c.text(x, y + 20 + 26 * u, nm, 19,
               mix(c.bg, mix(INK, PAPER, 0.30) if not dark_bg(c) else mix(INK, PAPER, 0.42), u),
               family="mono", weight=500, anchor="mm", tracking=2.4)


def scene4(c, t, gt):
    """how it works: the signal travels the layers"""
    c.bg = PAPER
    cam = Cam(track([(0, -4.6), (4.0, -3.9), (9.6, -2.8), (13.2, -2.6)], t),
              track([(0, -0.9), (13.2, -0.9)], t),
              track([(0, 29), (4.6, 32), (9.6, 39), (13.2, 43)], t), 960, 500)
    bg_ground(c, cam, paper=True)
    nodes = dict(SCENE4_ARCH())
    cl, ap, sv, db = nodes["client"], nodes["api"], nodes["service"], nodes["db"]
    cut = seg(t, 4.9, 5.35)
    u = eo(seg(t, 0.25, 1.1))
    snap_wire(c, cam, (cl - 0.2, -1.0, 1.4), (ap - 1.9, -0.6, 2.4), cut, CORAL, draw=u, sag=0.55)
    c.line(world_path(cam, [(ap + 1.9, -0.2, 1.6), (sv - 1.7, -0.2, 1.8)]), mix(PAPER, GRAY, 1.0), 2.2,
           dash=10, gap=8)
    c.line(world_path(cam, [(sv + 1.9, 0.0, 1.4), (db - 1.4, 0.0, 1.6)]), mix(PAPER, GRAY, 1.0), 2.2,
           dash=10, gap=8)
    active = clamp(seg(t, 3.0, 3.8)) * (1 - seg(t, 8.8, 9.4))
    draw_arch(c, cam, t, label_t=0.9, active=active, lit=1.0 if t < 8.4 else 0.2)
    if t > 1.2:
        wx0, wy0 = ap + 3.4, 4.2
        box(c, cam, wx0, wy0, 0.0, 1.4, 1.4, 1.4, SRV_DARK)
        wx, wy = cam.pt(wx0 + 0.7, wy0 + 0.7, 1.4)
        spin = t * 260 * (1 if t < 9.4 else 0.04)
        c.arc(wx, wy, 15, 9.5, spin, spin + 220, LAV, 2.2)
        if t > 1.8:
            label_tag(c, cam, wx0 + 0.7, wy0 + 0.7, 1.3, "WORKER PROCESS", mix(INK, PAPER, 0.40),
                      side="down", t=t, t0=1.8, dy=4)
    if 1.0 < t < 5.4:
        p3 = wtravel([(cl + 0.4, -1.0, 1.6), (ap - 1.9, -0.5, 2.0), (ap + 2.0, -0.2, 1.9),
                      (sv - 1.8, -0.2, 2.1), (sv + 2.0, 0.0, 1.8), (db - 1.2, 0.0, 2.1)],
                     t, 1.0, 4.4)
        packet(c, cam, p3[0], p3[1], p3[2], 0.6, VIOLET)
    if t > 5.4:
        p3 = wtravel([(ap - 0.4, -1.0, 3.2), (ap + 2.2, -0.4, 3.0), (sv - 1.6, -0.4, 3.2),
                      (sv + 2.2, -0.2, 2.8), (db - 1.2, 0.0, 3.0)], t, 5.4, 8.0)
        if t < 8.1:
            packet(c, cam, p3[0], p3[1], p3[2], 0.52, CORAL)
            signal_wave(c, cam, p3[0], p3[1], p3[2], t, CORAL, 0.4, 1.6, 2, 1.8, 0.7)
    if 8.4 < t < 11.4:
        label_tag(c, cam, sv + 1.1, -1.2, 2.0, "CURRENT OPERATION STOPS", CORAL, side="up",
                  t=t, t0=8.45, dy=4)
    if 9.2 < t < 13.0:
        label_tag(c, cam, db, 0.0, 3.3, "IF THE DRIVER SUPPORTS IT", mix(PAPER, YELLOW, 0.9),
                  side="down", t=t, t0=9.2, dy=44)
    kicker(c, 1290, 122, "COOPERATIVE PROPAGATION", mix(INK, VIOLET, 0.35), t=t, t0=0.36)
    caption(c, gt)


# ================================================================== SCENE 5
CODE = [
    ("async generateReport(signal):", "kw"),
    ("    checkCancelled(signal)", "fn"),
    ("", "op"),
    ("    data = await database.query(signal)", "fn"),
    ("", "op"),
    ("    checkCancelled(signal)", "fn"),
    ("", "op"),
    ("    return buildReport(data)", "fn"),
]


def scene5(c, t, gt):
    """the code: cancellation is cooperative"""
    c.bg = INK
    c.rect(0, 0, c.W, c.H, fill=INK)
    ground_lattice(c, Cam(0, 0, 40, 960, 620), INK3, 2.4, 0.9, 30)
    px, py = 296, 178
    slide = -760 * eio(seg(t, 12.6, 13.6))
    a1 = seg(t, 3.2, 3.7) * (1 - 0.55 * seg(t, 6.4, 7.2))
    a2 = seg(t, 5.4, 5.9) * (1 - 0.25 * seg(t, 9.0, 9.6))
    hl = [(1, a1), (3, a2), (5, a1 * 0.9)]
    code_panel(c, px, py, 1300, 452, CODE, t, dark=True, highlight=hl, label="cancellation",
               slide=slide, font_px=28)
    if t > 0.6:
        yline = py + 82 + min(6, int(max(0, (t - 0.7)) / 0.42)) * 28 * 1.62
        col = CORAL if t > 9.4 else VIOLET
        tx = px + 48 + slide
        bob = 3 * math.sin(t * 3.2)
        s = 14
        c.poly([(tx - s, yline - s * 0.5 + bob), (tx, yline - s * 1.15 + bob),
                (tx + s, yline - s * 0.5 + bob), (tx, yline + s * 0.15 + bob)], fill=col)
        c.poly([(tx - s, yline - s * 0.5 + bob), (tx, yline + s * 0.15 + bob),
                (tx, yline + s * 1.1 + bob), (tx - s, yline + s * 0.45 + bob)], fill=mix(col, DARKMIX, 0.25))
        c.poly([(tx, yline + s * 0.15 + bob), (tx + s, yline - s * 0.5 + bob),
                (tx + s, yline + s * 0.45 + bob), (tx, yline + s * 1.1 + bob)], fill=mix(col, DARKMIX, 0.4))
        c.line([(tx, yline - s * 1.4 + bob), (tx, yline + s * 1.5 + bob)], mix(INK, col, 0.55), 1.2,
               dash=4, gap=5)
    if 3.0 < t < 7.2:
        u = eo(seg(t, 3.0, 3.6))
        x = px + 1300 + 34
        c.line([(x - 24, py + 82 + 47), (x, py + 82 + 47)], mix(INK, LAV, u), 1.6)
        c.text(x + 12, py + 82 + 47 - 14, "a check", 21, mix(INK, PAPER, 0.72 * u), weight=500, anchor="lm")
        c.text(x + 12, py + 82 + 47 + 14, "at any point", 21, mix(INK, PAPER, 0.72 * u), weight=500,
               anchor="lm")
    if t > 6.6:
        u = eo(seg(t, 6.6, 7.2))
        c.text(296, 782, "COOPERATIVE CANCELLATION", 40, mix(INK, PAPER, 0.95 * u), weight=800,
               anchor="lm", tracking=2.0 - 1.0 * u)
        c.text(298, 826, "the operation has to look for the signal", 24, mix(INK, PAPER, 0.5 * u),
               weight=500, anchor="lm")
    if t > 9.4:
        u = eo(seg(t, 9.4, 9.8))
        yl = py + 82 + 3 * 28 * 1.62
        c.text(px + 1300 + 46, yl - 10, "CANCELLED", 22, mix(INK, CORAL, u), family="mono", weight=700,
               anchor="lm", tracking=2.0)
        c.line([(px + 1300 + 34, yl - 18), (px + 1300 + 40, yl - 18)], mix(INK, CORAL, 0.6 * u), 1.4)
    caption(c, gt)


# ================================================================== SCENE 6
LOOP_CODE = [("while hasMoreWork:", "kw"), ("    processNextItem()", "fn")]
LOOP_FIX = [("while hasMoreWork:", "kw"), ("    checkCancelled(signal)", "kw"),
            ("    processNextItem()", "fn")]


def scene6(c, t, gt):
    """why cancellation sometimes fails: a loop that never looks"""
    bg = "#0E0D12"
    c.bg = bg
    c.rect(0, 0, c.W, c.H, fill=bg)
    cam = Cam(track([(0, 0.6), (4.6, 0.4), (7.6, 1.4), (13, 1.4)], t),
              track([(0, 0.2), (7.6, 0.2)], t),
              track([(0, 54), (3.4, 58), (6.2, 26), (9, 27), (13, 34)], t), 960, 560)
    ground_lattice(c, cam, "#1E1B26", 2.4, 0.9, 30)
    cx, cy, r = 1.6, 1.2, 5.6
    x0, y0, x1, y1 = cam.circle(cx, cy, 0.6, r)
    ccx, ccy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    c.ellipse(ccx, ccy + 10, rx * 1.04, ry * 1.04, fill=(6, 5, 9))
    c.ellipse(ccx, ccy, rx, ry, fill="#191622")
    c.ellipse(ccx, ccy, rx * 0.995, ry * 0.995, outline="#2B2739", width=2.0)
    c.ellipse(ccx, ccy, rx * 0.72, ry * 0.72, outline="#221F2C", width=1.4)
    phase = 0.0
    if t < 9.6:
        phase = 0.30 * min(t, 7.9) + (0.30 * (min(t, 9.6) - 7.9) * 0.5 if t > 7.9 else 0)
    frozen = t > 9.6
    n = 8
    flash_idx = int(((phase / (2 * math.pi)) % 1.0) * n + 0.5) % n
    for i in range(n):
        a = phase + i * 2 * math.pi / n - math.pi / 2
        wx = cx + r * 0.98 * math.cos(a)
        wy = cy + r * 0.98 * math.sin(a)
        hot = (i == flash_idx) and not frozen
        s = 0.95
        box(c, cam, wx - s / 2, wy - s / 2, 0.6, s, s, s, VIOLET if hot else "#3E3949", shadow=False)
        if hot:
            px_, py_ = cam.pt(wx, wy, 1.5)
            c.ellipse(px_, py_, 26, 15, outline=mix(bg, LAV, 0.55), width=1.6)
    if t > 3.2:
        u = spring(seg(t, 3.2, 4.2))
        tx = lerp(-13, 1.6, u)
        ty = lerp(11.0, 9.2, u)
        token(c, cam, tx, ty, 3.2, t=t, size=1.0, rings=2 if t > 4.4 else 0)
        if 3.6 < t < 6.4:
            px_, py_ = cam.pt(tx, ty, 3.2)
            c.text(px_, py_ - 40, "SIGNAL ARRIVES", 17, mix(bg, PAPER, 0.55), family="mono",
                   weight=500, anchor="mm", tracking=2.4)
    if t > 6.4:
        u = eo(seg(t, 6.4, 7.0))
        c.text(148, 208, "NO CANCELLATION CHECK.", 62, mix(bg, CORAL, u), weight=800, anchor="lm",
               tracking=1.0)
    if t > 7.5:
        u = eo(seg(t, 7.5, 8.0))
        c.text(150, 286, "WORK CONTINUES.", 34, mix(bg, PAPER, 0.85 * u), weight=700, anchor="lm",
               tracking=1.6)
    if t > 5.6:
        c.rrect(1180, 640, 1760, 900, 10, fill="#16131E", outline="#2A2636", width=1.4)
        c.text(1206, 676, "report_loop.py", 15, mix(bg, PAPER, 0.45), family="mono", weight=500, anchor="lm")
        if t < 9.2:
            mini_code(c, 1216, 742, LOOP_CODE, 26, t, 5.8)
        else:
            mini_code(c, 1216, 742, LOOP_FIX, 26, t, 9.2, highlight=(1, seg(t, 9.8, 10.4)))
            if t > 10.4:
                u = eo(seg(t, 10.4, 10.9))
                c.text(1206, 866, "the next check stops it", 18, mix(bg, GREEN, u), weight=500, anchor="lm")
    if t > 12.2:
        packet(c, cam, 1.4, 0.0, 0.4, 0.7, VIOLET)
    caption(c, gt)


# ================================================================== SCENE 7
def scene7(c, t, gt):
    """timeouts are different"""
    c.bg = PAPER
    c.rect(0, 0, c.W, c.H, fill=PAPER)
    c.rect(960, 0, c.W, c.H, fill="#EDECE7")
    c.rect(958, 0, 962, c.H, fill=mix(PAPER, INK, 0.14))
    camL = Cam(-1.2, 1.0, 46, 480, 520)
    camR = Cam(0.6, 0.6, 46, 1440, 520)
    ground_lattice(c, camL, mix(PAPER, GRAY, 0.6), 2.4, 0.7, 22)
    ground_lattice(c, camR, mix("#EDECE7", GRAY, 0.8), 2.4, 0.7, 22)
    c.text(84, 154, "CANCELLATION", 26, VIOLET, family="mono", weight=500, anchor="lm", tracking=4.0)
    c.text(84, 212, "the client left", 36, INK, weight=700, anchor="lm", tracking=-0.2)
    laptop(c, camL, -3.6, -1.6, 0.0, screen_glow=0.0, dead=1.0)
    if t > 1.0:
        snap_wire(c, camL, (-1.0, -0.9, 1.2), (0.4, -0.4, 2.0), seg(t, 1.0, 1.5), CORAL, sag=0.5, width=2.0)
    if t > 1.4:
        token(c, camL, 2.4, 1.8, 2.2, t=t, size=1.15, rings=1)
    box(c, camL, 1.2, 5.6, 0.0, 2.8, 2.4, 1.1, SRV_DARK)
    if t > 1.6:
        u = eo(seg(t, 1.6, 2.2))
        pa = camL.pt(2.6, 1.9, 2.0)
        pb = camL.pt(2.6, 5.7, 1.2)
        c.line([pa, (pa[0], lerp(pa[1], pb[1], u)), (lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u))],
               mix(PAPER, LAV, 0.9 * u), 2.0, dash=9, gap=8)
    if t > 2.6:
        signal_wave(c, camL, 2.6, 6.8, 1.1, t, CORAL, 0.4, 1.8, 2, 1.8, 0.9)
    c.text(1036, 154, "TIMEOUT", 26, INK, family="mono", weight=500, anchor="lm", tracking=4.0)
    c.text(1036, 212, "the deadline arrived", 36, INK, weight=700, anchor="lm", tracking=-0.2)
    remain = 1.0 - seg(t, 1.0, 6.6)
    clock(c, camR, -0.6, -0.6, 0.0, r=2.6, remain=remain, t=t, color=mix(INK, PAPER, 0.06),
          face="#221F2B", alarm=1 - remain)
    box(c, camR, 1.2, 5.6, 0.0, 2.8, 2.4, 1.1, SRV_DARK)
    if t > 3.0:
        u = eo(seg(t, 3.0, 3.6))
        pa = camR.pt(-0.4, 2.0, 1.6)
        pb = camR.pt(2.6, 5.7, 1.2)
        c.line([pa, (pa[0], lerp(pa[1], pb[1], u)), (lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u))],
               mix("#EDECE7", LAV, 0.9 * u), 2.0, dash=9, gap=8)
    if t > 6.4:
        signal_wave(c, camL, 2.6, 6.8, 1.1, t, CORAL, 0.4, 2.2, 2, 1.8, 0.9)
        signal_wave(c, camR, 2.6, 6.8, 1.1, t, CORAL, 0.4, 2.2, 2, 1.8, 0.9)
    if t > 8.6:
        u = eo(seg(t, 8.6, 9.1))
        c.line([(960 - 470 * u, 826), (960 + 470 * u, 826)], mix(PAPER, INK, 0.16 * u), 1.2)
        c.text(960, 872, "DIFFERENT TRIGGERS.", 30, mix(PAPER, INK, u), weight=800, anchor="mm",
               tracking=1.6)
        v = eo(seg(t, 9.6, 10.1))
        if v > 0:
            w = c.text(960, 924, "SAME GOAL: ", 25, mix(PAPER, INK, 0.75 * v), weight=700,
                       anchor="mm", tracking=1.2)
            c.text(960 + w / 2 + 4, 924, "AVOID UNNECESSARY WORK.", 25, mix(PAPER, VIOLET, v),
                   weight=700, anchor="lm", tracking=1.2)
    caption(c, gt)


# ================================================================== SCENE 8
def scene8(c, t, gt):
    """the correct design"""
    c.bg = INK
    cam = Cam(track([(0, -4.6), (4.0, -3.9), (12.9, -2.8)], t),
              track([(0, -0.9), (12.9, -0.9)], t),
              track([(0, 29), (5, 33), (11, 39), (12.9, 42)], t), 960, 490)
    bg_ground(c, cam, paper=False)
    nodes = dict(SCENE4_ARCH())
    cl, ap, sv, db = nodes["client"], nodes["api"], nodes["service"], nodes["db"]
    snap_wire(c, cam, (cl - 0.2, -1.0, 1.4), (ap - 1.9, -0.6, 2.4), seg(t, 4.6, 5.1), CORAL, sag=0.55)
    c.line(world_path(cam, [(ap + 1.9, -0.2, 1.6), (sv - 1.7, -0.2, 1.8)]), mix(INK, GRAY, 0.35), 2.2,
           dash=10, gap=8)
    c.line(world_path(cam, [(sv + 1.9, 0.0, 1.4), (db - 1.4, 0.0, 1.6)]), mix(INK, GRAY, 0.35), 2.2,
           dash=10, gap=8)
    active = clamp(seg(t, 2.6, 3.4)) * (1 - seg(t, 7.0, 7.8))
    draw_arch(c, cam, t, label_t=0.6, active=active, lit=1.0 if t < 7.4 else 0.25)
    if 0.6 < t < 5.2:
        p3 = wtravel([(cl + 0.4, -1.0, 1.6), (ap - 1.9, -0.5, 2.0), (ap + 2.0, -0.2, 1.9),
                      (sv - 1.8, -0.2, 2.1), (sv + 2.0, 0.0, 1.8), (db - 1.2, 0.0, 2.1)],
                     t, 0.6, 3.6)
        packet(c, cam, p3[0], p3[1], p3[2], 0.6, VIOLET)
    if t > 4.9:
        p3 = wtravel([(ap - 0.4, -1.0, 3.2), (ap + 2.2, -0.4, 3.0), (sv - 1.6, -0.4, 3.2),
                      (sv + 2.2, -0.2, 2.8), (db - 1.2, 0.0, 3.0)], t, 4.9, 6.9)
        if t < 7.0:
            packet(c, cam, p3[0], p3[1], p3[2], 0.5, CORAL)
            signal_wave(c, cam, p3[0], p3[1], p3[2], t, CORAL, 0.4, 1.5, 2, 1.6, 0.7)
    if t > 7.6:
        u = eo(seg(t, 7.6, 8.1))
        x, y = 1420, 210
        rr = 26
        c.ellipse(x, y, rr, rr, fill=mix(INK, GREEN, 0.16 * u))
        c.ellipse(x, y, rr, rr, outline=mix(INK, GREEN, u), width=2.0)
        c.line([(x - 11, y), (x - 3, y + 9), (x + 12, y - 9)], mix(INK, GREEN, u), 4.2, cap="round")
        c.text(x + 48, y - 12, "RESOURCES RELEASED", 27, mix(INK, GREEN, u), weight=700, anchor="lm",
               tracking=1.4)
        c.text(x + 48, y + 22, "operation ended cleanly", 20, mix(INK, PAPER, 0.55 * u), weight=500,
               anchor="lm")
    if t > 5.6:
        val = 8 - 1 * eo(seg(t, 7.6, 8.4))
        u = clamp(seg(t, 5.6, 6.0))
        c.text(150, 806, "ACTIVE WORK", 19, mix(INK, PAPER, 0.55 * u), family="mono", weight=500,
               anchor="lm", tracking=2.6)
        c.text(150, 880, "7" if val < 7.95 else "8", 96, mix(INK, YELLOW if val > 7.5 else GREEN, u),
               family="mono", weight=700, anchor="lm")
    kicker(c, 110, 132, "THE CORRECT DESIGN", mix(PAPER, VIOLET, 0.45), t=t, t0=0.3)
    caption(c, gt)


# ================================================================== SCENE 9
def scene9(c, t, gt):
    """the takeaway"""
    c.bg = VIOLET
    c.rect(0, 0, c.W, c.H, fill=VIOLET)
    cam = Cam(0, 0, 34, 640, 660)
    if t < 6.0:
        u = eo(seg(t, 0.1, 0.7))
        px_ = 74
        w1 = c.measure("DISCONNECT", px_, "inter", 800, 1.0 - 0.6 * u)
        w2 = c.measure("CANCELLATION", px_, "inter", 800, 1.0 - 0.6 * u)
        total = w1 + 150 + w2
        x0 = 960 - total / 2
        c.text(x0, 500, "DISCONNECT", px_, mix(VIOLET, PAPER, u), weight=800, anchor="lm",
               tracking=1.0 - 0.6 * u)
        c.text(x0 + w1 + 74, 500, "\u2260", px_, mix(VIOLET, YELLOW, u), weight=700, anchor="mm")
        c.text(x0 + w1 + 150, 500, "CANCELLATION", px_, mix(VIOLET, PAPER, u), weight=800, anchor="lm",
               tracking=1.0 - 0.6 * u)
        c.text(960, 588, "a closed browser is not a stopped job", 26, mix(VIOLET, PAPER, 0.60 * u),
               weight=500, anchor="mm")
    elif t < 9.2:
        u = eo(seg(t, 6.0, 6.5))
        c.text(960, 470, "PROPAGATE THE SIGNAL.", 74, mix(VIOLET, PAPER, u), weight=800, anchor="mm",
               tracking=1.2 - 0.7 * u)
        v = eo(seg(t, 7.4, 7.9))
        if v > 0:
            c.text(960, 580, "STOP UNNECESSARY WORK.", 74, mix(VIOLET, PAPER, v), weight=800,
                   anchor="mm", tracking=1.2 - 0.7 * v)
    else:
        u = eo(seg(t, 9.2, 9.8))
        c.text(960, 520, "BUILD BETTER BACKENDS.", 74, mix(VIOLET, PAPER, u), weight=800, anchor="mm",
               tracking=1.4 - 0.7 * u)
        if t > 10.2:
            v = eo(seg(t, 10.2, 10.8))
            c.line([(700, 590), (700 + 520 * v, 590)], mix(VIOLET, PAPER, 0.5 * v), 2.0)
    token(c, cam, 0, 0, 0.5 + 0.1 * math.sin(t * 1.2), t=t, size=0.85, color=mix(VIOLET, PAPER, 0.10),
          rings=1)
    if t > 11.4:
        u = eio(seg(t, 11.4, 12.6))
        c.rect(0, 0, c.W, c.H, fill=mix(VIOLET, "#000000", u))
    if t > 12.4:
        c.rect(0, 0, c.W, c.H, fill="#000000")
    caption(c, gt)


SCENE_FN = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9]


def render(t):
    c = C(1920, 1080, 2, PAPER)
    for i, (a, b) in enumerate(SCENES):
        if a <= t < b:
            SCENE_FN[i](c, t - a, t)
            return c.out()
    return c.out()


def main():
    args = sys.argv[1:]
    cmd = args[0] if args else "stills"
    if cmd == "stills":
        ts = [float(x) for x in args[1:]] or [1, 3, 6, 8, 10]
        os.makedirs(os.path.join(HERE, "stills"), exist_ok=True)
        for tt in ts:
            img = render(tt)
            p = os.path.join(HERE, "stills", f"f_{tt:06.2f}.jpg")
            img.save(p, quality=90)
            print(p)
    elif cmd == "frames":
        def opt(k, d=None):
            return args[args.index(k) + 1] if k in args else d
        a, b, st = float(opt("--from", 0)), float(opt("--to", DUR)), float(opt("--step", 1))
        pre = opt("--prefix", "")
        os.makedirs(os.path.join(HERE, "stills"), exist_ok=True)
        t = a
        while t < b - 1e-9:
            render(t).save(os.path.join(HERE, "stills", f"{pre}f_{t:07.2f}.jpg"), quality=88)
            print(t, flush=True)
            t = round(t + st, 4)
    elif cmd == "video":
        import subprocess, imageio_ffmpeg
        ff = imageio_ffmpeg.get_ffmpeg_exe()
        fps = int(args[args.index("--fps") + 1]) if "--fps" in args else 30
        out = args[args.index("--out") + 1] if "--out" in args else os.path.join(HERE, "out", "video.mp4")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        p = subprocess.Popen([ff, "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps),
                              "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium",
                              "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
                             stdin=subprocess.PIPE)
        n = int(round(DUR * fps))
        for f in range(n):
            render(f / fps).save(p.stdin, format="jpeg", quality=94)
            if f % 120 == 0:
                print(f"frame {f}/{n}", flush=True)
        p.stdin.close()
        p.wait()
        print("wrote", out)
    elif cmd == "srt":
        def ts(x):
            h = int(x // 3600); m = int((x % 3600) // 60); s = int(x % 60)
            ms = int(round((x - int(x)) * 1000))
            return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
        cs = cues()
        for a, b in zip(cs, cs[1:]):
            a["t1"] = min(a["t1"], b["t0"] - 0.02)
        lines = []
        for i, q in enumerate(cs, 1):
            lines.append(f"{i}\n{ts(q['t0'])} --> {ts(q['t1'])}\n{q['text'].replace(chr(10), ' ')}\n")
        open(os.path.join(HERE, "cancellation.srt"), "w").write("\n".join(lines))
        print("wrote cancellation.srt", len(cs), "cues")


if __name__ == "__main__":
    main()
