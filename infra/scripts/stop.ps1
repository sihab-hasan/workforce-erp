Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Ports = @(3000, 5173, 5174, 5175, 8000)
$Stopped = @()

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ComposeBase = Join-Path $RootDir "infra\compose\compose.yml"
$ComposeLocal = Join-Path $RootDir "infra\compose\compose.local.yml"
docker compose -f $ComposeBase -f $ComposeLocal down --remove-orphans

foreach ($Port in $Ports) {
  $Connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $Connections) {
    continue
  }

  foreach ($Connection in $Connections) {
    $ProcessId = $Connection.OwningProcess
    if ($Stopped -contains $ProcessId) {
      continue
    }

    try {
      Stop-Process -Id $ProcessId -Force -ErrorAction Stop
      $Stopped += $ProcessId
      Write-Host "Stopped process $ProcessId on port $Port."
    }
    catch {
      Write-Warning "Failed to stop process $ProcessId on port $Port. $($_.Exception.Message)"
    }
  }
}

if ($Stopped.Count -eq 0) {
  Write-Host "No dev servers were listening on ports 3000, 5173, 5174, 5175, or 8000."
}
