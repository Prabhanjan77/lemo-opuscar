# Facts and source notes

| Claim used in the sample | Source / wording | Treatment |
|---|---|---|
| A celebrity-profile spike can send about 50,000 users toward the same database-backed read. | [Caching from First Principles](https://prabhanjan2.substack.com/p/caching-from-first-principles), opening traffic-spike example. | On-screen `50,000` is labelled as a traffic spike, not a guaranteed system limit. |
| Database pressure comes from connection-pool limits, IOPS / disk reads, and CPU utilization. | Same article, database-bottleneck section. | Visualized as pool slots and disk-read strips; no invented CPU percentage is shown. |
| Example database path: app → DB 0.5 ms, disk-controller lookup 1.5 ms, physical read 1.5 ms, DB → app 0.5 ms, about 4 ms total. | Same article, back-of-envelope latency calculation. | Rendered as `~4 ms` with component labels in the exploded route. |
| Cache path is app → cache, about 1.1 ms in the article's example, approximately a 4× cut. | Same article, cache lookup / latency section. | Rendered as `1.1 ms` versus `4 ms`; approximation marker is retained. |
| On a miss, the request falls through to the database and the result is cached; later requests can hit memory. | Same article, cache miss / cache hit explanation. | Core story beat. |
| Redis is an in-memory key-value database commonly used for caching. | Same article, Redis paragraph. | Optional implementation hint only; the diagram does not claim every cache is Redis. |
| TTL prevents indefinitely stale entries; expiry causes a later miss and repopulation cycle. | Same article, TTL explanation. | Shown as an expiry boundary and miss loop, not as a consistency guarantee. |
| Cache stampede, avalanche, and penetration are edge cases with mitigations such as single-flight / mutex, TTL jitter, and negative caching / Bloom filters. | Same article, cache-penetration and related edge-case discussion. | The 30-second sample only names stampedes in the closing scope note; mitigations are deferred to the full video. |

## Review note

All numerical claims above are article-specific approximations. The film does not claim that caching eliminates every consistency, invalidation, or external-system problem. Full article expansion should add the edge-case mitigations and make cache policy explicit.
