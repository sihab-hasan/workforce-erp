#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found in PATH."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required but was not found in PATH."
  exit 1
fi

if ! command -v php >/dev/null 2>&1; then
  echo "PHP is required but was not found in PATH."
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "Composer is required but was not found in PATH."
  exit 1
fi

echo "Installing workspace dependencies..."
cd "$ROOT_DIR"
pnpm install --frozen-lockfile=false

echo "Installing Laravel API dependencies..."
composer --working-dir=apps/api install

if [[ ! -f "$ROOT_DIR/apps/api/.env" ]]; then
  cp "$ROOT_DIR/apps/api/.env.example" "$ROOT_DIR/apps/api/.env"
  php "$ROOT_DIR/apps/api/artisan" key:generate
fi

echo "Setup complete."
