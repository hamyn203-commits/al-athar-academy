# نشر كامل بأمر واحد (محلي) — البديل: push على master أو gh workflow run deploy-production.yml
param([switch]$SkipBackend, [switch]$SkipFrontend)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "=== Al-Athar deploy-all ===" -ForegroundColor Cyan

if (-not $SkipBackend) {
  Write-Host "[1/4] Sync Azure env..." -ForegroundColor Yellow
  & "$PSScriptRoot\sync-azure-env.ps1" -FromLocalEnv
  az webapp restart --name al-athar-api --resource-group al-athar-rg | Out-Null
}

Write-Host "[2/4] Git push (triggers GitHub Actions)..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
  git add -A
  git commit -m "chore: auto deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
git push origin master

if (-not $SkipFrontend) {
  Write-Host "[3/4] Trigger full-stack workflow..." -ForegroundColor Yellow
  gh workflow run deploy-production.yml
}

Write-Host "[4/4] Watch latest runs..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
gh run list --limit 3

Write-Host "`nLive URLs:" -ForegroundColor Green
Write-Host "  Frontend: https://al-athar-academy.vercel.app"
Write-Host "  Backend:  https://al-athar-api.azurewebsites.net/api/health"
