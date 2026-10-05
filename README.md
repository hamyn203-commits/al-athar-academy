# أكاديمية وَحْيٌ وَنَمَاء — Wahy Wa Namaa Academy

منصة لتعليم القرآن الكريم والتجويد، مع LMS، جلسات مباشرة، أدوات AI اختيارية، ولوحات للطالب والمعلم وولي الأمر والإدارة.

## Production

- Frontend: https://wahy-wa-namaa-academy.vercel.app
- API: https://wahy-wa-namaa-api.vercel.app
- Database: MongoDB Atlas
- Files: private object storage behind a provider-neutral adapter
- Production branch: `master`

Vercel is the current runtime, not a hard dependency. The Express application can run on a VPS, Docker, Hostinger, Render, AWS, or another Node.js host. File storage can move to any S3-compatible provider such as Cloudflare R2, AWS S3, Backblaze B2, Wasabi, or MinIO.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite |
| Backend | Express 5 + Node.js 22 |
| Database | MongoDB Atlas |
| File storage | Private direct uploads through storage abstraction |
| Live classroom | LiveKit integration ready; production keys required |
| V2 scaffold | Next.js + NestJS + Prisma under `platform/` |

## Local development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm start

# Frontend — second terminal
cp .env.example .env
npm install
npm run dev
```

For local frontend development, set:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Deployment

Both frontend and backend are linked to GitHub and deploy automatically from `master` through Vercel Git Integration.

The production API is routed through the frontend as well:

```text
https://wahy-wa-namaa-academy.vercel.app/api/*
        ↓
https://wahy-wa-namaa-api.vercel.app/api/*
```

Useful checks:

```bash
curl https://wahy-wa-namaa-api.vercel.app/api/health
curl https://wahy-wa-namaa-api.vercel.app/api/readiness
curl https://wahy-wa-namaa-academy.vercel.app/api/readiness
```

A deployment is ready for traffic only when `/api/readiness` returns `"ready": true`.

## CI

- `CI`: frontend build + advisory lint + backend syntax check.
- `Health Check (Production)`: checks production every 6 hours.
- `Production Verification`: manual end-to-end infrastructure verification.
- `Refresh npm lockfiles`: keeps lockfiles synchronized after dependency changes.
- Azure deployment is retired and retained only as a manual legacy notice.

## Security baseline

Production currently includes:

- Public registration cannot request privileged roles.
- Separate access and refresh JWT secrets.
- Admin bootstrap disabled by default.
- Teacher phone verification proof is signed and short-lived.
- Private teacher documents are not publicly exposed.
- Homework and assignment file access is ownership/role checked.
- Live-room access is tied to the actual booked session.
- Large files upload directly to private object storage instead of passing through the API function.
- Production fails closed when core database configuration is missing.

## Optional production services

These features require their own provider credentials and should not be considered active until configured:

- LiveKit: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- Email: `RESEND_API_KEY`
- WhatsApp: `TWILIO_*`
- Telegram: `TELEGRAM_BOT_TOKEN`
- AI: OpenAI, Gemini, or configured Bedrock credentials

## Project structure

```text
src/          React frontend
backend/      Portable Express API
platform/     V2 Next.js/NestJS scaffold
public/       PWA and public assets
scripts/      Deployment/SEO helper scripts
```

For backend portability details, see:
- `backend/RUNTIME_PORTABILITY.md`
- `backend/OBJECT_STORAGE.md`
- `backend/VERCEL_CUTOVER.md`

---

**نتعلم القرآن، نحفظه، وننمو به**
