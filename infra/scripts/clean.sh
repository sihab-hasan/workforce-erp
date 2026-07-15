#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ ! -d "$ROOT_DIR/apps" || ! -d "$ROOT_DIR/packages" ]]; then
  echo "Workspace structure not found. Run this script from the repository checkout."
  exit 1
fi

echo "Cleaning workspace build artifacts..."
rm -rf \
  "$ROOT_DIR/.turbo" \
  "$ROOT_DIR/node_modules" \
  "$ROOT_DIR/apps/web/dist" \
  "$ROOT_DIR/apps/portal/dist" \
  "$ROOT_DIR/apps/admin/dist"

find "$ROOT_DIR/packages" -type d \( -name dist -o -name node_modules \) -prune -exec rm -rf {} +
find "$ROOT_DIR/apps" -type d -name node_modules -prune -exec rm -rf {} +

echo "Clean complete."
