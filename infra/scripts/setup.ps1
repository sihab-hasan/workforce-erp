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

Write-Host "Setup complete."
