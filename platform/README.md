# Wahy Wa Namaa — Experimental V2 Scaffold

> **Status: FROZEN / NOT PRODUCTION**

The active academy is the React/Vite frontend at the repository root plus the portable Express backend in `backend/`. Both production projects deploy through Vercel from `master`.

This `platform/` directory is an experimental Next.js + NestJS + Prisma scaffold retained only for future architecture evaluation. It is not connected to production traffic, production authentication, MongoDB, or the live deployment pipeline.

## Rules

- Do not implement production fixes here unless a dedicated V2 migration is explicitly started.
- Do not point DNS, frontend routes, or API clients at this scaffold.
- The active source of truth remains the root Vite app and `backend/`.
- Any future V2 migration must be route-by-route, with data migration, security parity, automated tests, and a rollback plan.

## Local exploration only

```bash
cd platform
npm install
npm run dev:web
npm run dev:api
```

The scaffold can be removed later if the team decides to keep the current portable Express architecture long term.
