# Autopilot — أكاديمية الأثر V4

> للـ Agent الليلي: نفّذ **بند واحد** من الطابور كل تشغيل، ثم حدّث هذا الملف.

## قواعد ثابتة
- لا تلمس `platform/` إلا بطلب صريح
- `npm run build` قبل push
- push `master` → GitHub ينشر Azure + Vercel تلقائياً
- Azure subscription: **Azure for Students** | RG: `al-athar-rg` | App: `al-athar-api`
- Frontend: https://al-athar-academy.vercel.app | API: https://al-athar-api.azurewebsites.net

## طابور التطوير

| # | المهمة | الأولوية | الحالة |
|---|--------|----------|--------|
| 1 | روابط V4 في GlobalFooter (donate, library, leaderboard, app, women, kids) | P1 | done |
| 2 | سكربت seed بيانات تجريبية (معلم + دورة) عند DB فارغ | P1 | done |
| 3 | لعبة أطفال ثانية (حروف الهجاء) | P2 | pending |
| 4 | تفعيل Bedrock/OpenAI عند وجود مفاتيح في Azure env | P2 | pending |
| 5 | LiveKit غرفة تجريبية عند وجود LIVEKIT_* | P3 | pending |
| 6 | إشعارات email للتبرعات/التوظيف عند RESEND + ADMIN_EMAIL | P2 | pending |
| 7 | شارات gamification شهرية في Leaderboard | P3 | pending |
| 8 | تحسين PWA offline (صفحات ar/, /app, /leaderboard) | P3 | pending |
| 9 | Admin: فلتر دورات حسب program في لوحة الدورات | P3 | pending |
| 10 | توثيق setup-bedrock + sync-azure في README | P3 | pending |

## بعد كل مهمة
1. علّم الحالة `done` في الجدول أعلاه
2. commit message: `feat(autopilot): <summary>` أو `fix(autopilot): ...`
3. push origin master

## سكربتات مفيدة
```powershell
.\scripts\sync-azure-env.ps1 -FromLocalEnv
.\scripts\setup-github-secrets.ps1
.\scripts\deploy-all.ps1
gh workflow run deploy-production.yml
```
