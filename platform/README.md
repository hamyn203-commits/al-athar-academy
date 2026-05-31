# Al-Athar Academy Platform V2

Next.js + NestJS + PostgreSQL migration foundation.

## Structure

```
platform/
├── package.json            # npm workspaces
├── prisma/schema.prisma    # PostgreSQL schema
├── apps/web/               # Next.js 15 (port 3000)
└── apps/api/               # NestJS API (port 4000, prefix /api/v2)
```

## Quick Start

```bash
# V1 remains primary — run from repo root:
npm run dev                    # Frontend Vite :5173
cd backend && npm start        # Express API :5000

# V2 scaffold (optional):
cd platform
npm install
npm run dev:web                # Next.js :3000
npm run dev:api                # NestJS :4000
```

## Migration Strategy

1. V1 production on Vercel + Azure
2. V2 API at `/api/v2` alongside Express
3. Migrate auth → courses → dashboards route-by-route
4. Feature flags via `NEXT_PUBLIC_API_URL`

## Environment

Copy `backend/.env.example` for V1. For V2 web:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_V1_URL=http://localhost:5173
```
