# مزامنة GitHub Actions secrets للنشر التلقائي
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-github-secrets.ps1

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$authPaths = @(
  "$env:APPDATA\xdg.data\com.vercel.cli\auth.json",
  "$env:LOCALAPPDATA\com.vercel.cli\auth.json"
)
$token = $null
foreach ($p in $authPaths) {
  if (Test-Path $p) {
    $token = (Get-Content $p -Raw | ConvertFrom-Json).token
    if ($token) { break }
  }
}
if (-not $token) { throw 'Vercel token not found — run: npx vercel login' }

$vercelJson = Join-Path $repoRoot '.vercel\project.json'
if (-not (Test-Path $vercelJson)) {
  npx vercel link --project al-athar-academy --yes | Out-Null
}
$proj = Get-Content $vercelJson -Raw | ConvertFrom-Json

Write-Host 'Setting GitHub secrets...' -ForegroundColor Cyan
$token | gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID --body $proj.orgId
gh secret set VERCEL_PROJECT_ID --body $proj.projectId
gh secret set VITE_API_BASE_URL --body 'https://al-athar-api.azurewebsites.net'

Write-Host 'Done. Secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VITE_API_BASE_URL' -ForegroundColor Green
Write-Host 'Push to master or run: gh workflow run deploy-production.yml' -ForegroundColor Yellow
