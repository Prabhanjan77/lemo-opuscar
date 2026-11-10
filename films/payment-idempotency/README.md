# Payment Idempotency

A 60-second, 1080 × 1920 Canvas explainer in the repository's Dark Tech Keynote × Isometric Infographic grammar.

## Preview

From the repository root:

```sh
python3 preview_server.py
```

Open the live preview at `/films/payment-idempotency/index.html?preview=1` and use **Play** / the scrubber. The preview includes `mix.wav` narration, sparse procedural score, and synchronized captions.

## Build / render

```sh
sh films/payment-idempotency/build.sh
```

The build always regenerates `events.json`, `captions.srt`, and `mix.wav`. If Chrome/Chromium and FFmpeg 7+ are available, it renders 24 fps frames at `1080x1920`, takes review stills, runs `readcheck`, and muxes `payment-idempotency.mp4` at approximately −14 LUFS. If either tool is missing, it leaves the editable HTML preview and reports the missing step rather than writing a false MP4.

## Editable source

- `index.html`, `main.js` — 9:16 preview and Lemo-Opuscar page contract.
- `engine.js` — portrait Dark Tech Keynote stage, UI components, isometric solids, paths, cutaways, and captions.
- `film.js` — all six animated scenes and transitions.
- `timeline.js` — 60-second scene grid, event cues, narration placement, and caption timing.
- `mix_audio.py` — voice placement plus procedural music/foley.
- `build.sh` — reproducible render entry point.
- `TREATMENT.md`, `STORYBOARD.md`, `storyboard.png` — approved plan and storyboard preview.
- `CREDITS` — materials, voices, and licences.

## Technical behavior shown in the film

The film reuses `pay_123` only for retries of the same logical operation. It shows an atomic reservation / `UNIQUE(key)` owner decision before `PROCESSING`, keeps `PROCESSING` separate from `COMPLETED`, routes a retry to a saved result after completion, and shows a concurrent loser waiting / receiving `IN_PROGRESS`. The end-card scope note avoids claiming exactly-once execution across an external provider; provider-side idempotency or recovery may still be required.
