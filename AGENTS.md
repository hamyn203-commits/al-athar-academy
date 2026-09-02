# Autopilot — أكاديمية الأثر

> اقرأ **ROADMAP.md** أولاً. القواعد الكاملة في `.cursor/rules/autopilot.mdc`.

## قواعد — إلزامية

- **ممنوع push مباشر على `master`** — كل تغيير عبر branch + Pull Request.
- **CI لازم يعدّي** (`npm run lint` + `npm run build`) قبل المِرج.
- **ملفات محرّمة** بدون موافقة بشرية صريحة:
  `backend/middleware/auth.js` · `backend/routes/setup.js` · `backend/server.js` · `AZURE_KEYS.md` · `.github/workflows/**` · `.cursor/rules/**` · `package.json` · `platform/`
- **ممنوع** `npm install` أو تعديل الاعتماديات.
- **ممنوع** `prettier` / `eslint --fix` على ملف كامل.
- **ممنوع** تعطيل أي حماية (rate limit · CORS · helmet · CSP).
- مشكلة جديدة = بند جديد تحت، مش إصلاح في نفس الـ PR.
- لو أكتر من وكيل شغال: كل واحد يملك ملفاته ومحدش يلمس ملفات غيره.

## V6.4 — الطابور النشط: خطة الإصلاح

٤٥ مشكلة موثّقة ومقسّمة على ١٣ مسار وكيل.

| # | البند | الحالة |
|---|-------|--------|
| 6.4.0 | البوابة: CI (lint+build) + تقييد نطاق Autopilot | 🔄 |
| 6.4.1 | موجة ١ — مسار الأمان (١١ بند) | pending |
| 6.4.2 | موجة ١ — مسار نظام التصميم (٤ بنود) | pending |
| 6.4.3 | مستقل — الأدمن · الاختبارات · النظافة (٥ بنود) | pending |
| 6.4.4 | موجة ٢ — ٦ مسارات بالتوازي (١٨ بند) | pending |
| 6.4.5 | موجة ٣ — التوحيد النهائي (٥ بنود) | pending |

⚠️ **6.4.2 لازم يخلص ويتمرج قبل أي شغل CSS تاني** — مخرجه هو العقد اللي بيبني عليه ٨ بنود تصميم.

## V6.3 — مكتمل ✅

| # | المهمة | الحالة |
|---|--------|--------|
| 6.3.1 | Stripe/PayPal donate live | ✅ |
| 6.3.2 | 9 لغات UI كاملة | ✅ |
| 6.3.3 | Analytics admin | ✅ |
| 6.3.4 | CDN للـ uploads | ✅ |

## V6.2 — مكتمل ✅

دروس seed لكل دورة (3+ lessons)، Quiz → gamification points، شهادات PDF batch، Azure keys doc + sync script.

## V6.1 — مكتمل ✅

AI mic، Bedrock chain، PWA push، library 6 videos، livekit health، v6.1.0

## V6.0 — مكتمل ✅

Live demo، bootstrap 4 courses، landing، empty states، sitemap، admin health
