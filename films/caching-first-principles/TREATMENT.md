# Caching from First Principles — 30-second architect's cut

## Direction

A slower, system-design explainer built around one causal sentence: **one person clicks once and creates one request; many people click the same profile and all those requests converge on the same read path.** The camera then follows one request through application, database, disk, cache miss, cache population, and cache hit.

The cut favours clear state changes over decorative motion. Every important packet has time to land, every layer has an anchored label, and the viewer can pause the mental model at each architecture boundary.

## Approved format

- **Duration:** 30 seconds
- **Canvas:** 16:9 landscape, 1920 × 1080, 24 fps
- **Language / voice:** English, selected masculine Indian-accented `en-IN` voice (`voice-02`)
- **Caption treatment:** synchronized bottom-centre UI toast; captions are exported to `captions.srt`
- **Visual medium:** deterministic Canvas 2D, original code-drawn assets; no stock footage
- **Accent logic:** violet = request route, red = pressure or miss, green = hit / resolved fast path, neutral = infrastructure
- **Pacing rule:** one major action at a time; route packets do not compete with headline reveals; explanatory labels hold before the next state enters

## Shot plan

| Time | Style grammar | What the viewer sees | Spoken idea |
|---|---|---|---|
| 00:00–00:06 | Dark Tech Keynote + Living Screencast | One visible user card appears. A cursor clicks once; one `GET /profile` packet reaches one celebrity profile window. Then six more user cards pop in with distinct click rings. Their request lines all converge on that same profile endpoint while `50,000` resolves in a separate keynote panel. | One person clicks once: one request. Now fifty thousand people click the same profile. |
| 00:06–00:11.5 | Desktop Flythrough | The camera pulls back from the profile into a clear route: application → database → disk. The connection pool fills one slot at a time. A measured `≈ 4 ms` breakdown appears only after the route is readable. | All those requests reach the database. Connections and disk reads pile up. |
| 00:11.5–00:17.8 | Living Screencast + Desktop Flythrough | The cache is inserted before the database. A single lookup enters the cache and stops at a red `MISS`; the path then falls through to database and disk, returns the profile, and writes it into the cache. | The cache checks first. A miss reads the database, stores the profile, and responds. |
| 00:17.8–00:23.5 | Dark Tech Keynote + Living Screencast | The same profile request repeats. A green `HIT` travels only application → cache. The source database remains visible but dimmed. `1.1 ms` and a boxed `≈ 4 ms` comparison hold long enough to read. | A hit returns the profile from memory in about one point one milliseconds, not four. |
| 00:23.5–00:30 | Exploded Teardown + Dark Tech Keynote | Application, in-memory cache, database, and disk separate vertically with anchored labels. A `TTL 60 s` clock expires into a later miss loop. The final card resolves to `LESS / REPEATED / WORK`, with a small stampede scope note. | TTL limits staleness. The database still matters. Stampedes need design. |

## Architecture rules

- The user cards are not decorative: each represents a client request and each request line ends at the same profile read target.
- The profile window is the read target; the application station is the service boundary that receives the request before checking cache or database.
- The database remains the source of the read. A cache hit dims it but never removes it.
- The miss is a state transition: lookup → miss → database/disk → result → cache population.
- The hit is a different route, not a second database read: lookup → hit → memory response.
- Values remain article-specific approximations: `≈4 ms` database path and `≈1.1 ms` cache path.
- TTL is an expiry boundary, not a freshness or consistency guarantee. Stampedes remain an explicit scope note.

## Sound / motion

The voice is kept at the selected natural pace rather than squeezed into a fast 1.08× delivery. A dry click belongs to the first user and a staggered set of clicks belongs to the swarm. Packets move in short, readable flights; the camera settles before each measured label appears. A low database thump and one green hit chime identify architecture states without turning the film into a montage.
