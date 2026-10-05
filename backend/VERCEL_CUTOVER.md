# Backend cutover status

## Status: GO

The production frontend is now routed to the Wahy Wa Namaa Vercel API.

- Frontend: https://wahy-wa-namaa-academy.vercel.app
- API: https://wahy-wa-namaa-api.vercel.app
- MongoDB Atlas: connected
- Authentication secrets: configured
- Private object storage: connected
- `/api/readiness`: expected to return 200 with `ready: true`
- Azure: removed from the active runtime and deployment path

## Current portability model

Vercel is the current runtime adapter only.

- `app.js`: provider-neutral Express application
- `server.js`: normal Node.js entry point for a VPS/Docker/Hostinger/etc.
- `api/index.js`: thin Vercel adapter
- `services/objectStorage.js`: storage abstraction
- `routes/cron.js`: provider-neutral HTTP scheduler trigger

## Future migration away from Vercel

1. Provision a Node.js host or VPS.
2. Copy production environment variables.
3. Run `cd backend && npm install && npm start`.
4. Move object storage to an S3-compatible provider if desired.
5. Point the frontend API rewrite/domain at the new backend.
6. Verify `/api/health`, `/api/readiness`, auth, uploads, bookings, and live sessions.
7. Switch traffic only after verification.

No business-route rewrite should be required.

## Optional integrations still requiring credentials

- LiveKit
- Email
- WhatsApp
- Telegram
- AI provider

These are independent of the core backend cutover.
