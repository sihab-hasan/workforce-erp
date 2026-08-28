#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo '[1/8] Source security checks'
python3 scripts/security-source-check.py

echo '[2/8] PHP runtime'
php -r 'if (version_compare(PHP_VERSION,"8.3.0","<")) {fwrite(STDERR,"PHP 8.3+ required\n"); exit(1);} echo "PHP ".PHP_VERSION."\n";'

echo '[3/8] PHP syntax'
while IFS= read -r -d '' file; do php -l "$file" >/dev/null; done < <(find apps/api -type f -name '*.php' -not -path '*/vendor/*' -print0)

echo '[4/8] Composer dependency / Laravel runtime gate'
command -v composer >/dev/null || { echo 'Composer 2 is required for the production gate.' >&2; exit 1; }
composer --working-dir=apps/api validate --strict
composer --working-dir=apps/api install --no-interaction --prefer-dist
composer --working-dir=apps/api audit
php apps/api/artisan optimize:clear
php apps/api/artisan route:list >/dev/null
php apps/api/artisan migrate --pretend --no-interaction >/dev/null
php apps/api/artisan test

echo '[5/8] Node/pnpm gate'
command -v pnpm >/dev/null || { echo 'pnpm is required for the production gate.' >&2; exit 1; }
pnpm install --frozen-lockfile
pnpm audit --audit-level high
pnpm validate
pnpm check:imports
pnpm typecheck
pnpm lint
pnpm test --if-present
pnpm build

echo '[6/8] Docker configuration'
command -v docker >/dev/null || { echo 'Docker is required for deployment validation.' >&2; exit 1; }
docker compose --env-file .env.docker.production.example -f infra/docker-compose.yml config >/dev/null

echo '[7/8] Production configuration assertions'
grep -q '^APP_DEBUG=false$' .env.docker.production.example
grep -q '^SESSION_SECURE_COOKIE=true$' .env.docker.production.example
grep -q '^SMS_DRIVER=http$' .env.docker.production.example

echo '[8/8] Final source re-check'
python3 scripts/security-source-check.py

echo 'PRODUCTION SECURITY RELEASE GATE: PASSED'
