"""Isometric drawing engine for the film.

Everything is drawn at S x (supersampled) and downsized once per frame.
World: true isometric, 30 degree axes.  u = (x-y)*cos30, v = (x+y)/2 - z.
A Camera maps world -> design pixels (1920x1080); the Canvas scales to the
supersampled buffer.  One world -> screen function for every effect.
"""
import math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
COS30 = 0.8660254037844387

INK    = "#121116"
INK2   = "#1B1922"
INK3   = "#26232F"
PAPER  = "#F4F3F0"
VIOLET = "#5226D9"
LAV    = "#A694F5"
CORAL  = "#EF5366"
YELLOW = "#F8DC46"
GRAY   = "#D9D9DE"
GREEN  = "#34C78A"
WHITE  = "#FFFFFF"
DARKMIX = "#1A1524"

FONTS = {
    ("inter", 400): "fonts/Inter_400Regular.ttf",
    ("inter", 500): "fonts/Inter_500Medium.ttf",
    ("inter", 700): "fonts/Inter_700Bold.ttf",
    ("inter", 800): "fonts/Inter_800ExtraBold.ttf",
    ("mono", 400): "fonts/JetBrainsMono_400Regular.ttf",
    ("mono", 500): "fonts/JetBrainsMono_500Medium.ttf",
    ("mono", 700): "fonts/JetBrainsMono_700Bold.ttf",
}
_FONTS = {}


def font(family, weight, px, S):
    key = (family, weight, round(px * S))
    f = _FONTS.get(key)
    if f is None:
        f = ImageFont.truetype(os.path.join(HERE, FONTS[(family, weight)]), max(1, int(round(px * S))))
        _FONTS[key] = f
    return f


def hx(c):
    if isinstance(c, tuple):
        return c
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    a, b = hx(a), hx(b)
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def tone(base, which):
    """three flat tones per face: top light, left mid, right dark"""
    b = hx(base)
    dark = sum(b) < 380
    if which == "top":
        return mix(b, WHITE, 0.26 if dark else 0.40)
    if which == "left":
        return mix(b, WHITE, 0.10 if dark else 0.0)
    return mix(b, DARKMIX, 0.30 if dark else 0.24)


# ---------------------------------------------------------------- easings
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def seg(t, a, b):
    if b == a:
        return 1.0 if t >= b else 0.0
    return clamp((t - a) / (b - a))


def eo(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ei(t):
    return clamp(t) ** 3


def eio(t):
    t = clamp(t)
    return 4 * t * t * t if t < .5 else 1 - (-2 * t + 2) ** 3 / 2


def ss(t):
    t = clamp(t)
    return t * t * (3 - 2 * t)


def back(t, s=1.7):
    t = clamp(t) - 1
    return 1 + t * t * ((s + 1) * t + s)


def spring(t, k=7.0, z=0.35):
    t = max(0.0, t)
    return 1 - math.exp(-z * k * t) * math.cos(k * math.sqrt(1 - z * z) * t * 1.6)


def lerp(a, b, t):
    return a + (b - a) * t


def track(keys, t):
    """piecewise smoothstep between [time, value] keys"""
    if t <= keys[0][0]:
        return keys[0][1]
    if t >= keys[-1][0]:
        return keys[-1][1]
    for i in range(len(keys) - 1):
        a, b = keys[i], keys[i + 1]
        if a[0] <= t <= b[0]:
            u = ss((t - a[0]) / (b[0] - a[0]))
            if isinstance(a[1], (tuple, list)):
                return tuple(lerp(a[1][j], b[1][j], u) for j in range(len(a[1])))
            return lerp(a[1], b[1], u)
    return keys[-1][1]


# ---------------------------------------------------------------- camera
class Cam:
    """cu, cv: world point at frame centre (iso u/v space); k: pixels per unit"""

    def __init__(self, cu=0.0, cv=0.0, k=40.0, ox=960.0, oy=540.0):
        self.cu, self.cv, self.k, self.ox, self.oy = cu, cv, k, ox, oy

    def pt(self, x, y, z=0.0):
        u = (x - y) * COS30
        v = (x + y) * 0.5 - z
        return (self.ox + (u - self.cu) * self.k, self.oy + (v - self.cv) * self.k)

    def pt2(self, u, v):
        return (self.ox + (u - self.cu) * self.k, self.oy + (v - self.cv) * self.k)

    def circle(self, cx, cy, z, r):
        """iso-projected circle: bounding box in design pixels"""
        cxp, cyp = self.pt(cx, cy, z)
        return (cxp - 1.2247 * r * self.k, cyp - 0.7071 * r * self.k,
                cxp + 1.2247 * r * self.k, cyp + 0.7071 * r * self.k)


# ---------------------------------------------------------------- shadow sprite
_SHADOW = None


def shadow_sprite():
    global _SHADOW
    if _SHADOW is None:
        s = Image.new("L", (256, 128), 0)
        d = ImageDraw.Draw(s)
        d.ellipse((26, 30, 230, 98), fill=110)
        _SHADOW = s.filter(ImageFilter.GaussianBlur(16))
    return _SHADOW


class C:
    def __init__(self, W=1920, H=1080, S=2, bg=PAPER):
        self.S, self.W, self.H, self.bg = S, W, H, bg
        self.img = Image.new("RGB", (W * S, H * S), hx(bg))
        self.d = ImageDraw.Draw(self.img)

    # ---- primitives (design px in, supersampled out)
    def _s(self, pts):
        S = self.S
        return [(x * S, y * S) for x, y in pts]

    def poly(self, pts, fill=None, outline=None, width=1.0):
        p = self._s(pts)
        if len(p) < 3:
            return
        if fill is None and outline is not None:
            self.d.line(p + [p[0]], fill=hx(outline), width=max(1, int(round(width * self.S))), joint="curve")
            return
        self.d.polygon(p, fill=hx(fill))
        if outline:
            self.d.line(p + [p[0]], fill=hx(outline), width=max(1, int(round(width * self.S))), joint="curve")

    def line(self, pts, color, width=2.0, dash=None, gap=None, cap="butt"):
        S = self.S
        col = hx(color)
        w = max(1, int(round(width * S)))
        if dash:
            pts = self._dash(pts, dash, gap or dash * 0.75)
        if len(pts) < 2:
            return
        p = self._s(pts)
        self.d.line(p, fill=col, width=w, joint="curve")
        if cap == "round" and not dash:
            for q in (p[0], p[-1]):
                r = w / 2
                self.d.ellipse((q[0] - r, q[1] - r, q[0] + r, q[1] + r), fill=col)

    def _dash(self, pts, dash, gap):
        dense = [pts[0]]
        for i in range(1, len(pts)):
            a, b = pts[i - 1], pts[i]
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            n = max(1, int(L / 2))
            for k in range(1, n + 1):
                dense.append((lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)))
        res, cur, on, left = [], [dense[0]], True, dash
        for i in range(1, len(dense)):
            a, b = dense[i - 1], dense[i]
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            if on:
                cur.append(b)
            left -= L
            if left <= 0:
                if on:
                    res.append(cur)
                    cur = []
                on = not on
                left = dash if on else gap
                if on:
                    cur = [b]
        if on and len(cur) > 1:
            res.append(cur)
        flat = []
        for p in res:
            flat.extend(p)
        return flat

    def rect(self, x0, y0, x1, y1, fill=None, outline=None, width=1.0):
        S = self.S
        self.d.rectangle((x0 * S, y0 * S, x1 * S, y1 * S), fill=hx(fill) if fill else None,
                         outline=hx(outline) if outline else None,
                         width=max(1, int(round(width * S))))

    def rrect(self, x0, y0, x1, y1, r, fill=None, outline=None, width=1.0):
        S = self.S
        self.d.rounded_rectangle((x0 * S, y0 * S, x1 * S, y1 * S), radius=r * S,
                                 fill=hx(fill) if fill else None,
                                 outline=hx(outline) if outline else None,
                                 width=max(1, int(round(width * S))))

    def ellipse(self, cx, cy, rx, ry, fill=None, outline=None, width=1.0):
        S = self.S
        self.d.ellipse(((cx - rx) * S, (cy - ry) * S, (cx + rx) * S, (cy + ry) * S),
                       fill=hx(fill) if fill else None,
                       outline=hx(outline) if outline else None,
                       width=max(1, int(round(width * S))))

    def arc(self, cx, cy, rx, ry, a0, a1, color, width=2.0):
        S = self.S
        self.d.arc(((cx - rx) * S, (cy - ry) * S, (cx + rx) * S, (cy + ry) * S), a0, a1,
                   fill=hx(color), width=max(1, int(round(width * S))))

    # ---- text
    def measure(self, s, px, family="inter", weight=700, tracking=0.0):
        f = font(family, weight, px, self.S)
        if not s:
            return 0.0
        S = self.S
        w = sum(self.d.textlength(ch, font=f) for ch in s) / S
        return w + tracking * max(0, len(s) - 1)

    def text(self, x, y, s, px, color, family="inter", weight=700, anchor="ls", tracking=0.0):
        S = self.S
        f = font(family, weight, px, S)
        col = hx(color)
        w = self.measure(s, px, family, weight, tracking)
        if anchor[0] == "m":
            cx = x - w / 2
        elif anchor[0] == "r":
            cx = x - w
        else:
            cx = x
        bbox = self.d.textbbox((0, 0), "Hx", font=f)
        asc, desc = bbox[1], bbox[3]
        if anchor[1] == "m":
            by = y - (asc + desc) / 2 / S - (px * 0.02)
        elif anchor[1] == "t":
            by = y - asc / S
        elif anchor[1] == "c":
            by = y + (asc + desc) / 2 / S
        else:
            by = y
        py = by * S
        if tracking == 0:
            self.d.text((cx * S, py), s, font=f, fill=col)
        else:
            for ch in s:
                self.d.text((cx * S, py), ch, font=f, fill=col)
                cx += (self.d.textlength(ch, font=f) / S) + tracking
        return w

    # ---- shadow under a world footprint
    def shadow(self, cam, cx, cy, r, strength=0.55, spread=1.0, dy=0.0):
        x0, y0, x1, y1 = cam.circle(cx, cy, 0, r * spread)
        w, h = max(4, int(x1 - x0)), max(4, int(y1 - y0))
        sp = shadow_sprite().resize((w * self.S, h * self.S), Image.LANCZOS)
        if strength <= 0.01:
            return
        if strength < 1:
            sp = sp.point(lambda v: int(v * strength))
        self.img.paste((16, 14, 22), (int(x0 * self.S), int((y0 + dy) * self.S)), sp)

    def out(self):
        return self.img.resize((self.W, self.H), Image.LANCZOS)


# ---------------------------------------------------------------- iso solids
def box(c, cam, x, y, z, w, d, h, base, shadow=True, shade=True, edge=None):
    if shadow:
        c.shadow(cam, x + w / 2, y + d / 2, max(w, d) * 0.55, 0.55)
    p = cam.pt
    A = p(x, y, z + h); B = p(x + w, y, z + h); Cc = p(x + w, y + d, z + h); D = p(x, y + d, z + h)
    a = p(x, y, z); b = p(x + w, y, z); cc = p(x + w, y + d, z); dd = p(x, y + d, z)
    top = tone(base, "top") if shade else base
    lf = tone(base, "left") if shade else base
    rt = tone(base, "right") if shade else base
    c.poly([D, Cc, cc, dd], fill=lf)
    c.poly([Cc, B, b, cc], fill=rt)
    c.poly([A, B, Cc, D], fill=top)
    if edge:
        c.line([A, B, Cc, D, A], edge, 1.0)
        c.line([Cc, cc], edge, 1.0)
        c.line([B, b], edge, 1.0)


def cyl(c, cam, cx, cy, z, r, h, base, shadow=True, rings=0):
    if shadow:
        c.shadow(cam, cx, cy, r * 1.1, 0.5)
    t = tone(base, "top"); l = tone(base, "left"); dk = tone(base, "right")
    cx0, cy0 = cam.pt(cx, cy, z + h)
    cx1, cy1 = cam.pt(cx, cy, z)
    rx, ry = 1.2247 * r * cam.k, 0.7071 * r * cam.k
    N = 40

    def ell(ox, oy, a0, a1):
        return [(ox + rx * math.cos(a0 + (a1 - a0) * i / N), oy + ry * math.sin(a0 + (a1 - a0) * i / N))
                for i in range(N + 1)]

    bt = ell(cx0, cy0, 0, math.pi)
    bb = ell(cx1, cy1, math.pi, 0)
    c.poly(bt + bb, fill=l)
    rtop = ell(cx0, cy0, 0, math.pi / 2)
    rbot = ell(cx1, cy1, math.pi / 2, 0)
    c.poly(rtop + rbot, fill=dk)
    c.ellipse(cx0, cy0, rx, ry, fill=t)
    for i in range(rings):
        zz = z + h * (i + 1) / (rings + 1)
        qx, qy = cam.pt(cx, cy, zz)
        c.arc(qx, qy, rx, ry, 0, 180, mix(base, DARKMIX, 0.16), 1.6)


def cube_packet(c, cam, x, y, z, s, color):
    box(c, cam, x - s / 2, y - s / 2, z, s, s, s, color, shadow=False)
    return cam.pt(x, y, z + s)


def curve_pts(a, b, bow=(0.0, 0.0), n=24):
    mx = (a[0] + b[0]) / 2 + bow[0]
    my = (a[1] + b[1]) / 2 + bow[1]
    out = []
    for i in range(n + 1):
        t = i / n
        out.append(((1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mx + t * t * b[0],
                    (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * my + t * t * b[1]))
    return out


def point_on(pts, t):
    if t <= 0:
        return pts[0]
    if t >= 1:
        return pts[-1]
    L = [math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) for i in range(len(pts) - 1)]
    tot = sum(L)
    if tot == 0:
        return pts[0]
    target = t * tot
    acc = 0
    for i, l in enumerate(L):
        if acc + l >= target:
            u = (target - acc) / l if l else 0
            return (lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u))
        acc += l
    return pts[-1]


# ---------------------------------------------------------------- layers
class Layer(C):
    """transparent layer: draw in it, then blit onto the frame with an alpha"""

    def __init__(self, W=1920, H=1080, S=2):
        self.S, self.W, self.H = S, W, H
        self.bg = None
        self.img = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)


def blit(dst, src, alpha=1.0, dy=0.0):
    if alpha <= 0.004:
        return
    img = src.img
    if alpha < 0.999:
        a = img.getchannel("A").point(lambda v: int(v * alpha))
        img = img.copy()
        img.putalpha(a)
    if dy:
        canvas = Image.new("RGBA", dst.img.size, (0, 0, 0, 0))
        canvas.paste(img, (0, int(dy * dst.S)))
        img = canvas
    dst.img.paste(img, (0, 0), img)
