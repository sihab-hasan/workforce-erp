$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root
Write-Host '[1/7] Source security checks'; python scripts/security-source-check.py
Write-Host '[2/7] PHP runtime and syntax'; php -r 'if (version_compare(PHP_VERSION,"8.3.0","<")) { exit(1); }'
Get-ChildItem apps/api -Recurse -Filter *.php | Where-Object { $_.FullName -notmatch '[\\/]vendor[\\/]' } | ForEach-Object { php -l $_.FullName | Out-Null; if ($LASTEXITCODE -ne 0) { throw "PHP lint failed: $($_.FullName)" } }
if (-not (Get-Command composer -ErrorAction SilentlyContinue)) { throw 'Composer 2 is required for the production gate.' }
Write-Host '[3/7] Composer/Laravel'; composer --working-dir=apps/api validate --strict; composer --working-dir=apps/api install --no-interaction --prefer-dist; composer --working-dir=apps/api audit; php apps/api/artisan optimize:clear; php apps/api/artisan route:list | Out-Null; php apps/api/artisan migrate --pretend --no-interaction | Out-Null; php apps/api/artisan test
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw 'pnpm is required for the production gate.' }
Write-Host '[4/7] pnpm'; pnpm install --frozen-lockfile; pnpm audit --audit-level high; pnpm validate; pnpm check:imports; pnpm typecheck; pnpm lint; pnpm build
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker is required for deployment validation.' }
Write-Host '[5/7] Docker'; docker compose --env-file .env.docker.production.example -f infra/docker-compose.yml config | Out-Null
Write-Host '[6/7] Production configuration'; Select-String -Path .env.docker.production.example -Pattern '^APP_DEBUG=false$' | Out-Null; Select-String -Path .env.docker.production.example -Pattern '^SESSION_SECURE_COOKIE=true$' | Out-Null; Select-String -Path .env.docker.production.example -Pattern '^SMS_DRIVER=http$' | Out-Null
Write-Host '[7/7] Final source re-check'; python scripts/security-source-check.py
Write-Host 'PRODUCTION SECURITY RELEASE GATE: PASSED'
