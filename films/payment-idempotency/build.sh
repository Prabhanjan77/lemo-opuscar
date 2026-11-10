#!/bin/sh
# Rebuild the Payment Idempotency film. Run from anywhere:
#   sh films/payment-idempotency/build.sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
LIB=${LIB:-$(CDPATH= cd -- "$HERE/../.." && pwd)}
PY=${PYTHON:-$LIB/.venv/bin/python}

[ -f "$LIB/core/render/video.mjs" ] || { echo "Set LIB to the Lemo-Opuscar repository root." >&2; exit 1; }
cd "$LIB"

# This step is always useful: it exports the single timeline to cues and captions.
node "$HERE/export.mjs"
if [ ! -x "$PY" ]; then PY=python3; fi
"$PY" "$HERE/mix_audio.py"

find_browser() {
  if [ -n "${PLAYWRIGHT_CHROME:-}" ] && [ -x "$PLAYWRIGHT_CHROME" ]; then printf '%s' "$PLAYWRIGHT_CHROME"; return 0; fi
  for c in google-chrome chromium chromium-browser chrome; do command -v "$c" 2>/dev/null && return 0; done
  return 1
}

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Preview/source ready. FFmpeg is not installed, so MP4 export was skipped." >&2
  echo "Install FFmpeg 7+ and rerun this script." >&2
  exit 0
fi
if ! find_browser >/dev/null 2>&1; then
  echo "Preview/source ready. Chrome/Chromium is not available, so frame rendering was skipped." >&2
  echo "Install a Chrome headless shell compatible with playwright-core 1.63.0, or set PLAYWRIGHT_CHROME, then rerun." >&2
  exit 0
fi

OUT="$HERE/out"
mkdir -p "$OUT" "$OUT/review"
node core/render/events.mjs "$HERE" --out "$HERE/events.json" --size 1080x1920
node core/render/readcheck.mjs "$HERE" --size 1080x1920 || true
node core/render/video.mjs "$HERE" --fps 24 --workers 2 --size 1080x1920 --out "$OUT/payment-idempotency-raw.mp4"
node core/render/still.mjs "$HERE" 0 8 17 30 43 53 56.5 59.4 --size 1080x1920 --out "$OUT/review" --prefix frame_
sh core/render/mux.sh "$OUT/payment-idempotency-raw.mp4" "$HERE/mix.wav" "$HERE/payment-idempotency.mp4" 24 0
cp "$OUT/review/frame_56.5.jpg" "$HERE/poster.jpg"
echo "Built $HERE/payment-idempotency.mp4"
