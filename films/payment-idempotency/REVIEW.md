# Review pass

## Completed in this environment

- `node validate.mjs`: timeline coverage, 24 fps / 60 s duration, event ordering, and caption minimum hold checks pass.
- `node --check` passes for `engine.js`, `film.js`, `main.js`, and `timeline.js`.
- A deterministic mock Canvas exercised representative times across all six scenes without page-level exceptions.
- `mix.wav` is exactly 60.0 seconds, 48 kHz mono, has no NaN samples, and is ready for the repository muxer's loudness pass.
- Storyboard and poster were inspected at portrait size for legible hierarchy, caption safe zone, red/green state separation, and no title collisions.

## Final-media checks

- FFmpeg 9.0.2 is installed user-locally through `imageio-ffmpeg`; the project `bin/ffprobe` shim covers the mux script's duration/audio queries.
- Chromium 153 was rendered with SwiftShader after extracting its bundled Amazon Linux 2023 support libraries (`libnspr4.so`, `libnss3.so`, and related libraries).
- All 1,440 frames rendered at 24 fps, 1080 × 1920.
- Representative stills and the contact sheet were inspected at 13.8 s, 24.8 s, 49.2 s, 56.4 s, and 59.4 s. No clipping, blank frames, caption collision, or state-color ambiguity was found.
- `readcheck` passes for every scene-critical on-screen text. Captions are checked from `captions.srt` as required by the renderer contract.
- Final `payment-idempotency.mp4`: 60.00 s, H.264 High, 1080 × 1920, 24 fps, AAC mono at 48 kHz.
- Final audio measurement: −14.3 LUFS integrated, −1.6 dBFS peak, 2.9 LU LRA. `blackdetect` found no long black interval.

`sh films/payment-idempotency/build.sh` reproduces the render when a compatible Chromium path and the FFmpeg environment are available.
