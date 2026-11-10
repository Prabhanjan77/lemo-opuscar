# Caching from First Principles — minimalist system-design sample

## Creative direction

A beginner-friendly architecture film inspired by the attached reference grammar: quiet paper background, oversized editorial typography, simple isometric service blocks, a visible time ruler, and one causal action per shot. The viewer should understand caching before seeing implementation vocabulary.

## Approved format

- **Duration:** 30 seconds
- **Canvas:** 16:9 landscape, 1920 × 1080, 24 fps
- **Voice:** selected masculine Indian-accented `en-IN` voice (`voice-02`)
- **Visual language:** off-white editorial stage, black outline, restrained violet / red / green accents, isometric API / database / disk / cache blocks
- **Narration rule:** natural-speed short sentences with breathing room; captions remain in a single readable bottom toast

## Story beats

| Time | Frame | Idea |
|---|---|---|
| 00:00–00:05.6 | `One click, one request` | A browser profile, API cube, and database cube form one route. The cursor clicks once; one request packet crosses the route. Then a visible swarm of request dots converges on the same profile read target. |
| 00:05.6–00:11.5 | `The same question, repeated` | The route pulls back into API → database → disk. A request queue and connection pool fill. A measured ruler breaks the path into approximately `0.5 + 1.5 + 1.5 + 0.5 = 4 ms`. |
| 00:11.5–00:17.7 | `Put a cache in front` | A cache cube slides between API and database. The first lookup is a red miss, falls through to database / disk, returns the result, and saves the profile in memory. |
| 00:17.7–00:23.6 | `The next request is a hit` | The same route repeats, but the green packet stops at memory. The database remains present but dimmed. `1.1 ms` is compared with `≈4 ms`. |
| 00:23.6–00:30 | `A cache is a shortcut` | The app, cache, database, and disk separate into an exploded stack. A `TTL 60 s` clock expires into a later miss. The final promise is `LESS REPEATED WORK`, not “the database disappears.” |

## Technical guardrails

- The `50,000` traffic spike is the article's illustrative example, not a universal capacity claim.
- `≈4 ms` preserves the article's back-of-envelope database path: app → DB `0.5 ms`, controller lookup `1.5 ms`, physical read `1.5 ms`, DB → app `0.5 ms`.
- `≈1.1 ms` is the article's cache-path approximation.
- A cache miss falls through to the database and populates memory; a hit takes the short memory path.
- TTL is an expiry boundary, not a freshness or consistency guarantee.
- The database remains the source of the read. Stampedes and stale-data policy remain design work.
