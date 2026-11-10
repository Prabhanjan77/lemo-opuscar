# Caching from First Principles — minimalist architecture sample

A 30-second 16:9 Canvas system-design explainer based on [Caching from First Principles](https://prabhanjan2.substack.com/p/caching-from-first-principles).

The current cut uses an editorial isometric language: pale paper stage, oversized headlines, API / database / disk / cache blocks, a measured latency ruler, and one architectural state change per scene.

## Preview

From the repository root:

```sh
python3 preview_server.py
```

Open `/films/caching-first-principles/index.html?preview=1` and use the Play button or scrubber.

## Build / render

```sh
sh films/caching-first-principles/build.sh
```

The build exports `events.json` and `captions.srt`, keeps the selected narration at a natural pace, mixes procedural click / route / database sounds, runs `readcheck`, renders 24 fps frames at `1920x1080`, clears and recreates the current review still set and storyboard contact board, and muxes `caching-first-principles.mp4` at approximately −14 LUFS.

## Editable source

- `engine.js` — pale editorial Canvas engine, typography, isometric blocks, browser slab, route packets, ruler, TTL clock, and captions.
- `film.js` — five readable scenes: one request, repeated database work, miss, hit, and trade-off.
- `timeline.js` — timing, narration windows, captions, and architecture cue events.
- `mix_audio.py` — voice placement plus procedural sound design.
- `STORYBOARD.md`, `storyboard.svg`, `storyboard.png`, `FACTS.md` — treatment and technical review record.

## Story scope

The sample explains the simplest useful mental model: a cache is a fast shortcut for repeated reads. It does not replace the database, guarantee freshness, or remove stampede and invalidation design work. Full article expansion remains deferred until this sample is accepted.
