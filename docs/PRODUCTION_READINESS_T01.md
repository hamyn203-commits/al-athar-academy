# T01 — Production Readiness

This file is the fixed execution record for the first roadmap task. T01 is executed serially and does not include work owned by later tasks.

## Scope

| Point | Requirement | Status | Evidence / acceptance gate |
| --- | --- | --- | --- |
| T01.1 | Production environment variables | ✅ Code/config audit complete | Core API production variables are present in Vercel; backend now has a sanitized `npm run check:env` validator. No secret values are written to logs or this repository. |
| T01.2 | Unified version and runtime | ✅ Complete | Frontend + backend release version: `6.3.0`. Node runtime: `22.x` in frontend, backend, Docker, CI, and Vercel projects. |
| T01.3 | MongoDB production verification | 🟡 Pending deployment verification | New `/api/readiness` actively connects to MongoDB and only returns ready when the live connection is established. Acceptance: production health workflow passes after merge. |
| T01.4 | Object-storage configuration | ✅ Configuration verified | Production API uses `FILE_STORAGE_DRIVER=external` with connected Vercel Blob storage. Full upload/download/delete E2E belongs to T05 and is intentionally not duplicated here. |
| T01.5 | Production readiness endpoint | 🟡 Pending deployment verification | Endpoint now validates required configuration plus live DB connectivity. Acceptance: direct API and frontend rewrite health checks both report `"ready":true` after production deployment. |
| T01.6 | Backup / restore strategy | ✅ Strategy documented | `backend/BACKUP_RESTORE.md` defines RPO/RTO targets, isolated restore procedure, validation and launch gate. Actual Atlas restore drill remains an operational pre-launch check, not a code claim. |

## Release gates for closing T01

T01 can be marked complete only when all of the following are true:

- [ ] Pull-request CI passes.
- [ ] Frontend production deployment is READY.
- [ ] Backend production deployment is READY.
- [ ] Production `/api/readiness` returns HTTP 200 with `"ready": true`.
- [ ] Frontend `/api/readiness` rewrite returns the same ready response.
- [ ] Production teachers smoke probe succeeds.
- [ ] No new critical runtime error is introduced by this release.

## Non-overlap rule

The following are explicitly deferred to their roadmap owners:

- Route guards / role authorization hardening → T02.
- Full automated test suite → T03.
- Full upload/download/delete E2E → T05.
- Payment flows → T06.
- Monitoring platform expansion → T07.

This prevents T01 from silently expanding into later tasks.
