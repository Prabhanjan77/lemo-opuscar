# Caching from First Principles — minimalist storyboard

This revision uses the attached reference's editorial system-diagram grammar: a pale stage, isometric blocks, large declarative headlines, small technical labels, and a visible timing ruler.

| Panel | Time | Main frame | Required read |
|---|---:|---|---|
| 01 | 00:00–00:05.6 | Browser slab → API cube → database cube. One cursor click sends one packet; then many dots converge on the same profile target. | `One click, one request` / `50,000 requests` |
| 02 | 00:05.6–00:11.5 | API, database, and disk in one isometric route. Dots queue at the database. | `≈4 ms` / `CONNECTION POOL` / latency ruler |
| 03 | 00:11.5–00:17.7 | Cache cube inserted before database. First packet stops at `MISS`; the return packet saves the profile in memory. | `MISS → READ DATABASE → SAVE` |
| 04 | 00:17.7–00:23.6 | Same architecture, green packet takes API → cache only; database is ghosted. | `1.1 ms` / `≈4 ms database path` |
| 05 | 00:23.6–00:30 | Exploded vertical stack: app, cache, database, disk. TTL clock expires and points back to a later miss. | `LESS REPEATED WORK` / `TTL 60 s` / `database still matters` |

## Layout rules

- Large headline stays isolated in the upper-left with generous negative space.
- Isometric objects occupy the middle third; leader labels sit beside, never over, the objects.
- Numbers get their own area. No latency text sits on top of the database or disk.
- Moving packets are sparse: one packet for the first request, a controlled dot field for scale, one packet for miss, one packet for hit.
- Captions use the lower 125 px safe zone.
