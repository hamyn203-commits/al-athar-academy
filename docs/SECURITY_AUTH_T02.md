# T02 — Security & Authentication

This is the fixed execution record for roadmap task T02. The task was developed on an isolated branch while T01.5 remained blocked by the Vercel Hobby deployment quota.

## Status

| Point | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| T02.1 | Strong production JWT secrets | ✅ | Production rejects secrets under 32 characters, known placeholder markers, and reuse of the same access/refresh secret. |
| T02.2 | Refresh token / cookie security | ✅ | Refresh token remains HttpOnly + Secure in production, session version revocation is retained, browser API traffic is same-origin through `/api`, production credential origins fail closed, and refresh/logout require a trusted Origin. |
| T02.3 | Centralized protected / role routes | ✅ | `ProtectedRoute` guards admin, student, teacher, guardian dashboards and authenticated live/meeting/notification routes before page rendering. Page-level guards remain as defense in depth. |
| T02.4 | Role and ownership authorization audit | ✅ | Fixed assignment enrollment/instructor ownership, guardian circle-child ownership, public circle PII exposure, and LMS enrollment/teacher ownership boundaries. Existing student/teacher/guardian/admin ownership checks were reviewed on sensitive routes. |
| T02.5 | Private data and upload access audit | ✅ | Teacher private documents, homework and assignment files remain ownership/role protected and private-cache controlled; direct uploads are purpose/type/size/identity scoped; quiz answer keys are removed from LMS lesson responses. |

## Security regressions locked in CI

`backend/scripts/security-contracts.cjs` now prevents regressions in:

- privileged public registration
- production bootstrap/demo gates
- access/refresh token storage behavior
- weak/reused JWT secrets
- trusted-origin CORS and cookie-session endpoints
- centralized frontend role guards
- circle public PII and guardian ownership
- assignment enrollment/instructor ownership
- LMS payment/enrollment boundaries
- quiz answer-key exposure
- production mock-mode behavior
- private teacher document storage

## Deliberate boundaries

The following are not part of T02:

- broad unit/integration/E2E test construction → T03
- visual/UX route work → T04
- full upload/download/delete E2E flows → T05
- real payment processing/webhooks → T06
- observability platform expansion → T07

## Release gate

T02 is **code-complete** when CI passes on the T02 branch.

T02 is **roadmap-complete** only after:

- [x] T02 branch CI passes.
- [ ] T01.5 is verified on the latest production deployment.
- [ ] T02 final diff is rechecked against the then-current `master`.
- [ ] T02 PR is merged only after those checks.

Current state: **5/5 code-complete, merge intentionally blocked by T01.5.**
