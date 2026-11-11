#!/bin/sh
# One command: subtitles -> score/foley/voice mix -> picture -> mux.
# Needs the library venv (numpy, scipy, pillow, imageio-ffmpeg) and nothing else.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
PY="$LIB/.venv/bin/python"
FF=$("$PY" -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
cd "$HERE"

"$PY" subs.py                                      # captions from the recorded lines
"$PY" film.py srt                                  # cancellation.srt
"$PY" mix.py                                       # out/mix.wav
"$PY" film.py video --fps 30 --out out/video.mp4    # 3600 frames, ~7 min on 2 cores

# master: -14 LUFS, true peak -1.5 dBTP, AAC 192k (-t trims any tail)
"$FF" -y -loglevel error -i out/video.mp4 -i out/mix.wav \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -t 120 -c:v copy -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart cancellation.mp4

"$PY" -c "import film; film.render(45.0).save('poster.jpg', quality=92)"
echo "done: cancellation.mp4, poster.jpg, cancellation.srt"
