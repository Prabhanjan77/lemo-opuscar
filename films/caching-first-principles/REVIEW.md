# Review pass

## Planned checks

- `node validate.mjs`: contiguous 30-second scene coverage, 24 fps, cue ordering, caption holds, and narration windows.
- `node --check`: all editable JavaScript modules.
- `core/render/readcheck.mjs`: important on-screen labels have sufficient hold time and stay inside the 1920 × 1080 frame.
- Canvas render: 720 frames at 24 fps; review stills at each route transition and the final trade-off card.
- Audio: 48 kHz mono mix, no NaN samples, voice above the procedural bed, final loudness through the repository muxer.
- Media: H.264 1920 × 1080 MP4, AAC narration, no long black interval.

## Technical review notes

The review should specifically inspect the cache miss path, cache population, cache hit route, latency values, TTL expiry, and the closing stampede scope note. The database path remains visible in the hit scene but is dimmed rather than removed, so the film does not imply that caching makes the source of truth disappear.

## Sample boundary

This deliverable is deliberately a sample. It is not approval to plan the full article expansion. After review, the next pass can decide whether to add Redis implementation detail, stampede / avalanche / penetration mitigations, invalidation policy, and a longer worked example.
