# Playwright E2E — Academy QA

This suite tests the academy through the browser against an isolated local MongoDB database. It never needs TinyFish and does not mutate production data.

## Covered now

- Student registration through the Arabic UI.
- Student trial booking.
- Teacher acceptance of the trial request.
- Teacher completion + 1–5 evaluation controls.
- Full session report persistence and student visibility.
- Post-trial **اشتراك** CTA.
- Trial allowance display and the three-trial limit state.

Backend integration tests remain responsible for lower-level authorization, ledger idempotency, and API edge cases.

## Run locally

Requirements:

- Node.js 22.
- MongoDB running locally on port 27017.

Then:

```bash
npm install
cd backend && npm install && cd ..
npx playwright install chromium
npm run test:e2e
```

The Playwright config resets only the database named by `MONGODB_URI`. The default is:

```
mongodb://127.0.0.1:27017/wahy_playwright
```

Do not point `MONGODB_URI` at a production or shared database.

Useful commands:

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:report
```

## CI

GitHub Actions starts a temporary MongoDB service, installs Chromium, seeds an isolated database, launches the API and Vite app, and runs the suite with one worker for deterministic state.

On failure, the workflow uploads:

- HTML Playwright report.
- Screenshots.
- Video.
- Trace.
- JUnit XML.

These artifacts make browser failures reproducible without paying for a metered browser agent.
