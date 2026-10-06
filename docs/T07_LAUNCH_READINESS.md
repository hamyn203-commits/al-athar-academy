# T07 — Launch Readiness

T07 is the final operational gate between a technically healthy deployment and a real public commercial launch.

## Why this phase exists

`/api/readiness` proves that the runtime, database, authentication, URLs, scheduler and object storage are operational. It must **not** be used as proof that an external service has completed a real end-to-end transaction.

Examples:

- A Resend API key can exist while the sending domain is still unverified.
- Paymob credentials can exist while no signed webhook and settlement has been verified.
- LiveKit credentials can exist while a real classroom join flow has never been tested.
- Twilio credentials can exist while a WhatsApp template/sender is not production-ready.

T07 therefore introduces a separate, fail-closed launch gate.

## T07.1 — Machine-readable launch gate

Status: COMPLETE ✅

Endpoint:

```
GET /api/launch-readiness
```

The endpoint exposes booleans and blocker codes only. It never returns credentials or secret values.

### Public-launch defaults

Public mode requires:

1. Core production readiness and database connectivity.
2. A HTTPS custom academy domain (not a `.vercel.app` hostname) for `SITE_URL` and `FRONTEND_URL`.
3. Email configured, sending domain verified and a real E2E delivery verified.
4. Paymob configured and a real Test/E2E checkout + signed webhook verified.
5. LiveKit configured and a real classroom E2E verified.
6. WhatsApp configured and a real E2E notification verified.

### Verification flags

Flags are operational evidence markers. They must be changed to `true` only after the named real-world test succeeds.

```env
LAUNCH_MODE=public
LAUNCH_REQUIRED_FEATURES=email,paymob,livekit,whatsapp

EMAIL_DOMAIN_VERIFIED=false
EMAIL_E2E_VERIFIED=false
PAYMOB_E2E_VERIFIED=false
LIVEKIT_E2E_VERIFIED=false
WHATSAPP_E2E_VERIFIED=false
```

For a controlled beta, `LAUNCH_MODE=closed-beta` can be used with an explicit `LAUNCH_REQUIRED_FEATURES` list. This does not convert an unverified service into a verified one; it only narrows the beta scope.

### T07.1 production evidence

- GitHub PR #27 CI passed.
- Master commit `9e063af20f8cae2078aeee957c4004d6b748bd1f` deployed successfully.
- Frontend and API production deployments reached `READY`.
- `/api/readiness` returned HTTP 200 with `ready: true`.
- `/api/launch-readiness` correctly returned HTTP 503 with explicit launch blockers and no secret values.
- No frontend or API runtime errors were observed in the post-deploy verification window.

## T07.2 — Operational closure checklist

Status: IN PROGRESS

### T07.2a — runtime brand cleanup

Status: COMPLETE ✅

- Removed legacy Al-Athar meeting/email identities from active backend runtime paths.
- Added production safety regression checks so those identities cannot reappear.
- PR #28 passed frontend/backend CI and was merged.

### T07.2b — communication delivery truth

Status: COMPLETE ✅

- Production WhatsApp/Telegram/Push fallbacks never report simulated console output as real delivery.
- Notification records mark unavailable providers as failed rather than sent.
- Undelivered teacher OTP records are removed when the email provider rejects delivery.
- Regression tests cover the fail-closed behavior.
- PR #29 CI passed; master commit `0c96239fbb81b8e6942490597c315116ee0874f9` deployed with frontend and API both READY.

### T07.2c — WhatsApp provider alignment

Status: IN PROGRESS

- Launch readiness accepts either Meta WhatsApp Cloud API or Twilio WhatsApp.
- The selected configured provider is reported without exposing any credential values.
- Regression coverage verifies both provider paths and incomplete-config fail-closed behavior.

### External-service closure checklist

Before a public GO decision:

- [ ] Custom domain purchased, connected, HTTPS active and production URLs changed.
- [ ] Resend sending domain verified.
- [ ] OTP delivered to at least two external test inboxes.
- [ ] Paymob Test checkout completed.
- [ ] Paymob signed webhook accepted once and replay rejected/idempotent.
- [ ] Payment status becomes succeeded only from server-side verified settlement.
- [ ] Enrollment/fulfillment created exactly once.
- [ ] LiveKit teacher + student + guardian/observer flow verified.
- [ ] WhatsApp reminder reaches a real opted-in test number.
- [ ] Student registration/login/refresh/logout smoke test passes.
- [ ] Teacher onboarding/OTP/application/admin review smoke test passes.
- [ ] Guardian-child authorization and redaction smoke test passes.
- [ ] Upload/private-read/delete smoke test remains green.
- [ ] Backup/restore runbook reviewed and one restore drill recorded.
- [ ] Production runtime error scan is clean after the final deploy.
- [ ] Manual GitHub `Launch Readiness` workflow passes.

## Current known blockers

At creation of T07:

- Email transport is configured, but Resend is restricted to the account test address until a sending domain is verified.
- Paymob integration code is merged, but production/test merchant credentials and E2E settlement proof are not configured.
- WhatsApp is not configured.
- LiveKit is not configured.
- The academy still uses the Vercel hostname instead of a custom public domain.

These are launch blockers, not code-health blockers.
