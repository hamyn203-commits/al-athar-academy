# Sync backend/.env + defaults to Azure App Service (al-athar-api)
# Usage: .\scripts\sync-azure-env.ps1 [-Subscription "Azure for Students"]

param(
    [string]$Subscription = "Azure for Students",
    [string]$ResourceGroup = "al-athar-rg",
    [string]$AppName = "al-athar-api",
    [switch]$FromLocalEnv
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root "backend\.env"
$exampleFile = Join-Path $root "backend\.env.example"

az account set --subscription $Subscription | Out-Null

$defaults = @{
    NODE_ENV = "production"
    PORT = "8080"
    WEBSITES_PORT = "8080"
    FRONTEND_URL = "https://al-athar-academy.vercel.app"
    SITE_URL = "https://al-athar-academy.vercel.app"
    API_PUBLIC_URL = "https://al-athar-api.azurewebsites.net"
    ALLOWED_ORIGINS = "https://al-athar-academy.vercel.app,https://al-athar-academy-*.vercel.app,http://localhost:5173,http://localhost:5174"
    OPENAI_MODEL = "gpt-4o-mini"
    GEMINI_MODEL = "gemini-2.0-flash"
    AWS_REGION = "us-east-1"
    BEDROCK_MODEL = "global.anthropic.claude-sonnet-4-5-20250929-v1:0"
    DEFAULT_MEETING_PROVIDER = "jitsi"
    JWT_EXPIRES_IN = "15m"
    JWT_REFRESH_EXPIRES_IN = "7d"
    EMAIL_FROM = "Al-Athar <noreply@alathar.edu>"
}

$skipIfEmpty = @(
    "MONGODB_URI", 
    "JWT_SECRET", 
    "JWT_REFRESH_SECRET", 
    "AWS_BEARER_TOKEN_BEDROCK", 
    "RESEND_API_KEY", 
    "LIVEKIT_API_KEY", 
    "LIVEKIT_API_SECRET", 
    "TELEGRAM_BOT_TOKEN", 
    "TWILIO_ACCOUNT_SID", 
    "TWILIO_AUTH_TOKEN", 
    "SEED_SECRET"
)

function Parse-EnvFile($path) {
    $map = @{}
    if (-not (Test-Path $path)) { return $map }
    Get-Content $path | ForEach-Object {
        if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
            $map[$matches[1]] = $matches[2].Trim().Trim('"')
        }
    }
    $map
}

$merged = @{}
foreach ($k in $defaults.Keys) { $merged[$k] = $defaults[$k] }

foreach ($k in (Parse-EnvFile $exampleFile).Keys) {
    if (-not $merged.ContainsKey($k)) { $merged[$k] = "" }
}

if ($FromLocalEnv -and (Test-Path $envFile)) {
    foreach ($entry in (Parse-EnvFile $envFile).GetEnumerator()) {
        if ($entry.Value) { $merged[$entry.Key] = $entry.Value }
    }
}

$existing = az webapp config appsettings list --name $AppName --resource-group $ResourceGroup -o json | ConvertFrom-Json
$existingNames = $existing | ForEach-Object { $_.name }

$toSet = @()
foreach ($entry in $merged.GetEnumerator()) {
    if ($skipIfEmpty -contains $entry.Key -and ($existingNames -contains $entry.Key)) { continue }
    if ($entry.Key -in $skipIfEmpty -and -not $entry.Value) { continue }
    $toSet += "$($entry.Key)=$($entry.Value)"
}

Write-Host "Syncing $($toSet.Count) settings to $AppName..." -ForegroundColor Cyan
az webapp config appsettings set --name $AppName --resource-group $ResourceGroup --settings $toSet --output none
Write-Host "Done. Health: https://$AppName.azurewebsites.net/api/health" -ForegroundColor Green
