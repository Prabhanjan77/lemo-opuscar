# Caching from First Principles — 30-second sample

A 16:9 landscape Canvas explainer based on the article [Caching from First Principles](https://prabhanjan2.substack.com/p/caching-from-first-principles).

## Preview

From the repository root:

```sh
python3 preview_server.py
```

Open `/films/caching-first-principles/index.html?preview=1` and use the Play button or scrubber. The preview includes `mix.wav`, procedural sound design, synchronized captions, and the same deterministic renderer used for the final video.

## Build / render

```sh
sh films/caching-first-principles/build.sh
```

The build exports the timeline to `events.json` and `captions.srt`, creates a pitch-preserving 1.08× narration pass, mixes voice with procedural music / foley, runs `readcheck`, renders 24 fps frames at `1920x1080`, creates review stills and a contact sheet, and muxes `caching-first-principles.mp4` at approximately −14 LUFS. If Chrome or FFmpeg is unavailable, the editable source and preview remain usable and the missing media step is reported.

## Editable source

- `index.html`, `main.js` — 16:9 preview page contract.
- `engine.js` — Canvas components: dark stage, redrawn profile UI, packets, application/cache/database/disk stations, labels, captions, and measured diagrams.
- `film.js` — the five animated scenes and transitions.
- `timeline.js` — scene timing, narration windows, captions, and cue events.
- `mix_audio.py` — voice placement plus procedural score and foley.
- `build.sh` — reproducible source, render, review, and mux entry point.
- `STORYBOARD.md`, `storyboard.svg`, `TREATMENT.md`, `FACTS.md` — plan and technical review record.

## Story scope

The sample covers traffic spike → database bottleneck → cache miss / population → cache hit → TTL and stampede scope. It intentionally does not claim that a cache removes every consistency, invalidation, or external-system problem. Expand the full article only after this sample is reviewed.
