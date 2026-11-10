# Payment Idempotency — Production Notes

## Repository findings

- **Style grammar:** `styles/dark-keynote/STYLE.md` defines the near-black stage, 48 px snap grid, soft light-reveal, one accent, precise 24 fps easing, UI expand/collapse transitions, captions as UI toasts, and the problem-colour rule. `styles/iso-infographic/STYLE.md` defines true-isometric system diagrams, three-tone solids, leader lines, cutaways, tracked routes, and focus/context colour logic.
- **Rendering contract:** a film page exposes `window.READY`, `window.render(t)`, `window.DUR`, optional `window.EV`, and `window.TEXTS(t)`. The shared tools are `core/render/still.mjs`, `video.mjs`, `events.mjs`, `readcheck.mjs`, `sheet.py`, `srt.py`, and `mux.sh`.
- **Audio workflow:** the library supports Kokoro TTS via `core/tts/tts.py`, Whisper verification via `core/tts/asr_check.py`, procedural foley via `core/audio/sfx.py`, and loudness-normalized muxing via `core/render/mux.sh`.
- **Dependencies:** `package.json` contains `playwright-core` and `three`; Python core requirements include numpy, scipy, soundfile, soxr, pillow, and fonttools. Voice and music are optional tiers.
- **Determinism:** all scene motion is driven by time, seeded hashes, and one timeline. No random state or frame-to-frame mutation is used.

## Chosen implementation

This film lives in `films/payment-idempotency/` and uses a standalone Canvas 2D renderer instead of editing a library style or demo. It imports only easing helpers from `core/lib.js`, then applies the Dark Tech Keynote palette and the Isometric Infographic projection locally so the project remains editable and portable.

- `index.html` — 1080 × 1920 portrait page and preview controls.
- `engine.js` — reusable portrait stage, grid, UI panels, isometric solids, paths, captions, and text helpers.
- `film.js` — one 60-second scene timeline; every frame is pure `render(t)`.
- `timeline.js` — scene times, narration lines, captions, cue events, and review metadata.
- `storyboard.svg` / `storyboard.png` — six key-frame storyboard preview.
- `build.sh` — one-command render path when Chrome, FFmpeg, Python deps, and (optionally) the voice tier are installed.
- `CREDITS` — sources and licences for fonts, voice engine, and original code-drawn assets.

## Environment check at storyboard pass

On 2026-11-10, Node 22.22.3 and Python 3.11.2 are present. The repository npm dependencies and the minimal NumPy / SciPy / SoundFile / Pillow toolset used for this film are installed locally. A user-local FFmpeg 9.0.2 binary is now installed through `imageio-ffmpeg`; the build searches the project's `bin/` shim and `.venv/bin`. The project's `bin/ffprobe` shim covers the two probe calls required by `mux.sh`. A temporary Chromium binary was made usable by extracting the package's Amazon Linux 2023 support libraries and setting `LD_LIBRARY_PATH`, then rendering with SwiftShader. This pass now includes the rendered MP4, review stills, and the editable HTML source.
