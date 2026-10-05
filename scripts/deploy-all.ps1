# Wahy Wa Namaa — production push helper
# Vercel Git Integration deploys both frontend and backend from master.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "=== Wahy Wa Namaa deploy ===" -ForegroundColor Cyan

Write-Host "[1/4] Frontend build..." -ForegroundColor Yellow
npm install --no-audit --no-fund
npm run build -- --emptyOutDir

Write-Host "[2/4] Backend syntax check..." -ForegroundColor Yellow
Push-Location backend
npm install --no-audit --no-fund
npm run check
Pop-Location

Write-Host "[3/4] Push master..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
  git add -A
  git commit -m "chore: deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
git push origin master

Write-Host "[4/4] Production verification..." -ForegroundColor Yellow
Start-Sleep -Seconds 25

$api = Invoke-RestMethod "https://wahy-wa-namaa-api.vercel.app/api/readiness"
if (-not $api.ready) { throw "API is not ready" }

$proxy = Invoke-RestMethod "https://wahy-wa-namaa-academy.vercel.app/api/readiness"
if (-not $proxy.ready) { throw "Frontend API rewrite is not ready" }

Write-Host "Production ready." -ForegroundColor Green
Write-Host "Frontend: https://wahy-wa-namaa-academy.vercel.app"
Write-Host "Backend:  https://wahy-wa-namaa-api.vercel.app"
