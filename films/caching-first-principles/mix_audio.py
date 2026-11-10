#!/usr/bin/env python3
"""Build a self-contained 30-second voice, score, and foley WAV.

Voice clips are the selected masculine en-IN narration generated for this sample.
The build creates narration/processed/* with a pitch-preserving 1.08x atempo pass;
this mixer keeps the original generated files untouched and records both paths.
"""
from pathlib import Path
import json
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

PROJECT = Path(__file__).resolve().parent
HERE = PROJECT.parent.parent
VOICE_DIR = PROJECT / "narration"
PROCESSED_DIR = VOICE_DIR / "processed"
SR = 48000
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(131110)


def read_mono(path):
    x, rate = sf.read(path, always_2d=True, dtype="float32")
    x = x.mean(axis=1)
    if rate != SR:
        g = np.gcd(rate, SR)
        x = resample_poly(x, SR // g, rate // g).astype(np.float32)
    nz = np.flatnonzero(np.abs(x) > 0.006)
    if len(nz): x = x[max(0, nz[0] - int(.04 * SR)): min(len(x), nz[-1] + int(.06 * SR) + 1)]
    return x


def add(buf, x, at, gain=1.0):
    i = int(round(at * SR)); j = min(N, i + len(x))
    if i < 0 or i >= N or j <= i: return
    buf[i:j] += x[:j - i] * gain


def env(n, attack=.008, release=.08):
    e = np.ones(n, dtype=np.float32); a = min(n, max(1, int(attack * SR))); r = min(n, max(1, int(release * SR)))
    e[:a] = np.linspace(0, 1, a, dtype=np.float32); e[-r:] *= np.linspace(1, 0, r, dtype=np.float32); return e


def tone(freq, seconds, gain=.1, kind="sine", bend=0):
    n = max(1, int(seconds * SR)); tt = np.arange(n, dtype=np.float32) / SR; f = freq * (1 + bend * np.linspace(0, 1, n, dtype=np.float32)); phase = 2 * np.pi * np.cumsum(f) / SR
    if kind == "bell": y = np.sin(phase) + .30 * np.sin(phase * 2.01) + .10 * np.sin(phase * 3.98); y *= np.exp(-tt * 4.2)
    elif kind == "sub": y = np.sin(phase) * np.exp(-tt * 3.5)
    elif kind == "square": y = np.sign(np.sin(phase)) * .35
    else: y = np.sin(phase)
    return (y * env(n, .004, min(.2, seconds * .35)) * gain).astype(np.float32)


def noise_burst(seconds=.28, gain=.08):
    n = max(1, int(seconds * SR)); x = rng.normal(0, 1, n).astype(np.float32); k = max(2, int(SR / 5000)); x = np.convolve(x, np.ones(k, dtype=np.float32) / k, mode="same"); tt = np.arange(n, dtype=np.float32) / SR; e = np.exp(-tt * 9) * (1 - np.exp(-tt * 45)); return (x * e * gain).astype(np.float32)


def add_short(*xs):
    n = max(len(x) for x in xs); y = np.zeros(n, dtype=np.float32)
    for x in xs: y[:len(x)] += x
    return y


def click(gain=.12): return add_short(tone(1850, .075, gain, "bell"), tone(3700, .035, gain * .33))
def whoosh(gain=.08): return add_short(noise_burst(.32, gain), tone(100, .24, gain * .55, "sub", 1.2))
def thump(gain=.14): return add_short(tone(68, .22, gain, "sub"), tone(185, .12, gain * .32, "bell"))
def chime(gain=.10): return add_short(tone(523.25, .38, gain, "bell"), tone(783.99, .28, gain * .48, "bell"))

voice = np.zeros(N, dtype=np.float32)
starts = [0.0, 3.96, 10.89, 17.67, 23.56]
voice_meta = []
for i, start in enumerate(starts, 1):
    processed = PROCESSED_DIR / f"scene0{i}.wav"
    original = VOICE_DIR / f"scene0{i}.wav"
    p = processed if processed.exists() else original
    x = read_mono(p)
    add(voice, x, start, .82)
    voice_meta.append({"id": f"scene0{i}", "start": start, "duration": round(len(x) / SR, 3), "file": str(p.relative_to(HERE)), "source": str(original.relative_to(HERE))})

music = np.zeros(N, dtype=np.float32)
t = np.arange(N, dtype=np.float32) / SR
music += (np.sin(2 * np.pi * 54 * t) * .010 + np.sin(2 * np.pi * 81 * t) * .005).astype(np.float32)
bpm = 96.0; beat = 60.0 / bpm; notes = [220.0, 261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63]
for k in range(int(DUR / beat) + 1):
    at = k * beat; f = notes[k % len(notes)]; gain = .020 if at < 19 else .030
    add(music, tone(f, .18 if at < 25 else .28, gain, "bell"), at)
for at in np.arange(4.3, 11.8, beat / 2): add(music, tone(94, .075, .018, "sub"), float(at))

foley = np.zeros(N, dtype=np.float32)
for at in (1.65, 2.25, 4.3, 12.0): add(foley, click(.12), at)
for at in (2.55, 4.28, 11.8, 19.1, 25.5, 29.55): add(foley, whoosh(.075), at)
for at in (5.4, 6.2, 7.15, 14.05, 15.05): add(foley, thump(.12), at)
for at in (8.5, 12.6, 20.25, 26.85, 28.4): add(foley, click(.085), at)
add(foley, chime(.13), 16.0); add(foley, chime(.16), 20.85); add(foley, chime(.14), 29.6)

mix = voice + music * .64 + foley * .78
peak = float(np.max(np.abs(mix))) or 1.0
if peak > .92: mix *= .92 / peak
fade = int(.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)

out = PROJECT / "mix.wav"
sf.write(out, mix.astype(np.float32), SR, subtype="PCM_16")
(PROJECT / "audio_manifest.json").write_text(json.dumps({"sample_rate": SR, "duration": DUR, "voice_speed": 1.08, "voice": voice_meta, "notes": "Generated procedural score and foley; no stock audio."}, indent=2) + "\n")
print(out)
print(json.dumps(voice_meta, indent=2))
