# Autopilot — أكاديمية وَحْيٌ وَنَمَاء

> اقرأ `ROADMAP.md` و`docs/T07_LAUNCH_READINESS.md` أولاً.

## قواعد ثابتة

- المصدر الفعلي: root `src/` + `backend/`.
- لا تطوير production داخل `platform/`.
- كل تغيير على branch/PR مع CI قبل الدمج.
- لا تعتبر service configured = service verified.
- لا تضبط أي `*_E2E_VERIFIED=true` بدون اختبار حقيقي مسجل.
- لا تعرض secret values في health/readiness APIs أو logs.

## الطابور النشط

| المهمة | الحالة |
|---|---|
| T01 Production readiness | ✅ |
| T02 Security/auth | ✅ |
| T03 Testing/data safeguarding | ✅ |
| T04 UX/routes/locales | ✅ |
| T05 File lifecycle E2E | ✅ |
| T06.1 Payment integrity | ✅ |
| T06.2 Paymob code | ✅ implementation / ⏳ merchant E2E |
| **T07.1 Launch readiness gate** | 🟡 active |
| T07.2 External-service closure | ⏳ |
| T07.3 GO/NO-GO | ⏳ |

## Definition of public launch

Public launch requires both:

- `GET /api/readiness` → HTTP 200 + `ready: true`
- `GET /api/launch-readiness` → HTTP 200 + `ready: true`
