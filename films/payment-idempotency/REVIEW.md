# Review pass

## Completed in this environment

- `node validate.mjs`: timeline coverage, 24 fps / 60 s duration, event ordering, and caption minimum hold checks pass.
- `node --check` passes for `engine.js`, `film.js`, `main.js`, and `timeline.js`.
- A deterministic mock Canvas exercised representative times across all six scenes: 0, 2.3, 7.99, 8, 12.8, 16.99, 17, 25, 29.9, 30, 35, 41, 42.99, 43, 47.6, 51.5, 52.99, 53, 54.8, 56.2, and 59.7 seconds without page-level exceptions.
- `mix.wav` is exactly 60.0 seconds, 48 kHz mono, has no NaN samples, and is ready for the repository muxer's loudness pass.
- Storyboard and poster were inspected at portrait size for legible hierarchy, caption safe zone, red/green state separation, and no title collisions.

## Blocked final-media checks

- The repository's real Chrome frame renderer could not launch in this sandbox: the available temporary headless binary is missing `libnspr4.so`.
- FFmpeg is not installed, so no raw MP4 or muxed MP4 could be generated here.

On a machine with Chrome/Chromium and FFmpeg 7+, run `sh films/payment-idempotency/build.sh`. It renders 24 fps 1080 × 1920 review stills at the scene boundaries, runs `readcheck`, and then muxes `mix.wav` to `payment-idempotency.mp4`. Recheck the contact sheet and full-speed playback once that environment is available.
