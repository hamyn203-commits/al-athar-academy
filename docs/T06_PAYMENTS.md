# T06 — Payments

T06 owns real payment processing, webhook verification and payment-backed fulfillment.

## T06.1 — Payment integrity foundation

Status: COMPLETE ✅

Audit findings:

- There is no production card-payment gateway yet.
- Paid course enrollment correctly fails closed with `PAYMENT_REQUIRED`.
- Donation payment links are optional external links and do not provide automatic settlement confirmation.
- Public donation statistics previously counted both `pledged` and `confirmed` records as if both represented received funds.
- Donation totals were aggregated across different currencies into one number.
- There was no provider-agnostic payment record or webhook-event idempotency ledger.

Implementation:

- Added provider-agnostic `Payment` records.
- Monetary values use integer `amountMinor`; float settlement values are not persisted.
- Course-enrollment payments require student + course relations.
- Donation payments require a donation relation.
- Added explicit payment states: created, pending, succeeded, failed, cancelled and refunded.
- Added a monotonic payment-state transition contract.
- Added `PaymentWebhookEvent` with unique `provider + eventId` identity for replay/idempotency protection.
- Webhook event storage keeps a SHA-256 payload hash instead of raw payment payloads.
- Public donation statistics now include `confirmed` records only.
- Public donation totals are grouped by currency rather than mixed together.
- Mock/no-database donation statistics fail safely to zero values.
- Paid enrollment remains blocked until a provider-backed settlement path is implemented.

Acceptance gate:

- frontend route/safety/build checks pass.
- backend syntax/security checks pass.
- all payment integrity and existing automated tests pass.
- GitHub PR CI passes before merge.
- production readiness and runtime errors remain healthy after deployment.

Boundary:

T06.1 does not claim that card payments are live. Provider checkout creation, signature-verified webhooks and provider settlement belong to the next T06 task.

Verification evidence:
- GitHub PR #24 CI run `37507772093`: frontend + backend successful.
- Backend automated suite: 32/32 tests passed.
- Production master SHA: `e254b9f1d763c5dcf18ee30867428d9daabef816`.
- Frontend deployment `dpl_7b3uBaLUExgUvaoYuXUC2Z86f3pK`: READY.
- API deployment `dpl_EY8RmAD5y3wAziU3e9mHETuXyBvN`: READY.
- Production `/api/readiness` returned HTTP 200 with `ready: true`.
- Production `/api/donations/stats` returned the currency-safe confirmed-only response shape.
- Production `/ar/donate` returned HTTP 200.
- No frontend or API runtime errors were observed in the post-deploy smoke window.

Important boundary:
- T06.1 establishes payment truth, state and idempotency contracts only.
- No provider checkout or automatic settlement is live yet.
