# Why Your API Keeps Working After the User Leaves

120 s · 1920×1080 · 30 fps · English narration (Indian English) · burned-in captions + `.srt`
Master: −14.4 LUFS, true peak −1.2 dBFS.

| File | What it is |
|---|---|
| `cancellation.mp4` | the film |
| `poster.jpg` | signature frame |
| `cancellation.srt` | subtitles (33 cues) |
| `index.html` | local player (`python3 -m http.server` in this folder) |
| `TREATMENT.md` | structure, shot list, beat sheet, cue map, sound table |
| `CREDITS` | every third-party asset |
| `stills/` | review frames |

## Build

```sh
./build.sh          # subs -> mix -> 3600 frames -> mux, ~7 min on 2 cores
```

Pieces, if you want them alone:

```sh
python film.py stills 12 36 84     # review frames -> stills/
python film.py frames --from 0 --to 120 --step 1
python film.py video --fps 30      # out/video.mp4
python mix.py                      # out/mix.wav
```

## How it is made

- **Picture** (`draw.py`, `obj.py`, `film.py`): vector drawing with Pillow at 2× and a Lanczos
  downsize. One true-isometric camera (`u=(x−y)cos30`, `v=(x+y)/2−z`), three flat tones per face,
  contact shadows only. Every scene is a pure function of time, so any frame renders alone. The
  server, database, client, packet and cancellation token are one geometry each, reused in all
  nine scenes.
- **Sound** (`mix.py`): a 120 BPM bed written from the cue map (pads, bass, pluck arpeggios, a
  kalimba motif), procedural foley on the same second as each visual hit, and the narration ducking
  the music by about 8 dB.
- **Captions** (`subs.py`): each recorded line is split at its real pauses, so every caption
  boundary sits where the narrator breathes.
