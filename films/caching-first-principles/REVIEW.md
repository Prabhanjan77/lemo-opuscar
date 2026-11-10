# Review pass — architect's cut

## Review focus

This revision addresses the first sample's problems with overlap, density, and speed:

- The opening now stages one visible user, one click, one request, then a staggered multi-user swarm.
- Every user route converges on one celebrity profile read target.
- Click sounds are separate from the narration and land with each visible user pop.
- The visual scene grid is slower: 6.0 / 11.5 / 17.8 / 23.5 second boundaries.
- Latency text is held in its own card instead of sharing space with the database / disk stations.
- The hit comparison keeps the source database visible but moves the `≈4 ms` label into a dedicated panel.

## Checks

- `node validate.mjs`: contiguous 30-second scene coverage, 24 fps, cue ordering, caption holds, and narration windows.
- `node --check`: all editable JavaScript modules.
- `core/render/readcheck.mjs`: important labels have sufficient hold time and stay inside the 1920 × 1080 frame.
- Canvas render: 720 frames at 24 fps; review stills at the user swarm, bottleneck, miss, hit, TTL, and final states.
- Audio: 48 kHz mono mix, natural-speed selected voice, staggered click foley, no NaN samples.
- Media: H.264 1920 × 1080 MP4, AAC narration, no long black interval.

## Sample boundary

This remains a sample, not approval to plan the full article expansion. After this architect's cut is reviewed, the next pass can decide whether to add Redis implementation detail, stampede / avalanche / penetration mitigations, invalidation policy, and a longer worked example.
