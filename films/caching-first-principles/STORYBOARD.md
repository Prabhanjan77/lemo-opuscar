# Caching from First Principles — architect's storyboard

**Revision:** slower system-design cut, 30 seconds, 16:9 landscape, 1920 × 1080, 24 fps.

This storyboard responds to review feedback: explicit one-user / one-click causality, visible multi-user fan-out, one shared profile target, reduced text collision, and longer holds at architecture state changes.

| Panel | Time | Frame / camera | Diagram beats | Read target |
|---|---:|---|---|---|
| 01 | 00:00–00:06 | Locked keynote frame, then a measured pull-back | `USER 01` clicks once → one `GET /profile`; six more users pop in one at a time; all request lines end on the same celebrity profile window; `50,000` resolves in a separate panel | `ONE CLICK → ONE REQUEST`, `ALL REQUESTS CONVERGE`, `50,000` |
| 02 | 00:06–00:11.5 | Continuous desktop flythrough from the profile route | application → database → disk; pool slots fill sequentially; only then reveal component latency and `≈4 ms` | `CONNECTION POOL`, `DATABASE`, `≈4 ms` |
| 03 | 00:11.5–00:17.8 | Lateral station move with deliberate route pauses | cache lookup → red `MISS` → database → disk → profile result → cache `POPULATE` | `MISS → DATABASE → STORE → RESPOND` |
| 04 | 00:17.8–00:23.5 | Whip pull-out resolves into a locked comparison card | same profile request → green `HIT` → cache memory; database and disk remain visible but dimmed | `1.1 ms`, `≈4 ms`, `DATABASE PATH / DIMMED, NOT GONE` |
| 05 | 00:23.5–00:30 | Exploded teardown orbit and measured pull-back | application / cache / database / disk layers separate vertically; `TTL 60 s` clock expires; dashed loop shows a later miss; final promise holds | `TTL 60 s`, `LESS / REPEATED / WORK`, `STAMPEDES STILL NEED DESIGN` |

## Caption safe zone

Captions remain a bottom-centre dark toast occupying the lower 125 px. The multi-user cards live left of the profile window; the `50,000` keynote number lives in the upper-right; latency comparison is in a separate right-side card above the caption zone. Teardown labels use a fixed right column.

## Review checklist

- [ ] At least one clearly identifiable user clicks once before the swarm appears.
- [ ] The first click produces one visible request packet and one click sound.
- [ ] Multiple user cards pop with staggered click rings and click sounds.
- [ ] Every visible request route converges on the same celebrity profile target.
- [ ] The application/database/disk route is read before the `≈4 ms` breakdown appears.
- [ ] `MISS` falls through to database and disk before `POPULATE`.
- [ ] `HIT` uses only the short cache route; the database is dimmed, not deleted.
- [ ] TTL is shown as expiration and a later miss, not as a consistency guarantee.
- [ ] No headline or latency card is clipped or overlapped by infrastructure labels.
- [ ] Captions and narration have breathing room at every state change.
