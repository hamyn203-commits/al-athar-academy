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

## T06.2 — Paymob checkout and verified settlement

Status: IN PROGRESS

Provider decision:
- Paymob is the primary Egypt payment provider for the first real gateway integration.
- Unified Checkout redirect is used so card/payment credentials stay on Paymob-hosted pages.
- The implementation remains disabled until merchant Test credentials and Integration IDs are configured.

Implementation:
- Added a Paymob Intention API client using `Authorization: Token <secret>`.
- Paymob regional API hosts are allowlisted and HTTPS-only.
- Checkout amount and currency come exclusively from the published Course record.
- Each checkout creates an internal Payment record before creating a Paymob Intention.
- Internal Payment id is sent as `special_reference` for callback correlation.
- Unified Checkout URL is generated server-side from Paymob Public Key + returned client secret.
- Transaction callbacks verify the documented 20-field HMAC-SHA512 signature before any state change.
- Webhook events are persisted with provider + event id replay protection and SHA-256 payload hashes.
- Payment state, Enrollment fulfillment, Progress creation and course enrollment stats are committed inside a MongoDB transaction.
- Success, failure, void/cancel and refund callbacks update server-side payment state.
- Refunds disable the related course Enrollment.
- The browser redirect is UX-only and cannot mark a payment as successful.
- A protected payment-return page polls the academy payment-status endpoint.
- Free courses continue to use the existing free enrollment path.
- Paid direct LMS enrollment remains blocked with `PAYMENT_REQUIRED`.
- Public provider configuration exposes only whether Paymob is configured; no payment secret is exposed.

Required production configuration before enabling test payments:
- `PAYMOB_ENABLED=true`
- `PAYMOB_BASE_URL=https://accept.paymob.com`
- `PAYMOB_SECRET_KEY`
- `PAYMOB_PUBLIC_KEY`
- `PAYMOB_HMAC_SECRET`
- `PAYMOB_INTEGRATION_IDS` (comma-separated online Integration IDs)

Acceptance gate:
- Paymob HMAC / intention unit tests pass.
- payment integrity and existing backend tests remain green.
- frontend route, safety and production build checks pass.
- GitHub PR CI passes before merge.
- production deploy remains fail-closed while Paymob credentials are absent.
- after merchant Test credentials are configured, a Paymob Test checkout + signed webhook must be verified before T06.2 is marked COMPLETE.

Boundary:
T06.2 code can be merged safely before merchant credentials exist because `PAYMOB_ENABLED` defaults to false. It must not be described as live payment until the Paymob Test transaction and webhook are verified.


## T06.3 — Manual transfer and admin-reviewed settlement

Status: IMPLEMENTED — awaiting production E2E verification 🟡

Launch decision:
- The first public payment flow uses manual bank/mobile-wallet transfers rather than requiring Paymob.
- Supported launch destinations are configured through environment variables for InstaPay, Vodafone Cash and optional bank transfer.
- Paymob code remains available as a future automatic gateway but is not a default public-launch dependency.

Implementation:
- Paid course price and currency still come only from the server-side published Course record.
- Student transfer proofs are uploaded through the private object-storage path with the dedicated `payment-proof` purpose.
- A student can submit one pending manual payment per paid course at a time.
- Proof ownership is verified server-side before a Payment record is created.
- Manual Payment records store the transfer method, optional transfer reference, private proof reference and review audit fields.
- Only admins can list manual payment submissions, read private proofs, approve or reject them.
- Approval moves `pending -> succeeded` and creates Enrollment/Progress/course statistics inside a MongoDB transaction.
- Rejection moves `pending -> failed` and does not grant course access.
- Repeated or concurrent review attempts fail closed after the payment leaves `pending`.
- The receipt image itself is never treated as settlement proof; the admin must verify actual receipt of funds outside the academy before approval.

Production configuration:
- `MANUAL_PAYMENT_ENABLED=true`
- `MANUAL_PAYMENT_RECIPIENT_NAME`
- at least one of:
  - `MANUAL_PAYMENT_INSTAPAY`
  - `MANUAL_PAYMENT_VODAFONE_CASH`
  - `MANUAL_PAYMENT_BANK_DETAILS`

Launch evidence:
- Keep `MANUAL_PAYMENT_E2E_VERIFIED=false` until a real controlled transfer is submitted, reviewed by an admin, and exactly one enrollment is created.
