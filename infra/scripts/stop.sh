#!/usr/bin/env bash

set -euo pipefail

PORTS=(3000 5173 5174 5175 8000)
STOPPED=0

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
docker compose \
  -f "$ROOT_DIR/infra/compose/compose.yml" \
  -f "$ROOT_DIR/infra/compose/compose.local.yml" \
  down --remove-orphans

for PORT in "${PORTS[@]}"; do
  if command -v lsof >/dev/null 2>&1; then
    PIDS="$(lsof -ti tcp:"$PORT" -sTCP:LISTEN || true)"
  elif command -v fuser >/dev/null 2>&1; then
    PIDS="$(fuser "$PORT"/tcp 2>/dev/null || true)"
  else
    echo "Neither lsof nor fuser is available. Cannot stop dev servers."
    exit 1
  fi

  if [[ -z "$PIDS" ]]; then
    continue
  fi

  for PID in $PIDS; do
    kill "$PID" 2>/dev/null || true
    echo "Stopped process $PID on port $PORT."
    STOPPED=1
  done
done

if [[ "$STOPPED" -eq 0 ]]; then
  echo "No dev servers were listening on ports 3000, 5173, 5174, 5175, or 8000."
fi
