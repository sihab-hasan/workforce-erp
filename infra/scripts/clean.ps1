Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Remove-PathTree {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return $true
  }

  for ($Attempt = 1; $Attempt -le 5; $Attempt++) {
    try {
      Get-ChildItem -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue |
        ForEach-Object {
          if ($_.Attributes -band [System.IO.FileAttributes]::ReadOnly) {
            $_.Attributes = $_.Attributes -bxor [System.IO.FileAttributes]::ReadOnly
          }
        }

      Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
      return $true
    }
    catch {
      try {
        & cmd.exe /d /c "rmdir /s /q `"$Path`""
        if (-not (Test-Path -LiteralPath $Path)) {
          return $true
        }
      }
      catch {
      }

      if ($Attempt -eq 5) {
        Write-Warning "Failed to remove '$Path'. Close any process using it and try again. $($_.Exception.Message)"
        return $false
      }
      Start-Sleep -Milliseconds 500
    }
  }
}

$Targets = @(
  (Join-Path $RootDir ".turbo"),
  (Join-Path $RootDir "node_modules"),
  (Join-Path $RootDir "apps\web\dist"),
  (Join-Path $RootDir "apps\portal\dist"),
  (Join-Path $RootDir "apps\admin\dist")
)

Write-Host "Cleaning workspace build artifacts..."
$FailedTargets = @()
foreach ($Target in $Targets) {
  if (-not (Remove-PathTree -Path $Target)) {
    $FailedTargets += $Target
  }
}

Get-ChildItem -Path (Join-Path $RootDir "apps") -Directory -Recurse |
  Where-Object { $_.Name -eq "node_modules" } |
  Sort-Object FullName -Descending |
  ForEach-Object {
    if (-not (Remove-PathTree -Path $_.FullName)) {
      $FailedTargets += $_.FullName
    }
  }

Get-ChildItem -Path (Join-Path $RootDir "packages") -Directory -Recurse |
  Where-Object { $_.Name -in @("node_modules", "dist") } |
  Sort-Object FullName -Descending |
  ForEach-Object {
    if (-not (Remove-PathTree -Path $_.FullName)) {
      $FailedTargets += $_.FullName
    }
  }

if ($FailedTargets.Count -gt 0) {
  throw "Clean completed with blocked paths:`n - $($FailedTargets -join "`n - ")"
}

Write-Host "Clean complete."
