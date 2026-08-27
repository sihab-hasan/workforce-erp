#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.docker"
COMPOSE_FILE="$ROOT_DIR/infra/docker-compose.yml"
ACTION="${1:-}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE does not exist. Run: bash scripts/docker-setup.sh" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

set_env_value() {
  local key="$1" value="$2" tmp
  tmp="$(mktemp)"
  awk -v key="$key" -v value="$value" '
    index($0, key "=") == 1 { print key "=" value; next }
    { print }
  ' "$ENV_FILE" > "$tmp"
  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
}

case "$ACTION" in
  init)
    : "${LETSENCRYPT_EMAIL:?Set LETSENCRYPT_EMAIL in .env.docker first}"
    : "${WEB_HOST:?WEB_HOST is required}"
    : "${ERP_HOST:?ERP_HOST is required}"
    : "${ADMIN_HOST:?ADMIN_HOST is required}"
    : "${API_HOST:?API_HOST is required}"

    if [[ "$WEB_HOST" == *.localhost || "$WEB_HOST" == "localhost" ]]; then
      echo "ERROR: Let's Encrypt cannot issue certificates for localhost. Set real public domains first." >&2
      exit 1
    fi

    cert_name="${TLS_CERT_NAME:-$WEB_HOST}"

    # ACME HTTP-01 must be reachable before certificate issuance.
    set_env_value ENABLE_TLS false
    set_env_value TLS_CERT_NAME "$cert_name"
    compose up -d --build gateway

    compose --profile tls-tools run --rm certbot certonly \
      --webroot -w /var/www/certbot \
      --email "$LETSENCRYPT_EMAIL" \
      --agree-tos --no-eff-email \
      --cert-name "$cert_name" \
      -d "$WEB_HOST" \
      -d "$ERP_HOST" \
      -d "$ADMIN_HOST" \
      -d "$API_HOST"

    set_env_value ENABLE_TLS true
    set_env_value COMPOSE_PROFILES tls
    compose up -d --force-recreate gateway certbot-renew

    echo "TLS enabled for $WEB_HOST, $ERP_HOST, $ADMIN_HOST and $API_HOST"
    ;;

  renew)
    compose --profile tls-tools run --rm certbot renew --webroot -w /var/www/certbot
    compose exec gateway nginx -s reload
    ;;

  *)
    echo "Usage: bash scripts/docker-certbot.sh {init|renew}" >&2
    exit 2
    ;;
esac
