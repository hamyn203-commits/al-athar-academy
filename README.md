# أكاديمية الأثر الطيب — Al-Athar Academy

منصة تعليم إسلامي عالمية: تحفيظ القرآن، التجويد، LMS، AI، وجلسات مباشرة.

## Stack

| الطبقة | التقنية |
|--------|---------|
| Frontend | React 19 + Vite + Tailwind |
| Backend | Express 5 + MongoDB |
| V2 (قيد الهجرة) | Next.js + NestJS + Prisma |

## التشغيل المحلي

```bash
# 1. Backend
cd backend
cp .env.example .env    # عدّل MONGODB_URI
npm install
npm start               # http://localhost:5000

# 2. Frontend (نافذة ثانية)
npm install
npm run dev             # http://localhost:5173
```

## متغيرات Frontend

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000
```

## المسارات الرئيسية

| المسار | الوصف |
|--------|--------|
| `/` | الصفحة الرئيسية |
| `/courses` | الدورات + LMS |
| `/ai` | مركز الذكاء الاصطناعي |
| `/teachers` | المعلمون |
| `/student/dashboard` | لوحة الطالب |
| `/teacher/dashboard` | لوحة المعلم |
| `/admin` | لوحة الإدارة |

## LMS سريع

1. Admin → `/admin` → «إنشاء دورة LMS تجريبية»
2. طالب → `/courses/quran-memorization-beginner` → تسجيل → «ابدأ التعلم»

## AI

- بدون مفاتيح: وضع محلي (fallback)
- مع `OPENAI_API_KEY` أو `GEMINI_API_KEY` في `backend/.env`: AI سحابي

## الإشعارات

- داخل التطبيق: جرس في Header
- Email: `RESEND_API_KEY`
- Telegram: `TELEGRAM_BOT_TOKEN`
- WhatsApp: `TWILIO_*`

## الاجتماعات

عند قبول الحصة يُنشأ رابط Jitsi تلقائياً. اضبط `DEFAULT_MEETING_PROVIDER` أو `ZOOM_MEETING_BASE_URL`.

## البناء والنشر (أوتوماتيك)

```powershell
# مزامنة env مع Azure
.\scripts\sync-azure-env.ps1 -FromLocalEnv

# secrets لـ GitHub Actions (Vercel + seed)
.\scripts\setup-github-secrets.ps1

# push master → ينشر Backend (Azure) + Frontend (Vercel) تلقائياً
git push origin master

# نشر يدوي كامل
gh workflow run deploy-production.yml
```

| Workflow | الوظيفة |
|----------|---------|
| Deploy Backend to Azure | `backend/**` → App Service |
| Deploy Frontend to Vercel | `src/**` → production |
| Health Check | كل 6 ساعات |
| Nightly Bootstrap | seed معلم/دورة لو DB فاضي |

## Bedrock / AI على Azure

```powershell
# 1. ضع المفاتيح في backend/.env
# AWS_BEARER_TOKEN_BEDROCK=...
# BEDROCK_MODEL=global.anthropic.claude-sonnet-4-5-20250929-v1:0

# 2. مزامنة
.\scripts\sync-azure-env.ps1 -FromLocalEnv

# 3. تحقق
curl https://al-athar-api.azurewebsites.net/api/health
# features.ai / features.bedrock = true
```

سكربت مساعد: `scripts/setup-bedrock-claude.ps1`

## Autopilot (تطوير تلقائي)

- طابور المهام: [AGENTS.md](./AGENTS.md)
- Cursor Automation: تطوير ليلي ~3 ص
- قاعدة Cursor: `.cursor/rules/autopilot.mdc`

## البناء والنشر

```bash
npm run build           # Frontend → dist/
```

- Frontend: Vercel / Azure Static Web Apps
- Backend: Azure App Service
- راجع [DEPLOYMENT.md](./DEPLOYMENT.md)

## V2 Platform

```bash
cd platform && npm install
npm run dev:web   # :3000
npm run dev:api   # :4000
```

راجع [platform/README.md](./platform/README.md)

## الهيكل

```
├── src/           React frontend
├── backend/       Express API
├── platform/      Next.js + NestJS scaffold
└── public/        PWA + assets
```

---

**أثرٌ يساوي حياة** — [al-athar-academy.vercel.app](https://al-athar-academy.vercel.app)
