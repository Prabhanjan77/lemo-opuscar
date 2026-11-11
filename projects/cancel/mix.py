"""Score, foley and the final mix.

Every cue is in film time (seconds) and the picture is cut to the same numbers:
120 BPM, one beat = 0.5 s.  Writes out/mix.wav (+ three check stems).

  python mix.py
"""
import json, math, os
import numpy as np
from scipy import signal as sg
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
DUR = 120.0
rng = np.random.default_rng(7)


# ------------------------------------------------------------------ basics
def t_(d):
    return np.arange(int(round(d * SR))) / SR


def bp(x, lo, hi, o=2):
    return sg.sosfilt(sg.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp(x, f, o=2):
    return sg.sosfilt(sg.butter(o, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, o=2):
    return sg.sosfilt(sg.butter(o, f, 'high', fs=SR, output='sos'), x)


def noise(d):
    return rng.standard_normal(int(round(d * SR)))


def norm(x, p=1.0):
    m = np.abs(x).max()
    return x * (p / m) if m > 0 else x


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ------------------------------------------------------------------ voices
def note(f, d, kind="soft", detune=0.0):
    tt = t_(d)
    f = f * (1 + detune)
    if kind == "soft":                       # kalimba / marimba
        x = (np.sin(2 * np.pi * f * tt) +
             0.35 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt / 0.05) +
             0.12 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt / 0.02))
        e = np.exp(-tt / (d * 0.45)) * np.minimum(1, tt / 0.004)
    elif kind == "pad":
        x = np.zeros_like(tt)
        for m, g in ((1, 1.0), (2, 0.45), (3, 0.22), (4, 0.10), (5, 0.05)):
            x += g * np.sin(2 * np.pi * f * m * tt + m * 0.7)
        x = x * (1 + 0.12 * np.sin(2 * np.pi * 0.7 * tt))
        e = np.clip(np.minimum(1, tt / 0.5) * np.minimum(1, (d - tt) / 0.6), 0, 1)
    elif kind == "bass":
        x = (np.sin(2 * np.pi * f * tt) + 0.28 * np.sin(2 * np.pi * 2 * f * tt) +
             0.12 * np.sin(2 * np.pi * 3 * f * tt))
        e = np.exp(-tt / (d * 0.5)) * np.minimum(1, tt / 0.006)
    elif kind == "bell":
        x = sum(g * np.sin(2 * np.pi * f * m * tt) for m, g in ((1, 1.0), (2.76, 0.4), (5.4, 0.2)))
        e = np.exp(-tt / (d * 0.35)) * np.minimum(1, tt / 0.003)
    elif kind == "pluck":
        x = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.12) +
             0.25 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / 0.06))
        e = np.exp(-tt / (d * 0.35)) * np.minimum(1, tt / 0.003)
    else:
        x = np.sin(2 * np.pi * f * tt)
        e = np.exp(-tt / (d * 0.5))
    return norm(x * e)


# ------------------------------------------------------------------ foley
def click(pitch=1.0, v=1.0, d=0.045):
    tt = t_(d)
    x = hp(noise(d), 1800 * pitch) * np.exp(-tt / 0.004) * 0.8
    x += np.sin(2 * np.pi * 2400 * pitch * tt) * np.exp(-tt / 0.006) * 0.4
    return norm(x) * v


def key_tick(v=1.0, pitch=1.0):
    tt = t_(0.05)
    x = bp(noise(0.05), 900 * pitch, 5200 * pitch) * np.exp(-tt / 0.008)
    x += np.sin(2 * np.pi * 180 * pitch * tt) * np.exp(-tt / 0.02) * 0.35
    return norm(x) * v


def whoosh(d=0.4, v=1.0, lo=400, hi=4200):
    tt = t_(d)
    mod = np.sin(np.pi * tt / d) ** 2
    a = bp(noise(d), lo, hi * 0.5) * (1 - tt / d)
    b = bp(noise(d), hi * 0.4, hi) * (tt / d)
    return norm((a * 0.6 + b * 0.7) * mod) * v


def thump(v=1.0, f=62, d=0.5):
    tt = t_(d)
    x = np.sin(2 * np.pi * f * tt * (1 - 0.35 * tt / d)) * np.exp(-tt / (d * 0.32))
    x += lp(noise(d), 260) * np.exp(-tt / 0.02) * 0.35
    return norm(x) * v


def sub_hit(v=1.0, f=48):
    tt = t_(0.9)
    return norm(np.sin(2 * np.pi * f * tt * (1 - 0.15 * tt)) * np.exp(-tt / 0.35)) * v


def chirp(f0=880, f1=1320, d=0.12, v=1.0):
    tt = t_(d)
    f = np.linspace(f0, f1, len(tt))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (d * 0.6)) * np.minimum(1, tt / 0.004)
    return norm(x) * v


def blip(f=1320, d=0.09, v=1.0):
    tt = t_(d)
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / (d * 0.4))
    x += 0.3 * np.sin(2 * np.pi * f * 2.01 * tt) * np.exp(-tt / (d * 0.3))
    return norm(x) * v


def ding(f=1568, d=1.2, v=1.0):
    tt = t_(d)
    x = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.01 * tt) * np.exp(-tt / 0.3) +
         0.25 * np.sin(2 * np.pi * f * 3.0 * tt) * np.exp(-tt / 0.15))
    return norm(x * np.exp(-tt / (d * 0.4)) * np.minimum(1, tt / 0.003)) * v


def err(f=392, d=0.30, v=1.0):
    tt = t_(d)
    x = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 1.47 * tt)) * np.exp(-tt / (d * 0.4))
    x *= (1 - 0.3 * np.sign(np.sin(2 * np.pi * 22 * tt)))
    return norm(x) * v


def crunch(d=0.4, v=1.0):
    tt = t_(d)
    x = bp(noise(d), 300, 2400) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * tt) ** 2)
    x *= np.exp(-tt / (d * 0.5)) * np.minimum(1, tt / 0.01)
    return norm(x) * v


def riser(d=1.4, v=1.0, f0=220, f1=880):
    tt = t_(d)
    f = f0 * (f1 / f0) ** (tt / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5
    nz = bp(noise(d), 400, 6000) * 0.5
    return norm((tone + nz) * (tt / d) ** 2) * v


def paper(d=0.25, v=1.0):
    tt = t_(d)
    x = hp(noise(d), 3000) * (0.6 + 0.4 * rng.random(len(tt))) * np.exp(-tt / (d * 0.4))
    return norm(x) * v


# ------------------------------------------------------------------ score
def music_T():
    n = int(DUR * SR)
    L = np.zeros(n)
    R = np.zeros(n)

    def put(x, at, g=1.0, pan=0.0):
        i = int(at * SR)
        if i >= n:
            return
        m = min(len(x), n - i)
        L[i:i + m] += x[:m] * g * math.cos((pan + 1) * math.pi / 4) * 1.414
        R[i:i + m] += x[:m] * g * math.sin((pan + 1) * math.pi / 4) * 1.414

    beat = 0.5

    def pulse_level(tt):
        if tt < 12.6:
            return 0.22
        if tt < 27.6:
            return 0.16
        if tt < 40:
            return 0.0
        if tt < 53.2:
            return 0.30
        if tt < 66.8:
            return 0.16
        if tt < 80.8:
            return 0.26
        if tt < 96.2:
            return 0.0
        if tt < 107:
            return 0.34
        return 0.10

    tt = 0.0
    while tt < DUR:
        lv = pulse_level(tt)
        if lv > 0.001:
            put(thump(0.5, 58, 0.30), tt, 0.55 * lv)
            if abs((tt / beat) % 1.0) < 0.01:
                put(click(1.6, 0.35, 0.03), tt, 0.25 * lv, pan=0.2)
        tt = round(tt + beat / 2, 3)

    chords = [
        (0.0, 12.6, [50, 57, 62, 65], 0.09),
        (12.6, 24.0, [50, 57, 62, 65], 0.10),
        (24.0, 27.6, [50, 57, 62, 65], 0.06),
        (29.4, 40.0, [55, 62, 66, 69], 0.09),
        (40.0, 53.2, [55, 62, 66, 69], 0.08),
        (53.2, 66.8, [53, 60, 65, 68], 0.08),
        (66.8, 80.8, [48, 55, 60, 63], 0.10),
        (80.8, 96.2, [53, 60, 65, 68], 0.09),
        (96.2, 107.0, [50, 57, 62, 67], 0.11),
        (107.0, 119.0, [52, 59, 64, 69], 0.12),
    ]
    for a, b, ns, g in chords:
        d = b - a + 0.8
        for k, m in enumerate(ns):
            put(note(midi(m - 12 if k == 0 else m), d, "pad"), a, g, pan=(k - 1.5) * 0.25)

    roots = [(0.0, 12.6, 38), (12.6, 27.6, 38), (29.4, 40.0, 43), (40.0, 53.2, 43),
             (53.2, 66.8, 41), (66.8, 80.8, 36), (80.8, 96.2, 41), (96.2, 107.0, 38),
             (107.0, 116.0, 40)]
    for a, b, m in roots:
        put(note(midi(m), b - a + 0.5, "bass"), a, 0.13)

    # kalimba motif, opening and return
    for rep in range(3):
        for bt, m in [(3.0, 74), (3.5, 77), (4.0, 81), (4.5, 79), (5.0, 74)]:
            at = bt + rep * 2.5
            if at < 12.0:
                put(note(midi(m), 1.2, "soft"), at, 0.11, pan=-0.2)
    for bt, m in [(107.6, 74), (108.1, 77), (108.6, 81), (109.1, 79), (109.6, 74),
                  (110.1, 76), (110.6, 79), (111.1, 83)]:
        put(note(midi(m), 1.6, "soft"), bt, 0.10, pan=0.15)

    # arpeggio through the architecture chapter
    arp = [62, 66, 69, 74, 69, 66]
    at, i = 40.4, 0
    while at < 53.0:
        put(note(midi(arp[i % len(arp)]), 0.9, "pluck"), at, 0.075, pan=0.25 * math.sin(i))
        at += 0.25
        i += 1

    # the loop chapter: a figure that tightens
    at, i = 67.0, 0
    while at < 79.4:
        step = 0.5 if at < 72.0 else (0.25 if at < 76.0 else 0.5)
        put(note(midi([60, 63, 67, 70, 67, 63][i % 6]), 0.5, "pluck"), at, 0.085)
        at += step
        i += 1

    # the fix and the resolution
    at, i = 96.4, 0
    for m in [62, 67, 69, 74, 69, 67, 74, 79]:
        put(note(midi(m), 1.0, "pluck"), at, 0.09, pan=0.2 * math.sin(i))
        at += 0.5
        i += 1
    for m in (62, 67, 69, 74, 79):
        put(note(midi(m), 2.6, "bell"), 107.2, 0.055)
    put(note(midi(50), 2.2, "bass"), 107.2, 0.12)
    put(note(midi(69), 6.0, "pad"), 111.0, 0.10)
    return np.stack([L, R], 1)


# ------------------------------------------------------------------ foley
def foley_T():
    b = np.zeros((int(DUR * SR), 2))

    def add(x, at, gain=1.0, pan=0.0):
        i = int(round(at * SR))
        if i >= len(b):
            return
        m = min(len(x), len(b) - i)
        l = math.cos((pan + 1) * math.pi / 4) * 1.414
        r = math.sin((pan + 1) * math.pi / 4) * 1.414
        b[i:i + m, 0] += x[:m] * gain * min(1.35, l)
        b[i:i + m, 1] += x[:m] * gain * min(1.35, r)

    # scene 1
    add(paper(0.3, 0.5), 0.02, 0.30, -0.5)
    for i in range(7):
        add(key_tick(0.5, 1.0 + 0.1 * i), 0.9 + i * 0.19, 0.16, 0.25)
    add(whoosh(0.45, 0.5), 1.5, 0.30, -0.3)
    add(blip(1046, 0.10, 0.6), 2.75, 0.16, 0.2)
    add(click(1.0, 0.5, 0.06), 6.12, 0.34, 0.1)
    add(whoosh(0.5, 0.35, 200, 1200), 6.15, 0.22, 0.1)
    add(thump(0.7, 70, 0.4), 7.15, 0.34, 0.0)
    add(thump(0.55, 80, 0.35), 8.92, 0.24, 0.0)
    add(click(1.2, 0.3, 0.05), 9.45, 0.16, 0.3)
    # scene 2
    add(sub_hit(0.9, 44), 12.6, 0.55, 0.0)
    add(crunch(0.45, 0.5), 12.68, 0.28, 0.0)
    add(thump(0.6, 90, 0.25), 13.6, 0.22, -0.2)
    for i in range(7):
        add(whoosh(0.3, 0.30, 800, 5000), 14.6 + i * 0.85, 0.13, -0.3 + 0.1 * i)
    for at, g in ((14.9, 0.5), (17.5, 0.6), (20.5, 0.75)):
        add(click(1.8, g, 0.04), at, 0.26, 0.4)
        add(blip(660 if at < 20 else 440, 0.08, 0.6), at, 0.14, 0.4)
    add(err(330, 0.5, 0.7), 20.5, 0.20, 0.35)
    add(whoosh(0.6, 0.4), 22.0, 0.20, 0.3)
    add(riser(1.0, 0.35, 300, 900), 25.6, 0.20, 0.0)
    # scene 3
    add(sub_hit(1.0, 40), 27.6, 0.70, 0.0)
    add(thump(0.6, 120, 0.25), 27.62, 0.22, 0.0)
    add(click(2.0, 0.35, 0.04), 28.9, 0.18, 0.2)
    add(blip(880, 0.12, 0.7), 31.0, 0.16, 0.0)
    add(blip(1320, 0.14, 0.6), 32.0, 0.13, 0.0)
    add(whoosh(0.5, 0.35), 33.4, 0.16, 0.0)
    add(whoosh(0.45, 0.3), 35.0, 0.14, 0.0)
    # scene 4
    add(sub_hit(0.5, 50), 40.0, 0.28, 0.0)
    for i, at in enumerate((40.9, 41.05, 41.2, 41.35)):
        add(thump(0.5, 70 - i * 4, 0.22), at, 0.20, -0.6 + i * 0.35)
        add(click(1.4, 0.3, 0.04), at + 0.02, 0.12, -0.6 + i * 0.35)
    add(whoosh(0.9, 0.45), 41.0, 0.22, -0.3)
    add(blip(1174, 0.1, 0.5), 43.9, 0.14, 0.0)
    add(crunch(0.35, 0.55), 45.0, 0.30, -0.4)
    for at in (45.5, 46.6, 48.2, 49.2):
        add(chirp(1400, 1900, 0.10, 0.5), at, 0.13, 0.0)
    add(click(1.6, 0.5, 0.05), 48.6, 0.20, 0.2)
    add(blip(660, 0.12, 0.6), 49.2, 0.16, 0.35)
    # scene 5
    add(sub_hit(0.6, 52), 53.2, 0.30, 0.0)
    for i in range(8):
        add(key_tick(0.6, 1.0 + 0.03 * i), 53.4 + i * 0.42, 0.20, 0.3 * math.sin(i))
    for at in (56.5, 58.8):
        add(blip(1318, 0.10, 0.5), at, 0.16, -0.35)
    add(err(294, 0.4, 0.6), 62.6, 0.22, 0.4)
    add(click(1.1, 0.4, 0.05), 60.0, 0.18, 0.0)
    add(blip(784, 0.16, 0.5), 59.9, 0.14, 0.4)
    # scene 6
    add(sub_hit(0.7, 44), 66.8, 0.42, 0.0)
    at, i = 67.2, 0
    while at < 79.4:
        add(click(2.0 + 0.2 * (i % 3), 0.35, 0.03), at, 0.14, 0.25)
        at += 0.30 if at < 72 else 0.20
        i += 1
    add(whoosh(0.8, 0.5, 200, 2600), 72.0, 0.26, 0.0)
    add(thump(0.8, 60, 0.4), 73.5, 0.34, 0.0)
    add(err(311, 0.5, 0.5), 69.4, 0.16, -0.2)
    add(click(1.3, 0.35, 0.04), 76.6, 0.18, 0.3)
    add(blip(1046, 0.12, 0.5), 77.0, 0.13, 0.3)
    # scene 7
    add(sub_hit(0.5, 50), 80.8, 0.24, 0.0)
    for i in range(10):
        add(click(2.2, 0.22, 0.025), 81.0 + i * 0.6, 0.12, 0.45)
    add(click(2.4, 0.3, 0.03), 86.6, 0.18, 0.45)
    add(err(262, 0.45, 0.6), 86.7, 0.18, 0.45)
    for at in (84.8, 87.0):
        add(chirp(1500, 900, 0.16, 0.5), at, 0.12, 0.0)
    add(whoosh(0.8, 0.4, 300, 3000), 89.6, 0.20, 0.0)
    add(thump(0.6, 64, 0.3), 89.6, 0.20, 0.0)
    # scene 8
    add(sub_hit(0.6, 46), 96.2, 0.34, 0.0)
    add(whoosh(0.9, 0.4), 96.4, 0.20, -0.3)
    add(crunch(0.3, 0.5), 101.0, 0.28, -0.4)
    for at in (101.0, 102.1, 103.0):
        add(chirp(1300, 1900, 0.09, 0.5), at, 0.12, 0.0)
    add(click(1.9, 0.4, 0.04), 103.6, 0.20, 0.4)
    add(blip(880, 0.12, 0.5), 105.6, 0.14, 0.4)
    add(ding(1568, 1.6, 0.5), 105.2, 0.22, 0.3)
    add(ding(2093, 1.4, 0.35), 105.28, 0.12, 0.3)
    # scene 9
    add(whoosh(0.8, 0.3, 300, 2000), 107.0, 0.16, 0.0)
    for at, g in ((107.4, 0.25), (108.6, 0.2), (109.6, 0.2)):
        add(click(1.6, g, 0.05), at, 0.14, -0.2)
        add(thump(0.4, 80, 0.25), at, 0.10, -0.2)
    add(thump(0.7, 55, 0.4), 114.0, 0.24, 0.0)
    return b


# ------------------------------------------------------------------ voice
def compress(x, thr=0.12, ratio=3.0, att=0.004, rel=0.10):
    env = np.abs(x)
    a_rel = math.exp(-1 / (rel * SR))
    e = np.empty_like(env)
    g = 0.0
    blk = 256
    for i in range(0, len(env), blk):
        target = env[i:i + blk].max()
        g = target if target > g else g * a_rel + target * (1 - a_rel)
        level = max(g, 1e-6)
        gain = 1.0 if level < thr else (level / thr) ** (1 / ratio - 1)
        e[i:i + blk] = gain
    e = sg.sosfilt(sg.butter(2, 8, 'low', fs=SR, output='sos'), e)
    return x * e


def voice_T():
    n = int(DUR * SR)
    v = np.zeros(n)
    starts = json.load(open(os.path.join(HERE, "voice", "starts.json")))
    for k, at in starts.items():
        sr, x = wavfile.read(os.path.join(HERE, "voice", f"s{k}.wav"))
        x = x.astype(np.float32) / 32768.0
        if x.ndim > 1:
            x = x.mean(1)
        x = lp(hp(x, 70), 13000)
        x = compress(x)
        x = x + bp(x, 1800, 4800) * 0.12
        i = int(round(at * SR))
        m = min(len(x), n - i)
        v[i:i + m] += x[:m]
    return v


def main():
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    v = voice_T()
    m = music_T()
    f = foley_T()
    vs = v / (np.abs(v).max() + 1e-9)
    ms = m / (np.abs(m).max() + 1e-9)
    fs = f / (np.abs(f).max() + 1e-9)
    win = int(0.05 * SR)
    env = np.convolve(np.abs(vs), np.ones(win) / win, mode="same")
    duck = 1.0 / (1.0 + 6.0 * np.clip(env * 3.0, 0, 1))
    duck = sg.sosfilt(sg.butter(2, 3, 'low', fs=SR, output='sos'), duck)
    mix = vs[:, None] * 0.80 + ms * 0.13 * duck[:, None] + fs * 0.38
    mix = sg.sosfilt(sg.butter(2, 26, 'high', fs=SR, output='sos'), mix, axis=0)
    n = mix.shape[0]
    fade_in = np.clip(np.arange(n) / (2.2 * SR), 0, 1) ** 1.5
    out_at = int(119.2 * SR)
    fade_out = np.ones(n)
    fade_out[out_at:] = np.linspace(1, 0, n - out_at) ** 1.4
    mix *= fade_in[:, None] * fade_out[:, None]
    peak = np.abs(mix).max()
    mix = mix / peak * 0.92
    mix = np.tanh(mix * 1.15) / np.tanh(1.15)
    wavfile.write(os.path.join(HERE, "out", "mix.wav"), SR, (mix * 32767 * 0.94).astype(np.int16))
    wavfile.write(os.path.join(HERE, "out", "stem_voice.wav"), SR,
                  (vs * 0.8 / max(1e-9, np.abs(vs).max()) * 32767 * .8).astype(np.int16))
    wavfile.write(os.path.join(HERE, "out", "stem_music.wav"), SR,
                  (ms * 0.2 / max(1e-9, np.abs(ms).max()) * 32767 * .8).astype(np.int16))
    wavfile.write(os.path.join(HERE, "out", "stem_foley.wav"), SR,
                  (fs * 0.42 / max(1e-9, np.abs(fs).max()) * 32767 * .8).astype(np.int16))
    print("mix.wav", mix.shape)


if __name__ == "__main__":
    main()
