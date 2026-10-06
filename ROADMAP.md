# Roadmap — أكاديمية وَحْيٌ وَنَمَاء

> **Production:** v6.3 runtime | **Hardening track:** T01 → T07 | **Current:** T07 Launch Readiness

## المسار التنفيذي الحالي

| المرحلة | النطاق | الحالة |
|---|---|---|
| **T01** | Production runtime, database, environment, storage and backup readiness | ✅ مكتمل |
| **T02** | Authentication, authorization, route guards and teacher email OTP | ✅ مكتمل |
| **T03** | Integration tests, upload/data hardening and guardian safeguarding | ✅ مكتمل |
| **T04** | Visual/UX routes, locale-safe navigation and localized recovery | ✅ مكتمل |
| **T05** | Private file lifecycle and production object-store E2E | ✅ مكتمل |
| **T06.1** | Payment truth, integer money, state transitions and webhook idempotency | ✅ مكتمل |
| **T06.2** | Paymob checkout + signed settlement implementation | ✅ الكود محفوظ كخيار دفع آلي مستقبلي، وليس شرط الإطلاق الحالي |
| **T06.3** | Manual transfer + private proof + admin approval settlement | 🟡 قيد الدمج والتحقق |
| **T07.1** | Machine-readable public launch gate | ✅ مكتمل ومثبت على Production |
| **T07.2** | Domain, Email, Manual Payments, LiveKit, WhatsApp and critical user-flow closure | 🟡 المرحلة النشطة |
| **T07.3** | Final production smoke, runtime error scan and GO/NO-GO | ⏳ بعد T07.2 |

## بوابة الإطلاق العام

لا يعتبر المشروع جاهزًا للإطلاق التجاري لمجرد أن `/api/readiness` يعيد `ready: true`.

الإطلاق العام يحتاج أيضًا نجاح `/api/launch-readiness`، والذي يثبت:

- Custom production domain
- Resend verified sending domain + real OTP delivery
- Manual transfer E2E: real transfer proof → admin verification → exactly-once enrollment
- LiveKit real classroom E2E
- WhatsApp real notification E2E

راجع `docs/T07_LAUNCH_READINESS.md`.

## خارطة المنتج V7

خصائص المنتج الموثقة في `ACADEMY_PLAN.md` تظل مرجع المتطلبات الوظيفية. مسار T01–T07 هو مسار **production hardening and launch verification** ولا يلغي خارطة المنتج.

## Autopilot rules

1. لا تعتبر وجود API key دليلًا على نجاح خدمة خارجية.
2. نفّذ كل تطوير على branch/PR مع CI ناجح قبل الدمج.
3. لا تغيّر production verification flags إلى `true` إلا بعد اختبار E2E حقيقي.
4. `npm run build` + backend tests + security gates قبل الدمج.
5. حدّث `ROADMAP.md` و`AGENTS.md` مع كل إغلاق مرحلة.
