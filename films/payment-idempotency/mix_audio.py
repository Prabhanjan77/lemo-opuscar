#!/usr/bin/env python3
"""Build a self-contained voice + score + foley WAV for the film.

The voice clips are the selected English narration. The score is deliberately spare:
low pulse, centred violet bell notes, and procedural clicks / whooshes keyed to the
same cue times as the Canvas events. No downloaded music or stock audio is used.
"""
from pathlib import Path
import json
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

PROJECT = Path(__file__).resolve().parent
HERE = PROJECT.parent.parent
VOICE_DIR = PROJECT / "narration"
SR = 48000
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(2307)


def read_mono(path):
    x, rate = sf.read(path, always_2d=True, dtype="float32")
    x = x.mean(axis=1)
    if rate != SR:
        g = np.gcd(rate, SR)
        x = resample_poly(x, SR // g, rate // g).astype(np.float32)
    # remove only the recorder's leading/trailing silence; retain internal pauses
    nz = np.flatnonzero(np.abs(x) > 0.006)
    if len(nz): x = x[max(0, nz[0] - int(.05 * SR)): min(len(x), nz[-1] + int(.08 * SR) + 1)]
    return x


def add(buf, x, at, gain=1.0):
    i = int(round(at * SR)); j = min(N, i + len(x))
    if i < 0 or i >= N or j <= i: return
    buf[i:j] += x[:j-i] * gain


def env(n, attack=.01, release=.08):
    e = np.ones(n, dtype=np.float32)
    a = min(n, max(1, int(attack * SR))); r = min(n, max(1, int(release * SR)))
    e[:a] = np.linspace(0, 1, a, dtype=np.float32)
    e[-r:] *= np.linspace(1, 0, r, dtype=np.float32)
    return e


def tone(freq, seconds, gain=.1, kind="sine", bend=0):
    n = max(1, int(seconds * SR)); t = np.arange(n, dtype=np.float32) / SR
    f = freq * (1 + bend * np.linspace(0, 1, n, dtype=np.float32))
    phase = 2 * np.pi * np.cumsum(f) / SR
    if kind == "bell":
        y = np.sin(phase) + .33 * np.sin(phase * 2.01) + .12 * np.sin(phase * 3.98)
        y *= np.exp(-t * 4.2)
    elif kind == "sub":
        y = np.sin(phase) * np.exp(-t * 3.5)
    elif kind == "square":
        y = np.sign(np.sin(phase)) * .35
    else:
        y = np.sin(phase)
    return (y * env(n, .004, min(.2, seconds * .35)) * gain).astype(np.float32)


def noise_burst(seconds=.28, gain=.08, low=500, high=5000):
    n = max(1, int(seconds * SR)); x = rng.normal(0, 1, n).astype(np.float32)
    # two-pole-ish rolling average for a soft digital whoosh
    k = max(2, int(SR / high)); x = np.convolve(x, np.ones(k, dtype=np.float32) / k, mode="same")
    t = np.arange(n, dtype=np.float32) / SR
    e = np.exp(-t * 9) * (1 - np.exp(-t * 45))
    return (x * e * gain).astype(np.float32)


def add_short(*xs):
    n = max(len(x) for x in xs); y = np.zeros(n, dtype=np.float32)
    for x in xs: y[:len(x)] += x
    return y


def click(gain=.12):
    return add_short(tone(1850, .075, gain, kind="bell"), tone(3700, .035, gain * .35, kind="sine"))


def whoosh(gain=.08): return add_short(noise_burst(.32, gain), tone(100, .24, gain * .55, kind="sub", bend=1.2))

def thump(gain=.14): return add_short(tone(68, .22, gain, kind="sub"), tone(185, .12, gain * .32, kind="bell"))

def chime(gain=.10): return add_short(tone(523.25, .38, gain, kind="bell"), tone(783.99, .28, gain * .48, kind="bell"))

voice = np.zeros(N, dtype=np.float32)
scene_starts = [0.0, 9.64, 17.52, 26.84, 37.32, 46.28]
voice_meta = []
for i, start in enumerate(scene_starts, 1):
    p = VOICE_DIR / f"scene0{i}.wav"
    x = read_mono(p)
    add(voice, x, start, .78)
    voice_meta.append({"id": f"scene0{i}", "start": start, "duration": round(len(x) / SR, 3), "file": str(p.relative_to(HERE))})

music = np.zeros(N, dtype=np.float32)
# Nearly inaudible machine-room bed. It is centred and low so the consonants stay clean.
t = np.arange(N, dtype=np.float32) / SR
music += (np.sin(2 * np.pi * 54 * t) * .012 + np.sin(2 * np.pi * 81 * t) * .006).astype(np.float32)
# Violet motif: one note per beat, slightly subtractive at the race, resolves green.
bpm = 96.0; beat = 60.0 / bpm
notes = [220.0, 261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63]
for k in range(int(DUR / beat) + 1):
    at = k * beat
    if 43 <= at < 53 and k % 2: continue
    freq = notes[k % len(notes)]
    add(music, tone(freq, .20 if at < 53 else .34, .028 if at < 53 else .042, kind="bell"), at)
# A thin tension pulse in the concurrency section.
for at in np.arange(43.0, 53.0, beat / 2): add(music, tone(96, .09, .026, kind="sub"), float(at))

foley = np.zeros(N, dtype=np.float32)
for at in (2.25, 3.10): add(foley, click(.17), at)
for at in (3.45, 3.92, 53.3): add(foley, whoosh(.10), at)
for at in (10.82, 11.34, 30.55): add(foley, thump(.18), at)
for at in (13.15, 14.0, 15.32, 47.35): add(foley, click(.13), at)
add(foley, chime(.11), 17.08)
for at in (20.0, 21.0, 24.0, 26.6, 28.0): add(foley, click(.09), at)
add(foley, chime(.12), 34.88)
for at in (37.84, 40.15, 45.8, 49.0, 51.35): add(foley, click(.08), at)
add(foley, chime(.17), 55.18)
add(foley, tone(880, .11, .06, kind="bell"), 56.0)

# Voice wins. Music and foley are mixed below the speech, then a conservative peak guard
# keeps the WAV safe for the library muxer's later loudnorm pass.
mix = voice + music * .56 + foley * .72
peak = float(np.max(np.abs(mix))) or 1.0
if peak > .92: mix *= .92 / peak
# Gentle final fade prevents a hard edge at exactly 60 s.
fade = int(.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)

out = PROJECT / "mix.wav"
sf.write(out, mix.astype(np.float32), SR, subtype="PCM_16")
# Browser preview can use the same file; a small manifest makes durations inspectable without ffprobe.
(PROJECT / "audio_manifest.json").write_text(json.dumps({"sample_rate": SR, "duration": DUR, "voice": voice_meta, "notes": "Generated procedural score and foley; no stock audio."}, indent=2) + "\n")
print(out)
print(json.dumps(voice_meta, indent=2))
