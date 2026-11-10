# Review pass — minimalist architecture cut

## Review focus

This cut changes the visual language rather than adding more UI:

- off-white editorial stage and giant declarative headlines;
- browser → API → database → disk isometric route;
- one request packet, then a restrained request-dot field for scale;
- measured `≈4 ms` ruler with the article's component timings;
- explicit cache miss and population route;
- explicit green cache hit with database still visible but ghosted;
- exploded TTL / source-of-truth trade-off.

## Checks

- `node validate.mjs`: contiguous 30-second scene coverage, 24 fps, cue ordering, caption holds, and narration windows.
- `node --check`: all editable JavaScript modules.
- `core/render/readcheck.mjs`: important headline and metric text stays fully in frame for the required hold time.
- Canvas render: 720 frames at 24 fps; review stills at the click, swarm, bottleneck, miss, hit, and TTL states.
- Audio: 48 kHz mono mix, natural-speed selected voice, click / miss / hit foley, no NaN samples.
- Media: H.264 1920 × 1080 MP4, AAC narration, no long black interval.

## Sample boundary

This remains a sample. After review, the full article can add Redis, stampede / avalanche / penetration mitigations, invalidation strategy, and a longer worked example.
