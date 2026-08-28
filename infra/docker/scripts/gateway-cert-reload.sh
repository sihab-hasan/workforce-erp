#!/bin/sh
set -eu

if [ "${ENABLE_TLS:-false}" = "true" ]; then
  # Certbot renews the files in a shared volume. Reload Nginx periodically so
  # renewed certificates are picked up without exposing the Docker socket.
  (
    while sleep 21600; do
      nginx -s reload >/dev/null 2>&1 || true
    done
  ) &
fi
