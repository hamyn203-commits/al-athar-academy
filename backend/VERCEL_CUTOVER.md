# Backend cutover runbook

Candidate API:
`https://wahy-wa-namaa-api.vercel.app`

Current frontend remains routed to Azure until this document reaches **GO**.

Migration status:
- MongoDB Atlas integration: connected to Vercel Production + Preview
- Candidate API deployment: active
- External object storage: pending


## Current architecture

- Frontend: Vercel
- Current production API: Azure (kept as rollback)
- Candidate API: Vercel Express adapter
- Database: existing MongoDB, connection still needs to be copied
- File storage: provider-neutral S3-compatible adapter, credentials still need to be configured
- Live classroom: LiveKit keys still need to be copied if the feature is used
- Scheduler: provider-neutral `/api/cron/reminders` endpoint is ready

## Required environment values before GO

Core:
- `MONGODB_URI`
- `JWT_SECRET` — already configured on candidate
- `JWT_REFRESH_SECRET` — already configured on candidate

Object storage:
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT` when using R2/B2/MinIO
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_BASE_URL`
- `S3_FORCE_PATH_STYLE` when required

Feature keys as applicable:
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TELEGRAM_BOT_TOKEN`
- AI provider keys

## Readiness rules

`GET /api/health` must return 200.

`GET /api/readiness` must return 200 and:
- `ready: true`
- `databaseConfigured: true`
- `authConfigured: true`
- `storageConfigured: true`

Run locally or in GitHub Actions:

```bash
cd backend
API_URL=https://wahy-wa-namaa-api.vercel.app REQUIRE_READY=true npm run smoke
```

## GO sequence

1. Readiness returns 200.
2. Test register/login/refresh/logout.
3. Test teachers/courses/booking.
4. Test LiveKit token generation when keys are configured.
5. Test one direct object upload and a private document read.
6. Change frontend API rewrite from Azure to:
   `https://wahy-wa-namaa-api.vercel.app/api/:path*`
7. Deploy frontend.
8. Verify production flows.
9. Keep Azure online for rollback for at least 48 hours.
10. Remove Azure only after error logs stay clean.

## Moving away from Vercel later

The API is still normal Express:
`npm start`

Move environment values to the new host, point the frontend rewrite/API domain to it,
and keep the same MongoDB and S3-compatible storage. Vercel-specific code is limited
to the thin adapter and deployment config.
