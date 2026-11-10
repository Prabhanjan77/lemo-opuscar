#!/bin/sh
# Rebuild the Caching from First Principles 30-second sample.
# Run from anywhere: sh films/caching-first-principles/build.sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
LIB=${LIB:-$(CDPATH= cd -- "$HERE/../.." && pwd)}
PY=${PYTHON:-$LIB/.venv/bin/python}
[ -f "$LIB/core/render/video.mjs" ] || { echo "Set LIB to the Lemo-Opuscar repository root." >&2; exit 1; }
cd "$LIB"
export PATH="$HERE/bin:$LIB/.venv/bin:$PATH"

node "$HERE/export.mjs"
node --check "$HERE/engine.js"
node --check "$HERE/film.js"
node --check "$HERE/main.js"
node --check "$HERE/timeline.js"
node "$HERE/validate.mjs"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Preview/source ready. FFmpeg is not installed, so audio/video export was skipped." >&2
  exit 0
fi
mkdir -p "$HERE/narration/processed"
for src in "$HERE"/narration/scene0*.wav; do
  [ -f "$src" ] || continue
  name=$(basename "$src")
  ffmpeg -y -loglevel error -i "$src" -filter:a atempo=1.08 -ar 48000 -ac 1 "$HERE/narration/processed/$name"
done
if [ ! -x "$PY" ]; then PY=python3; fi
"$PY" "$HERE/mix_audio.py"

find_browser() {
  if [ -n "${PLAYWRIGHT_CHROME:-}" ] && [ -x "$PLAYWRIGHT_CHROME" ]; then printf '%s' "$PLAYWRIGHT_CHROME"; return 0; fi
  for c in google-chrome chromium chromium-browser chrome; do command -v "$c" 2>/dev/null && return 0; done
  return 1
}
prepare_npm_browser() {
  find_browser >/dev/null 2>&1 && return 0
  PACK="$LIB/node_modules/@sparticuz/chromium/bin"
  [ -f "$PACK/chromium.br" ] || return 1
  if [ -f "$PACK/al2023.tar.br" ]; then
    ALDIR=$(node --input-type=module -e "import { inflate } from '@sparticuz/chromium'; console.log(await inflate('$PACK/al2023.tar.br'))") || return 1
    export LD_LIBRARY_PATH="$ALDIR/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
  fi
  CHROME=$(node --input-type=module -e "import chromium from '@sparticuz/chromium'; console.log(await chromium.executablePath('$PACK'))") || return 1
  [ -x "$CHROME" ] || return 1
  export PLAYWRIGHT_CHROME="$CHROME"
}
prepare_npm_browser || true
if ! find_browser >/dev/null 2>&1; then
  echo "Audio/source ready. Chrome/Chromium is not available, so frame rendering and MP4 mux were skipped." >&2
  exit 0
fi

OUT="$HERE/out"; REVIEW="$OUT/review"; mkdir -p "$REVIEW"
node core/render/events.mjs "$HERE" --out "$HERE/events.json" --size 1920x1080
node core/render/readcheck.mjs "$HERE" --size 1920x1080
node core/render/video.mjs "$HERE" --fps 24 --workers 2 --size 1920x1080 --out "$OUT/caching-first-principles-raw.mp4"
node core/render/still.mjs "$HERE" 0 4.3 8.5 12.6 16.5 20.8 25.8 29.6 --size 1920x1080 --out "$REVIEW" --prefix frame_
"$PY" core/render/sheet.py "$REVIEW/contact-sheet.jpg" "$REVIEW"/frame_*.jpg --cols 4 --w 480
sh core/render/mux.sh "$OUT/caching-first-principles-raw.mp4" "$HERE/mix.wav" "$HERE/caching-first-principles.mp4" 24 0
cp "$REVIEW/frame_20.8.jpg" "$HERE/poster.jpg"
echo "Built $HERE/caching-first-principles.mp4"
