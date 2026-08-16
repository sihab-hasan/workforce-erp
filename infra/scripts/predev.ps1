Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ApiDir = Join-Path $RootDir "apps\api"
$AutoloadPath = Join-Path $ApiDir "vendor\autoload.php"
$EnvPath = Join-Path $ApiDir ".env"
$EnvExamplePath = Join-Path $ApiDir ".env.example"

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
  throw "PHP is required but was not found in PATH."
}

if (-not (Test-Path -LiteralPath $AutoloadPath)) {
  if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    throw "Laravel dependencies are missing and Composer was not found. Install Composer, then run pnpm dev again."
  }

  Write-Host "Laravel vendor dependencies are missing; running composer install..."
  composer --working-dir=$ApiDir install
  if ($LASTEXITCODE -ne 0) {
    throw "Composer install failed with exit code $LASTEXITCODE."
  }
}

if (-not (Test-Path -LiteralPath $EnvPath)) {
  if (-not (Test-Path -LiteralPath $EnvExamplePath)) {
    throw "apps/api/.env.example is missing."
  }

  Write-Host "Creating apps/api/.env from .env.example..."
  Copy-Item -LiteralPath $EnvExamplePath -Destination $EnvPath
}

$runtimeDirectories = @(
  (Join-Path $ApiDir "storage\framework\cache\data"),
  (Join-Path $ApiDir "storage\framework\sessions"),
  (Join-Path $ApiDir "storage\framework\views"),
  (Join-Path $ApiDir "bootstrap\cache")
)

foreach ($directory in $runtimeDirectories) {
  if (-not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
  }
}

$envContents = Get-Content -LiteralPath $EnvPath -Raw
if ($envContents -notmatch '(?m)^APP_KEY=\S+') {
  Write-Host "Generating Laravel APP_KEY..."
  Push-Location $ApiDir
  try {
    php artisan key:generate --force
    if ($LASTEXITCODE -ne 0) {
      throw "Laravel key generation failed with exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}

Write-Host "Local development preflight complete (localhost)."
