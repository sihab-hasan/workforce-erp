Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is required but was not found in PATH."
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw "pnpm is required but was not found in PATH."
}

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
  throw "PHP is required but was not found in PATH."
}

if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
  throw "Composer is required but was not found in PATH."
}

Write-Host "Installing workspace dependencies..."
Set-Location $RootDir
pnpm install --frozen-lockfile=false
if ($LASTEXITCODE -ne 0) {
  throw "pnpm install failed with exit code $LASTEXITCODE."
}

Write-Host "Installing Laravel API dependencies..."
composer --working-dir=apps/api install
if ($LASTEXITCODE -ne 0) {
  throw "Composer install failed with exit code $LASTEXITCODE."
}

$ApiEnvPath = Join-Path $RootDir "apps\api\.env"
if (-not (Test-Path -LiteralPath $ApiEnvPath)) {
  Copy-Item -LiteralPath (Join-Path $RootDir "apps\api\.env.example") -Destination $ApiEnvPath
  php apps/api/artisan key:generate
  if ($LASTEXITCODE -ne 0) {
    throw "Laravel key generation failed with exit code $LASTEXITCODE."
  }
}

$ApiEnv = Get-Content -LiteralPath $ApiEnvPath -Raw
if ($ApiEnv -match '(?m)^DB_CONNECTION=sqlite$') {
  $SqlitePath = Join-Path $RootDir "apps\api\database\database.sqlite"
  if (-not (Test-Path -LiteralPath $SqlitePath)) {
    New-Item -ItemType File -Path $SqlitePath | Out-Null
  }
}

Write-Host "Applying Workforce ERP database migrations..."
php apps/api/artisan migrate --force
if ($LASTEXITCODE -ne 0) {
  throw "Laravel migration failed with exit code $LASTEXITCODE."
}

Write-Host "Seeding local authentication bootstrap account (local environment only)..."
php apps/api/artisan db:seed --force
if ($LASTEXITCODE -ne 0) {
  throw "Laravel database seeding failed with exit code $LASTEXITCODE."
}

Write-Host "Setup complete. Start the API with: php apps/api/artisan serve --host=localhost --port=8000"
