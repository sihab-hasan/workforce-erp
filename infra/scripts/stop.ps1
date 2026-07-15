Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Ports = @(5173, 5174, 5175)
$Stopped = @()

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
  Write-Host "No dev servers were listening on ports 5173-5175."
}
