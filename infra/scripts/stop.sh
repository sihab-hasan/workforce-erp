#!/usr/bin/env bash

set -euo pipefail

PORTS=(5173 5174 5175)
STOPPED=0

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
  echo "No dev servers were listening on ports 5173-5175."
fi
