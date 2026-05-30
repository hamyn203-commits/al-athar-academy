# دليل النشر على Azure - أكاديمية الأثر الطيب

## المتطلبات

1. **Azure CLI** مثبت: [تحميل](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
2. **حساب GitHub** مع repo للمشروع
3. **حساب Azure** مع رصيد

---

## الخطوة 1: تسجيل الدخول لـ Azure

```bash
az login
```

ستفتح نافذة المتصفح لتسجيل الدخول.

---

## الخطوة 2: تشغيل سكربت الإعداد التلقائي

```powershell
cd "D:\اكادمية الاثر الطيب"
powershell -ExecutionPolicy Bypass -File scripts\setup-azure.ps1
```

هذا السكربت سيُنشئ تلقائياً:
- ✅ Static Web App للـ Frontend (مجاني)
- ✅ App Service للـ Backend (~$13/شهر)
- ✅ Cosmos DB (قاعدة بيانات)
- ✅ Storage Account (للتسجيلات الصوتية)
- ✅ CORS مُعد تلقائياً

---

## الخطوة 3: رفع المشروع على GitHub

```bash
cd "D:\اكادمية الاثر الطيب"
git init
git add .
git commit -m "Initial commit - Al-Athar Academy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alneda-academy.git
git push -u origin main
```

---

## الخطوة 4: إضافة Secrets في GitHub

اذهب إلى: **GitHub Repo → Settings → Secrets and variables → Actions**

أضف هذه الـ Secrets (القيم من ناتج السكربت):

| Secret Name | Value |
|-------------|-------|
| `AZURE_STATIC_WEB_APPS_TOKEN` | Deployment Token من ناتج السكربت |
| `VITE_API_BASE_URL` | `https://alneda-api.azurewebsites.net` |
| `AZURE_CREDENTIALS` | ناتج الأمر التالي |

للحصول على `AZURE_CREDENTIALS`:

```bash
az ad sp create-for-rbac --name "alneda-deploy" --role contributor --scopes /subscriptions/YOUR_SUB_ID/resourceGroups/alneda-rg --sdk-auth
```

انسخ الناتج JSON كاملاً وضعه في `AZURE_CREDENTIALS`.

---

## الخطوة 5: النشر التلقائي

بعد إضافة الـ Secrets، أي push لفرع `main` سيُشغّل النشر تلقائياً:

- **Frontend**: يتنشر على Static Web Apps
- **Backend**: يتنشر على App Service

---

## الروابط النهائية

| الخدمة | الرابط |
|--------|--------|
| الموقع | `https://alneda-web.azurestaticapps.net` |
| الـ API | `https://alneda-api.azurewebsites.net` |
| Health Check | `https://alneda-api.azurewebsites.net/api/health` |

---

## التكلفة الشهرية

| الخدمة | التكلفة |
|--------|---------|
| Static Web Apps | **مجاني** |
| Cosmos DB (Free Tier) | **مجاني** |
| Storage Account | ~$0.05 |
| App Service B1 | ~$13 |
| **المجموع** | **~$13/شهر** |

---

## أوامر مفيدة

```bash
# مشاهدة حالة الموارد
az resource list --resource-group alneda-rg --output table

# مشاهدة logs الـ Backend
az webapp log tail --name alneda-api --resource-group alneda-rg

# إعادة تشغيل الـ Backend
az webapp restart --name alneda-api --resource-group alneda-rg

# حذف كل الموارد (إذا أردت)
az group delete --name alneda-rg --yes --no-wait
```

---

## دومين مخصص (اختياري)

لربط دومين مثل `alneda.com`:

```bash
# للـ Frontend
az staticwebapp hostname set --hostname alneda.com --name alneda-web --resource-group alneda-rg

# للـ Backend
az webapp config hostname add --hostname api.alneda.com --webapp-name alneda-api --resource-group alneda-rg
```

ثم أضف DNS records عند مزود الدومين.
