# Caching from First Principles — 30-second sample treatment

## Intent

A beginner-to-intermediate explainer that makes one request path visible: a celebrity-profile spike creates repeated reads, the database path becomes the bottleneck, and a cache changes the common path from disk-backed work to an in-memory lookup. The film is a sample only; it deliberately leaves the article's deeper edge cases for a later full-length treatment.

## Approved format

- **Duration:** 30 seconds
- **Canvas:** 16:9 landscape, 1920 × 1080, 24 fps
- **Language / voice:** English, selected masculine Indian-accented `en-IN` voice (`voice-02`)
- **Caption treatment:** synchronized bottom-centre UI toast; captions are exported to `captions.srt`
- **Visual medium:** deterministic Canvas 2D, original code-drawn diagrams and interface surfaces; no stock footage
- **Accent logic:** violet = traffic / cache / active route, red = bottleneck or miss, green = hit / fast path, neutral = infrastructure

## Shot plan

| Time | Style grammar | What the viewer sees | Spoken idea |
|---|---|---|---|
| 00:00–00:04.3 | Dark Tech Keynote + Living Screencast | Giant `50,000` resolves out of glyph noise. A redrawn celebrity profile window appears; a cursor taps refresh and concentric request rings multiply. | Fifty thousand people open the same celebrity profile at once. |
| 00:04.3–00:11.8 | Living Screencast → Desktop Flythrough | The profile window pulls back into a physical route. Camera travels over application, database, and disk stations. Connection slots fill; disk read strips pulse; `~4 ms` and `BOTTLENECK` land on the database path. | Without a cache, every request hits the database. Connections fill, disk reads pile up, and latency grows. |
| 00:11.8–00:19.1 | Living Screencast + Desktop Flythrough | A cache station slides into the route. The key lookup is explicit. First request is a red `MISS`; route dives to database/disk, returns the profile card, and writes the result into the cache. | The cache checks first. On a miss, read the database, store the result, then respond. |
| 00:19.1–00:25.5 | Dark Tech Keynote + Living Screencast | Same request repeats. `HIT` flips green; the route is short and bright. Giant `1.1 ms` resolves beside the earlier `4 ms`, with the database path dimmed rather than erased. | On a hit, hot data returns from memory in roughly one point one milliseconds, instead of four. |
| 00:25.5–00:30.0 | Exploded Teardown + Dark Tech Keynote | The path separates into app, in-memory cache, database, and disk layers. Anchored labels call out `TTL 60 s`; expiry turns into a controlled miss loop. End promise reads `LESS REPEATED WORK`, followed by a small scope note about stampedes. | A TTL limits staleness. Caching removes repeated reads, but stampedes still need design. |

## Technical guardrails

- The `50,000` figure is the article's illustrative celebrity-profile spike, not a universal capacity claim.
- The film preserves the article's back-of-envelope values: app → database `0.5 ms`, disk-controller lookup `1.5 ms`, physical read `1.5 ms`, database → app `0.5 ms`, about `4 ms` total; cache path about `1.1 ms`.
- A cache miss falls through to the database and populates the cache. A cache hit is the fast in-memory path.
- TTL is shown as an expiry boundary, not as proof of freshness or consistency.
- The closing scope note avoids saying that caching eliminates all stale-data, stampede, or external-system problems.
- Redis may be shown as a small implementation hint on the cache station, not as a requirement for every cache.

## Sound / motion

One shared 96 BPM procedural pulse, dry request ticks, a low disk thump, and a green cache-hit chime. The voice remains dominant and the music ducks below it. Motion follows snap-grid timing: number lock, camera travel, route packets, then a measured layer separation.
