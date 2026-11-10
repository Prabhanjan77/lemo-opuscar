# Caching from First Principles — storyboard

**Review artifact:** 30-second sample, 16:9 landscape, 1920 × 1080, 24 fps.

The storyboard is a six-panel contact board in `storyboard.svg` and can be regenerated from the editable scene source after rendering. It is intentionally a visual plan, not a static-slide design: each panel names the camera move, route, and state transition that the Canvas film will animate.

| Panel | Time | Frame / camera | Diagram beats | Caption / read target |
|---|---:|---|---|---|
| 01 | 00:00 | Locked keynote close-up; light sweep into a profile window | `50,000` → same celebrity profile → cursor refresh → request rings | `50,000 USERS` and `SPIKE / SAME PROFILE` |
| 02 | 00:04.3 | Continuous pull-back from screencast to desktop route | application → database → disk; pool slots fill; disk strips flash red | `DATABASE BOTTLENECK` / `~4 ms` |
| 03 | 00:09.0 | Lateral desktop flythrough at station height | route crosses app, DB, disk; repeated packets queue at the DB | `CONNECTION POOL` / `DISK READS` |
| 04 | 00:14.0 | Camera dives into the cache station | lookup key → `MISS` → DB → disk → cache population; same profile card returns | `MISS → DB → CACHE` |
| 05 | 00:20.5 | Whip pull-out to keynote number reveal | repeat request turns `HIT`; short memory route glows; long DB route recedes | `1.1 ms` vs `4 ms` |
| 06 | 00:26.5 | Exploded teardown orbit, then measured pull-back | app / memory cache / DB / disk layers separate; `TTL 60 s` expires into a miss loop | `LESS REPEATED WORK` + `STAMPEDES NEED DESIGN` |

## Caption safe zone

Captions are a bottom-centre dark toast occupying the lower 125 px. Infrastructure labels stay above y=900 on the 1080p canvas; the exploded teardown's label column is biased to the upper-right so no label is hidden behind the toast.

## Visual review checklist

- [ ] The request path is readable left-to-right and never implies that the database disappears.
- [ ] `MISS` visibly travels through database and disk before cache population.
- [ ] `HIT` uses the short in-memory route and is not conflated with a database read.
- [ ] `TTL` is visibly an expiration timer, not a freshness guarantee.
- [ ] Red is used only for pressure / miss; green only for the fast hit / resolution.
- [ ] The final scope note keeps stampede and stale-data design in view.
- [ ] Captions and narrated phrases share the same timeline.
