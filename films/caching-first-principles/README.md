# Caching from First Principles — 30-second architect's sample

A slower 16:9 Canvas system-design explainer based on the article [Caching from First Principles](https://prabhanjan2.substack.com/p/caching-from-first-principles).

## Preview

From the repository root:

```sh
python3 preview_server.py
```

Open `/films/caching-first-principles/index.html?preview=1` and use the Play button or scrubber. The revised cut makes one user / one click / one request explicit, then adds a staggered multi-user swarm whose requests all converge on the same profile target.

## Build / render

```sh
sh films/caching-first-principles/build.sh
```

The build exports the timeline to `events.json` and `captions.srt`, keeps the selected narration at its natural pace, mixes voice with procedural music and click / route / database foley, runs `readcheck`, renders 24 fps frames at `1920x1080`, creates review stills and a contact sheet, and muxes `caching-first-principles.mp4` at approximately −14 LUFS.

## Editable source

- `index.html`, `main.js` — 16:9 preview page contract.
- `engine.js` — Canvas components: profile UI, user cards, click indicators, packets, application/cache/database/disk stations, labels, captions, and measured diagrams.
- `film.js` — the five revised scenes and transitions.
- `timeline.js` — the slower scene timing, narration windows, captions, and architecture cue events.
- `mix_audio.py` — natural-speed voice placement plus procedural score and foley; the staggered user clicks are explicit cues.
- `build.sh` — reproducible source, render, review, and mux entry point.
- `STORYBOARD.md`, `storyboard.svg`, `TREATMENT.md`, `FACTS.md` — plan and technical review record.

## Story scope

The sample covers one click → many clients → database bottleneck → cache miss / population → cache hit → TTL and stampede scope. It intentionally does not claim that a cache removes every consistency, invalidation, or external-system problem. Expand the full article only after this revised sample is reviewed.
