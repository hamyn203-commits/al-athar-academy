# وَحْيٌ وَنَمَاء — Project Overview

Last updated: 2026-10-06

## Production architecture

The production application is intentionally portable and is not tied to a permanent hosting vendor.

```
Browser
  |
  v
Vercel Frontend — React 19 + Vite
  |
  | /api/*
  v
Vercel API — Express 5 adapter
  |
  +--> MongoDB Atlas
  +--> Private object storage adapter
  |      current: Vercel Blob
  |      portable target: S3-compatible storage
  |
  +--> Optional external services when configured
         LiveKit / Email / WhatsApp / AI
```

Production URLs:

- Frontend: `https://wahy-wa-namaa-academy.vercel.app`
- API: `https://wahy-wa-namaa-api.vercel.app`
- Runtime readiness: `/api/readiness`
- Commercial launch readiness: `/api/launch-readiness`

Azure is retired from the active runtime. The old Azure material is retained only as historical rollback documentation and must not be treated as the production deployment path.

## Active source of truth

- Frontend: repository root `src/`
- Backend: `backend/`
- Production branch: `master`
- Deployment: native Vercel Git integration
- Database: MongoDB Atlas
- File storage: provider-neutral storage layer in `backend/services/objectStorage.js`

The `platform/` Next.js/NestJS scaffold is **frozen and non-production**. See `platform/README.md`.

## Brand

- Arabic: **وَحْيٌ وَنَمَاء**
- English: **Wahy Wa Namaa Academy**
- Arabic tagline: **نتعلم القرآن، نحفظه، وننمو به**
- English tagline: **Learn • Memorize • Grow • With the Quran**

No placeholder phone numbers, fake social profiles, fake teacher statistics, fake ratings, or fake payment confirmations should appear in production UI.

## Authentication

Production authentication uses:

- Short-lived JWT access token held in browser memory only.
- Refresh token in an `HttpOnly`, `Secure` production cookie.
- Refresh-token versioning for revocation.
- Public registration restricted to student and guardian roles.
- Teacher onboarding uses a dedicated verified-phone application flow.
- Admin bootstrap is disabled in production unless explicitly enabled with a bootstrap secret.

Legacy access/refresh tokens in `localStorage` are cleared automatically by the current frontend.

## Authorization and private data

Important server-side checks include:

- Session ownership for students and teachers.
- Guardian-child membership checks.
- Live room membership derived on the server; client `isHost` hints are not trusted.
- Homework and assignment upload ownership checks.
- Assignment grading restricted to the owning instructor or admin.
- Teacher identity/certificate documents stored privately and served only through authorized routes.
- Direct file uploads are purpose-, MIME-, size-, and identity-scoped.

## Storage portability

Current production uses a private Vercel Blob store because it is operationally simple during this phase.

The application storage interface is provider-neutral. It already supports S3-compatible configuration, so a future migration to Cloudflare R2, AWS S3, Backblaze B2, Wasabi, or MinIO/VPS does not require rewriting business routes.

Large browser files use direct object-storage upload instead of passing through the Express request body.

## Mock data policy

Mock data is allowed only for local development when no database is configured.

Production must fail closed rather than returning demo users, fake metrics, fake courses, fake payments, or fake submissions. A CI safety scan protects critical regressions.

## CI and deployment checks

`.github/workflows/ci.yml` performs:

1. frontend dependency installation
2. production safety scan
3. frontend build
4. advisory lint report
5. backend dependency installation
6. backend syntax checks

Production verification and scheduled health-check workflows probe the live frontend and API readiness endpoints. A separate manual `Launch Readiness` workflow checks the stricter commercial launch gate.

## Public contact configuration

Public contact/social channels are environment-driven:

```
VITE_SUPPORT_EMAIL
VITE_SUPPORT_PHONE
VITE_SUPPORT_ADDRESS
VITE_FACEBOOK_URL
VITE_WHATSAPP_URL
VITE_INSTAGRAM_URL
VITE_YOUTUBE_URL
VITE_TELEGRAM_URL
```

If a channel is not configured, the UI hides it and uses the internal contact page instead of displaying a placeholder.

## External features not enabled by code alone

The application contains integrations for the following services, but each feature becomes operational only after valid production credentials/configuration are supplied:

- LiveKit
- Resend/email
- Twilio WhatsApp
- Telegram
- AI providers

The health/readiness API reports their configured state.

## Payments

The first-launch payment flow is manual and admin-reviewed:

- the student transfers through a configured InstaPay, Vodafone Cash or optional bank destination;
- the student uploads a private receipt/proof;
- an admin independently verifies that the funds were actually received;
- only the protected admin review endpoint can mark the payment succeeded and activate the course enrollment;
- enrollment fulfillment is transactional and exactly-once guarded.

Paymob checkout and signed webhook settlement code is retained behind fail-closed configuration as an optional future automated gateway. It is no longer a default public-launch dependency.

Manual payments are **not yet operationally verified for public launch** until a real controlled transfer, proof submission, admin approval and exactly-one enrollment are demonstrated in production.

## Development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm start
```

The same Express backend can later run on VPS, Docker, Hostinger, Render, AWS, or another Node.js host. The Vercel adapter is not the business application.

## Release rule

A production change is considered ready only when:

- frontend build succeeds,
- backend syntax check succeeds,
- production safety scan succeeds,
- latest Vercel deployments are READY,
- `/api/readiness` returns HTTP 200 with `ready: true`,
- for public commercial launch, `/api/launch-readiness` also returns HTTP 200 with `ready: true`,
- critical user flows are smoke-tested.

Do not infer that optional integrations are operational only because their UI exists.
