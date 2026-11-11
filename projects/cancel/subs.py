"""Subtitle cues from the recorded narration.

Each voice line is one take, so word timings come from the audio itself:
silences inside a line are candidate split points, and each caption boundary
snaps to the nearest one to its proportional estimate.
"""
import json, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000

CAPTIONS = {
    1: ["Imagine you start generating a report,",
        "but close the browser before it finishes.",
        "You might assume the server stops working too.",
        "But often, it doesn't."],
    2: ["The client connection is gone.",
        "But the application may still be executing code,",
        "holding a database connection,",
        "or running an expensive query that nobody needs anymore."],
    3: ["That's where cancellation comes in.",
        "Instead of assuming work stops automatically,",
        "the application needs a way to communicate",
        "that the result is no longer required."],
    4: ["When the client disconnects,",
        "the server can detect that signal.",
        "It can pass cancellation through the service layer,",
        "and into supported database operations,",
        "allowing unnecessary work to stop."],
    5: ["Cancellation is cooperative.",
        "Your code checks whether the operation was cancelled,",
        "and supported asynchronous operations receive the same signal.",
        "It isn't a magic switch that instantly kills every task."],
    6: ["But there's a catch.",
        "If your code never checks for cancellation,",
        "or calls a library that doesn't support it,",
        "the work may continue anyway.",
        "That's why cancellation must be handled deliberately."],
    7: ["A timeout is related, but different.",
        "Cancellation may happen because the client leaves.",
        "A timeout happens because a deadline is reached.",
        "Both are useful, but neither",
        "guarantees an operation stops immediately."],
    8: ["The correct design propagates cancellation through the request,",
        "checks it during long-running work,",
        "and releases resources when operations end."],
    9: ["Remember: a disconnected client",
        "doesn't always mean cancelled work.",
        "Make cancellation an explicit part of your backend design."],
}

START = {1: 0.30, 2: 12.60, 3: 27.60, 4: 40.00, 5: 53.20,
         6: 66.80, 7: 80.80, 8: 96.20, 9: 107.00}


def read_wav(path):
    with wave.open(path, "rb") as w:
        n = w.getnframes()
        return np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768.0


def pauses(x, win=0.01, thr_db=-42, min_gap=0.13):
    hop = int(SR * win)
    n = len(x) // hop
    e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(e + 1e-9)
    voiced = db > thr_db
    first, last = 0, n - 1
    while first < n and not voiced[first]:
        first += 1
    while last >= 0 and not voiced[last]:
        last -= 1
    out = []
    i = first
    while i <= last:
        if not voiced[i]:
            j = i
            while j <= last and not voiced[j]:
                j += 1
            if (j - i) * win >= min_gap:
                out.append((i + j) / 2 * win)
            i = j
        else:
            i += 1
    return out, (first * win, (last + 1) * win)


def main():
    cues = []
    for k in sorted(CAPTIONS):
        x = read_wav(os.path.join(HERE, "voice", f"s{k}.wav"))
        d = len(x) / SR
        sil, (v0, v1) = pauses(x)
        lines = CAPTIONS[k]
        wt = np.array([max(6, len(s)) for s in lines], dtype=float)
        cum = np.cumsum(wt) / wt.sum()
        bounds = []
        for i in range(len(lines) - 1):
            est = v0 + (v1 - v0) * cum[i]
            if sil:
                best = min(sil, key=lambda s: abs(s - est))
                if abs(best - est) < 0.75:
                    est = best
            bounds.append(est)
        bounds = [0.0] + bounds + [d]
        for i, s in enumerate(lines):
            t0 = START[k] + bounds[i] - (0.06 if i else 0.0)
            t1 = START[k] + bounds[i + 1] + (0.10 if i == len(lines) - 1 else 0.02)
            cues.append({"t0": round(max(0, t0), 3), "t1": round(t1, 3), "text": s})
    json.dump(cues, open(os.path.join(HERE, "subs.json"), "w"), indent=1)
    for c in cues:
        print(f"{c['t0']:7.2f} {c['t1']:7.2f}  {c['t1']-c['t0']:5.2f}  {c['text']}")


if __name__ == "__main__":
    main()
