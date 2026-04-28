#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8765}"
OUTPUT_PATH="$ROOT_DIR/assets/ccgrid2026-full-program.pdf"
SERVER_LOG="$(mktemp)"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$SERVER_LOG"
}

trap cleanup EXIT

cd "$ROOT_DIR"

python3 -m http.server "$PORT" --bind 127.0.0.1 >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

for _ in {1..20}; do
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    break
  fi
  if curl -fsS "http://127.0.0.1:${PORT}/programs.html" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
  echo "Failed to start local server on port $PORT" >&2
  cat "$SERVER_LOG" >&2
  exit 1
fi

if ! curl -fsS "http://127.0.0.1:${PORT}/programs.html" >/dev/null 2>&1; then
  echo "Failed to start local server on port $PORT" >&2
  cat "$SERVER_LOG" >&2
  exit 1
fi

wkhtmltopdf \
  --enable-local-file-access \
  --print-media-type \
  --run-script "document.body.classList.add('program-export-pdf');document.querySelectorAll('.program-panel').forEach(function(panel){panel.hidden=false;panel.classList.add('is-active');});" \
  --javascript-delay 1500 \
  --page-size A4 \
  --margin-top 12mm \
  --margin-bottom 12mm \
  --margin-left 10mm \
  --margin-right 10mm \
  "http://127.0.0.1:${PORT}/programs.html" \
  "$OUTPUT_PATH"

echo "Regenerated $OUTPUT_PATH"
