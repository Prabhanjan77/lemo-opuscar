# Storyboard preview — Payment Idempotency

**Format:** 1080 × 1920 portrait · **Duration:** 60 seconds · **Style:** Dark Tech Keynote × Isometric Infographic

The preview below is a six-panel key-frame sheet. Each panel is a portrait frame with the same dark stage, hairline grid, violet identity accent, red problem state, green success state, and isometric infrastructure silhouettes planned for the editable Canvas animation.

| Panel | Time | Visual beat | Narration anchor |
|---|---:|---|---|
| 1 | 0–8 s | Phone, `₹2,000`, two Pay taps, two request packets, `DOUBLE CHARGE?` | “Imagine paying two thousand rupees online…” |
| 2 | 8–17 s | Two packets reach server; two operation bays and two red records | “Both requests might reach the payment server…” |
| 3 | 17–30 s | Violet `pay_123` key attaches to both requests; database reserves one row as `PROCESSING` | “That’s why payment systems use idempotency keys…” |
| 4 | 30–43 s | First charge completes; database becomes `COMPLETED`; retry gets saved result | “The first request processes the payment and stores its result…” |
| 5 | 43–53 s | Simultaneous race; one atomic reservation wins; `UNIQUE(key)` stops duplicate ownership; loser is `IN_PROGRESS` | “But what if both requests arrive simultaneously?” |
| 6 | 53–60 s | Two paths merge into one green payment; final promise and external-provider scope note | “That’s payment idempotency…” |

## Review gate

The exact density of the isometric system board is the main creative choice to review. The implementation will keep the server, database, and request lanes large enough to read on a phone, with captions in a lifted bottom safe zone. Approve this structure or request changes before the full scene build proceeds.
