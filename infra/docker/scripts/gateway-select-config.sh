#!/bin/sh
set -eu

mkdir -p /etc/nginx/templates

if [ "${ENABLE_TLS:-false}" = "true" ]; then
  cert_name="${TLS_CERT_NAME:-}"
  cert="/etc/letsencrypt/live/${cert_name}/fullchain.pem"
  key="/etc/letsencrypt/live/${cert_name}/privkey.pem"

  if [ -z "$cert_name" ] || [ ! -s "$cert" ] || [ ! -s "$key" ]; then
    echo >&2 "ERROR: ENABLE_TLS=true but certificate files are missing."
    echo >&2 "Run: bash scripts/docker-certbot.sh init"
    exit 1
  fi

  cp /opt/workforce/nginx/gateway-tls.conf.template /etc/nginx/templates/default.conf.template
else
  cp /opt/workforce/nginx/gateway-http.conf.template /etc/nginx/templates/default.conf.template
fi
