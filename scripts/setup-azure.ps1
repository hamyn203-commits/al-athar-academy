# ============================================
# أكاديمية الأثر الطيب - Azure Deployment Setup
# ============================================
# هذا السكربت يُنشئ كل موارد Azure اللازمة
# شغّله بعد تسجيل الدخول بـ: az login

$ErrorActionPreference = "Stop"

# --- الإعدادات ---
$RESOURCE_GROUP = "alneda-rg"
$LOCATION = "eastus"
$STATIC_WEB_APP = "alneda-web"
$APP_SERVICE_PLAN = "alneda-plan"
$APP_SERVICE = "alneda-api"
$COSMOS_DB = "alneda-cosmos"
$STORAGE_ACCOUNT = "alnedarecordings"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " أكاديمية الأثر الطيب - إعداد Azure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. إنشاء Resource Group
Write-Host "`n[1/5] إنشاء Resource Group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
Write-Host "  تم إنشاء $RESOURCE_GROUP في $LOCATION" -ForegroundColor Green

# 2. إنشاء Static Web App للـ Frontend (مجاني)
Write-Host "`n[2/5] إنشاء Static Web App (Frontend)..." -ForegroundColor Yellow
$swa = az staticwebapp create `
  --name $STATIC_WEB_APP `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Free `
  --output json | ConvertFrom-Json

$DEPLOYMENT_TOKEN = az staticwebapp secrets list --name $STATIC_WEB_APP --resource-group $RESOURCE_GROUP --query "properties.apiKey" --output tsv
Write-Host "  تم إنشاء: https://$STATIC_WEB_APP.azurestaticapps.net" -ForegroundColor Green
Write-Host "  Deployment Token: $DEPLOYMENT_TOKEN" -ForegroundColor Magenta

# 3. إنشاء App Service Plan + App Service للـ Backend
Write-Host "`n[3/5] إنشاء App Service (Backend)..." -ForegroundColor Yellow
az appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku B1 `
  --is-linux `
  --output none

az webapp create `
  --name $APP_SERVICE `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --runtime "NODE:20-lts" `
  --output none

az webapp config appsettings set `
  --name $APP_SERVICE `
  --resource-group $RESOURCE_GROUP `
  --settings `
    WEBSITE_RUN_FROM_PACKAGE=1 `
    NODE_ENV=production `
    PORT=8080 `
  --output none

Write-Host "  تم إنشاء: https://$APP_SERVICE.azurewebsites.net" -ForegroundColor Green

# 4. إنشاء Cosmos DB (MongoDB API)
Write-Host "`n[4/5] إنشاء Cosmos DB..." -ForegroundColor Yellow
az cosmosdb create `
  --name $COSMOS_DB `
  --resource-group $RESOURCE_GROUP `
  --kind MongoDB `
  --server-version 4.2 `
  --locations regionName=$LOCATION failoverPriority=0 `
  --output none

$COSMOS_KEY = az cosmosdb keys list --name $COSMOS_DB --resource-group $RESOURCE_GROUP --query "primaryMasterKey" --output tsv
$COSMOS_URI = "mongodb://$COSMOS_DB`:${COSMOS_KEY}@${COSMOS_DB}.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@${COSMOS_DB}@"

az webapp config appsettings set `
  --name $APP_SERVICE `
  --resource-group $RESOURCE_GROUP `
  --settings MONGODB_URI="$COSMOS_URI" `
  --output none

Write-Host "  تم إنشاء Cosmos DB وربطه بالـ Backend" -ForegroundColor Green

# 5. إنشاء Storage Account للتسجيلات الصوتية
Write-Host "`n[5/5] إنشاء Storage Account..." -ForegroundColor Yellow
az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS `
  --kind StorageV2 `
  --output none

$STORAGE_KEY = az storage account keys list --account-name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "[0].value" --output tsv
$STORAGE_CONNECTION = "DefaultEndpointsProtocol=https;AccountName=${STORAGE_ACCOUNT};AccountKey=${STORAGE_KEY};EndpointSuffix=core.windows.net"

az storage container create `
  --name "student-recordings" `
  --account-name $STORAGE_ACCOUNT `
  --account-key $STORAGE_KEY `
  --output none

az webapp config appsettings set `
  --name $APP_SERVICE `
  --resource-group $RESOURCE_GROUP `
  --settings AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" `
  --output none

Write-Host "  تم إنشاء Storage Account وربطه" -ForegroundColor Green

# --- تفعيل CORS ---
Write-Host "`nإعداد CORS..." -ForegroundColor Yellow
$WEBAPP_URL = "https://$STATIC_WEB_APP.azurestaticapps.net"
az webapp cors add `
  --name $APP_SERVICE `
  --resource-group $RESOURCE_GROUP `
  --allowed-origins $WEBAPP_URL "http://localhost:5173" `
  --output none

# --- الملخص ---
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " تم إعداد كل شيء بنجاح!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Frontend URL:  https://$STATIC_WEB_APP.azurestaticapps.net" -ForegroundColor White
Write-Host " Backend URL:   https://$APP_SERVICE.azurewebsites.net" -ForegroundColor White
Write-Host ""
Write-Host " أضف هذه Secrets في GitHub Settings > Secrets:" -ForegroundColor Yellow
Write-Host "   AZURE_STATIC_WEB_APPS_TOKEN = $DEPLOYMENT_TOKEN" -ForegroundColor Magenta
Write-Host "   VITE_API_BASE_URL          = https://$APP_SERVICE.azurewebsites.net" -ForegroundColor Magenta
Write-Host "   AZURE_CREDENTIALS          = (من: az ad sp create-for-rbac)" -ForegroundColor Magenta
Write-Host ""
Write-Host " التكلفة التقديرية: ~13$/شهرياً (App Service B1 فقط)" -ForegroundColor Cyan
Write-Host "   Static Web Apps = مجاني" -ForegroundColor Green
Write-Host "   Cosmos DB       = مجاني (Free Tier 1000 RU)" -ForegroundColor Green
Write-Host "   Storage Account = ~0.05$/شهرياً" -ForegroundColor Green
Write-Host "   App Service B1  = ~13$/شهرياً" -ForegroundColor Yellow
