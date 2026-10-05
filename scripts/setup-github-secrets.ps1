# Wahy Wa Namaa uses native Vercel Git Integration.
# VERCEL_TOKEN / VERCEL_ORG_ID / VERCEL_PROJECT_ID are not required by the active deployment path.

$ErrorActionPreference = 'Stop'

Write-Host "No GitHub deployment secrets are required for the active Vercel Git Integration." -ForegroundColor Green
Write-Host "Frontend: wahy-wa-namaa-academy" -ForegroundColor Cyan
Write-Host "Backend:  wahy-wa-namaa-api" -ForegroundColor Cyan
Write-Host "Production branch: master" -ForegroundColor Cyan
Write-Host ""
Write-Host "Runtime secrets belong in each Vercel project's Environment Variables, not in this script." -ForegroundColor Yellow
