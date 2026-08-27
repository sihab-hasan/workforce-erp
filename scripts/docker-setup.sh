#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE_FILE="$ROOT_DIR/.env.docker.example"
ENV_FILE="$ROOT_DIR/.env.docker"

if ! command -v openssl >/dev/null 2>&1; then
  echo "ERROR: openssl is required to generate secure local secrets." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$EXAMPLE_FILE" "$ENV_FILE"
else
  echo "Using existing $ENV_FILE"
fi

replace_value() {
  local key="$1" value="$2" tmp
  tmp="$(mktemp)"
  awk -v key="$key" -v value="$value" '
    index($0, key "=") == 1 { print key "=" value; next }
    { print }
  ' "$ENV_FILE" > "$tmp"
  mv "$tmp" "$ENV_FILE"
}

if grep -q '^APP_KEY=__GENERATE_APP_KEY__$' "$ENV_FILE"; then
  replace_value APP_KEY "base64:$(openssl rand -base64 32 | tr -d '\n')"
fi

if grep -q '^DB_PASSWORD=__GENERATE_DB_PASSWORD__$' "$ENV_FILE" || \
   grep -q '^MYSQL_PASSWORD=__GENERATE_DB_PASSWORD__$' "$ENV_FILE"; then
  db_password="$(openssl rand -hex 24)"
  replace_value DB_PASSWORD "$db_password"
  replace_value MYSQL_PASSWORD "$db_password"
fi

if grep -q '^MYSQL_ROOT_PASSWORD=__GENERATE_MYSQL_ROOT_PASSWORD__$' "$ENV_FILE"; then
  replace_value MYSQL_ROOT_PASSWORD "$(openssl rand -hex 32)"
fi

if grep -q '^REDIS_PASSWORD=__GENERATE_REDIS_PASSWORD__$' "$ENV_FILE"; then
  replace_value REDIS_PASSWORD "$(openssl rand -hex 32)"
fi

if grep -q '^API_SHARED_TOKEN=__GENERATE_API_SHARED_TOKEN__$' "$ENV_FILE"; then
  replace_value API_SHARED_TOKEN "$(openssl rand -hex 32)"
fi

chmod 600 "$ENV_FILE"

echo "Docker environment ready: $ENV_FILE"
echo
printf '%s\n' \
  "Start the stack:" \
  "  docker compose --env-file .env.docker -f infra/docker-compose.yml up -d --build" \
  "" \
  "Check status:" \
  "  docker compose --env-file .env.docker -f infra/docker-compose.yml ps" \
  "" \
  "Local URLs:" \
  "  http://web.localhost" \
  "  http://erp.localhost" \
  "  http://admin.localhost" \
  "  http://api.localhost/api/health"
