# Payment Idempotency — Treatment

## Brief

A 60-second vertical explainer for software engineers and system-design interview candidates. The film turns a retry into a visible journey: a payment request leaves a phone, meets a server, reserves a key atomically, and returns one stored result twice. It uses the Dark Tech Keynote grammar as the stage and borrows the Isometric Infographic grammar for the phone, server, database, and request routes.

- **Format:** 1080 × 1920, 9:16, 24 fps
- **Target duration:** 60.0 seconds
- **Audience:** engineers and interview candidates
- **Palette:** near-black, off-white, electric violet, signal red for the failure state, success green for the resolved state
- **Voice:** clear English narration, one sentence per scene beat
- **Captions:** bottom-center UI toasts, lifted away from the system diagram
- **Technical promise:** the same key is reused only for retries of one logical operation; an atomic reservation / unique constraint owns the operation; `PROCESSING` and `COMPLETED` are distinct; a retry during processing waits or receives an in-progress response; external provider idempotency or recovery may still be needed

## Three candidate structures

### A. The retry journey — chosen

Follow two visually identical requests from one phone through the payment server and database. The first pass shows the duplicate risk; the second pass adds `pay_123`, reserves it atomically, and turns the two paths into one payment with two responses. This gives the key a protagonist role and makes concurrency visible without leaving the world of the request.

### B. The split-screen interview answer

Left side: "naive retry" with two charges. Right side: "idempotent retry" with one charge. Finish with a checklist of guarantees and non-guarantees. This is efficient but risks turning a cinematic sequence into a static comparison board.

### C. The database cutaway

Start inside a unique-indexed key table, zoom out to the server, then to the phone. The atomic insert is the hero and the concurrency race is the climax. This is technically precise but makes the hook less human and delays the rupee amount.

**Choice:** A. The retry journey earns the lesson emotionally, lets the camera travel in at least four distinct ways, and keeps the data model attached to a concrete payment rather than an abstract checklist.

## Logline and arc

**Logline:** Two clicks become two requests, but one idempotency key lets a payment system reserve one operation, store one result, and safely answer every retry.

- **Setup, 0–17 s:** A frozen checkout creates doubt; two identical requests threaten a duplicate charge.
- **Turn, 17–30 s:** `pay_123` enters the system and is atomically reserved as `PROCESSING`.
- **Proof, 30–53 s:** The first request completes; the retry gets the stored result. A simultaneous race shows that a lookup alone is not enough; the unique constraint decides ownership.
- **Ending, 53–60 s:** Two paths merge into one green payment, with an explicit scope note about external providers.

## Benchmark

**The viewer should learn:**

1. Idempotency keys identify one logical operation across retries.
2. A unique, atomic reservation prevents two concurrent requests from owning that operation.
3. `PROCESSING` is not `COMPLETED`; a retry can wait or receive an in-progress response.
4. After completion, a retry returns the saved result rather than executing the charge again.
5. This pattern protects the service boundary; external payment providers may need their own idempotency / reconciliation mechanism.

**The viewer should not learn:**

- That a plain database read followed by a write prevents races.
- That a retry key can be reused for a different payment.
- That the mechanism alone proves exactly-once execution across an external provider.
- That a second response means a second payment.

## Shot list

| Time | Shot / framing | Camera and action | Reason |
|---|---|---|---|
| 0.0–2.1 | Extreme close-up, portrait checkout | Locked push into `₹2,000`; a violet status dot pulses | Begin with a tangible human action and a single number |
| 2.1–5.7 | Medium isometric phone | Two taps land with a snap; two request packets peel away on curved trails | Make the failure causal, not decorative |
| 5.7–8.0 | Close title insert | Camera whip-pulls out; red `DOUBLE CHARGE?` grows from the second packet | A single problem word is readable at thumbnail size |
| 8.0–11.8 | Wide top-down system board | Track the two packets toward a server; the board grid appears only as routes land | Expand from user action to distributed system |
| 11.8–14.8 | Three-quarter server close-up | Push into two payment operation bays; red duplicate ledger rows light up | Show that the server can execute twice without protection |
| 14.8–17.0 | Locked records insert | Two red transaction records stack; a red warning bracket closes around both | Give the problem a quiet, legible hold |
| 17.0–20.0 | Hero key reveal | Near-locked frame; `pay_123` is revealed by a violet light sweep | The key becomes the protagonist accent |
| 20.0–24.0 | Route medium shot | Key chips attach to both request packets; paths bend in the same family | Same key, same logical operation, two retries |
| 24.0–27.5 | Database cutaway | A cut line opens the key table; atomic reservation lands as one violet row | Explicitly show reservation, not lookup-only logic |
| 27.5–30.0 | Status close-up | `PROCESSING` types into the row; server holds the second request at the gate | Distinguish in-progress from complete |
| 30.0–34.0 | Server hero, slow push | First request charges once; green completion signal flows to database | Put the successful execution in a single owned lane |
| 34.0–38.0 | Database / response split | `PROCESSING` flips to `COMPLETED`; saved result card duplicates visually, not the charge | Explain cached result semantics |
| 38.0–43.0 | Return route wide | Retry meets the existing key; it routes to the saved result and returns to phone | End the main proof with the phrase `ONE PAYMENT — TWO RESPONSES` |
| 43.0–46.2 | Race macro | Two requests arrive on the same database row at once; violet race lines converge | Make concurrency the second test |
| 46.2–49.5 | Unique-constraint cutaway | One reservation lands; the other hits `UNIQUE(key)` and bounces to an in-progress gate | Demonstrate atomic ownership, not a read-then-write race |
| 49.5–53.0 | In-progress response | Second request waits / receives `IN_PROGRESS`; no fabricated green result appears | Preserve accuracy around incomplete work |
| 53.0–56.0 | Scale pull-out | Two violet paths merge into one green payment node | Compress the system into the takeaway |
| 56.0–60.0 | Final hero title | Green success indicator; `SAFE RETRIES. NO DUPLICATE EXECUTION.`; small scope note below | Leave the audience with the interview-ready sentence and the boundary |

## Beat sheet

- **0.0** black stage, tiny violet click indicator; first words begin.
- **1.2** rupee amount locks; phone surface receives a cool reveal.
- **2.3** first Pay press; **3.1** second Pay press; requests split.
- **5.8** freeze all motion for a half-beat; `DOUBLE CHARGE?` strikes in red.
- **8.0** red drains to the neutral ladder; camera expands to the system board.
- **10.8** two packets enter the server; **12.4 / 13.1** two operation bays fire.
- **14.2** transaction records stack; **16.2** warning bracket holds before the turn.
- **17.0** silence breath; `pay_123` appears from glyph noise in violet.
- **20.0** same key chips attach to both request paths.
- **24.0** database cutaway line draws first; only then does the near skin slide away.
- **26.6** atomic reserve lands; **28.0** `PROCESSING` is visible.
- **30.0** first payment executes; **33.1** result is stored.
- **34.9** state flips to `COMPLETED`; **38.3** retry is routed to the saved result.
- **40.2** `ONE PAYMENT — TWO RESPONSES` holds for readability.
- **43.0** music subdivides; two race lanes arrive simultaneously.
- **47.4** one unique constraint wins; **49.0** loser receives `IN_PROGRESS`.
- **52.8** no second green execution; held silence before final merge.
- **53.0** two paths merge; **55.5** success node blooms.
- **56.0** end title enters; **59.2** small boundary note appears; cut to black at 60.0.

## Cue map

The visual event table and sound events share this 24 fps timeline. The score is a restrained 96 BPM pulse with subdivisions at 16th notes during the problem and concurrency scenes.

| Section | Time | BPM / feel | Music and visual hits |
|---|---:|---|---|
| Hook | 0–8 | 96 BPM, sparse low sine + plucked violet ticks | tap at 2.3, tap at 3.1, request departures at 3.6 / 4.0, red title at 5.8 |
| Problem | 8–17 | 96 BPM, two slightly offset mallet voices | server impacts at 10.8 / 11.3, duplicate ledger hits at 13.2 / 14.0, warning bracket at 15.4 |
| Key | 17–30 | 88 BPM, pad opens; violet bell motif | key reveal at 17.2, key chips at 20.0 / 21.0, cut line 24.0, atomic reserve 26.6, `PROCESSING` at 28.0 |
| Safe retry | 30–43 | 104 BPM, one centred motif | first charge at 30.8, stored result at 33.4, completed state at 34.9, retry route at 37.8, takeaway at 40.2 |
| Concurrency | 43–53 | subdivides to 16ths; tension noise and two race ticks | simultaneous arrival 45.8, unique constraint 47.4, in-progress gate 49.0, held no-green response 51.5 |
| Takeaway | 53–60 | 96 BPM, motif resolves to one green chord | merge 53.4, success bloom 55.2, title 56.0, scope note 59.1 |

## Sound design table

| Section | Ambience | Foley / sync sound | Music state |
|---|---|---|---|
| Hook | −60 dB machine-room air | tactile glass taps, two button clicks, two short packet whooshes | sparse sine pulse; second click slightly detuned |
| Problem | cool coil whine rises | server thunk, ledger stamp, red warning buzz | two mallet notes deliberately out of phase |
| Key | near-silence before reveal | light-sweep shimmer, key ping, database cut line | one violet bell motif; no red sound after the turn |
| Safe retry | low centred hum | atomic lock click, completion chime, soft response return | single in-key motif; duck 8 dB under voice |
| Concurrency | tension bed narrows to mid-band | two race ticks, unique-constraint tick, muted bounce, wait pulse | subdivisions accelerate, then stop for the truth of `IN_PROGRESS` |
| Takeaway | quiet room returns | merge whoosh, green bloom chime, soft final lock | one resolved chord; 0.4 s near-silence before title |

Two sound transitions are intentional: the database cut-line sound arrives 0.35 s before the cutaway (J-cut), and the green completion chime rings over the return-route transition (L-cut). Near-silence holds at 16.5–17.0 s and 52.7–53.0 s.

## Subtitle and title design

- Typeface: Inter-like UI sans for captions and headlines; JetBrains Mono-like labels for keys, states, and database constraints. A local fallback is used if bundled fonts are unavailable.
- Caption: bottom-center translucent near-black pill, 1 px cool-white border, 8 px violet speaking dot, 31–36 px UI text in the portrait frame. Caption safe zone starts at y=1640; system objects rise above it while captions are active.
- One headline per screen. Large terms (`₹2,000`, `pay_123`, `PROCESSING`, `COMPLETED`) get their own negative space.
- Errors use red only while the duplicate risk is active. Violet is reserved for the idempotency key and request identity. Green appears only after a single owned payment completes.
- End title: two lines, large off-white all caps, with `SAFE RETRIES.` in violet and `NO DUPLICATE EXECUTION.` in off-white; below it, a small neutral scope note: `Provider-side idempotency / recovery may still be required.`

## Direction and review questions

The signature shot is the atomic-reservation cutaway: the near half of the database slides out along its normal, exposing one key row and a single owner token while the losing request stops at the unique constraint. The storyboard preview is least certain about the exact density of the isometric system board; the implementation will keep only three hero objects visible at any moment so the technical relationship remains readable in a vertical feed.
