# Backend Runtime Portability

The Wahy Wa Namaa backend is a standard Express application. Vercel is only a temporary runtime adapter.

## Runtime entry points

- `app.js` — Express application and all business routes. No provider-specific server startup.
- `server.js` — normal Node.js entry point for VPS, Docker, Render, Railway, Hostinger, AWS, etc.
- `api/index.js` — thin Vercel adapter that exports the same Express app.
- `routes/cron.js` — provider-neutral HTTP trigger for scheduled reminder jobs.

## Moving away from Vercel later

A future host only needs:

```bash
cd backend
npm install
NODE_ENV=production npm start
```

Set the same environment variables and point DNS/API traffic to the new host. No route or business-logic rewrite is required.

## Files

The application does not treat Vercel's filesystem as persistent storage. Set
`FILE_STORAGE_DRIVER=external` on serverless runtimes. Existing file upload routes
will be migrated to provider-neutral object storage before production traffic is switched.

## Scheduler

On a persistent Node host, set `ENABLE_IN_PROCESS_SCHEDULER=true`.
On serverless hosts, call `GET /api/cron/reminders` with
`Authorization: Bearer <CRON_SECRET>` from the scheduler of your choice.

This keeps scheduling independent from the hosting provider.
