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

if grep -Eq '^DB_CONNECTION=sqlite$' "$ROOT_DIR/apps/api/.env"; then
  touch "$ROOT_DIR/apps/api/database/database.sqlite"
fi

echo "Applying Workforce ERP database migrations..."
php "$ROOT_DIR/apps/api/artisan" migrate --force

echo "Seeding local authentication bootstrap account (local environment only)..."
php "$ROOT_DIR/apps/api/artisan" db:seed --force

echo "Setup complete. Start the API with: php apps/api/artisan serve --host=localhost --port=8000"
