#!/usr/bin/env bash
# Cates demo — local viewer
# Usage: ./serve.sh [port]  (default 8000)
# Then open http://localhost:8000

set -e
cd "$(dirname "$0")"
PORT="${1:-8000}"

echo ""
echo "  Cates demo serving at:  http://localhost:$PORT"
echo "  Stop with: Ctrl+C"
echo ""

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "$PORT" .
elif command -v ruby >/dev/null 2>&1; then
  exec ruby -run -e httpd . -p "$PORT"
elif command -v php >/dev/null 2>&1; then
  exec php -S "localhost:$PORT"
else
  echo "ERROR: install python3 (recommended), node (npx serve), ruby, or php."
  exit 1
fi
