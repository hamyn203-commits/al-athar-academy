# T04 — Visual / UX Route Work

This is the execution record for roadmap task T04. The current repository explicitly assigns visual/UX route work to T04. Work owned by later roadmap tasks is not mixed into this phase.

## T04.1 — Route & navigation contract

Status: IN PROGRESS

Audit findings addressed by this task:

- Legacy dashboard redirects dropped the active locale.
- Login ignored the protected-route `redirect` query and always sent users to a hard-coded dashboard path.
- Login and registration success navigation used non-localized dashboard paths.
- Page-level auth redirects used non-localized `/login` and `/` destinations.
- Role mismatch handling sent authenticated users to the homepage instead of their own dashboard.
- Guardian legacy routing allowed admin access while the actual guardian dashboard route guard rejected admin, creating a redirect loop/inconsistent UX.

Implementation:

- One locale-safe navigation contract in `src/lib/navigation.js`.
- Role-aware dashboard destinations.
- Safe post-login redirect handling; external/protocol-relative redirects fail closed.
- Locale preservation across login, registration, legacy redirects, protected routes, logout and page-level auth guards.
- Guardian dashboard route guard aligned with the existing admin-capable guardian UI/backend.
- Blocking frontend route-contract check added to CI.

Acceptance gate:

- `npm run test:routes` passes.
- frontend production safety scan passes.
- frontend production build passes.
- existing backend test/security gates remain green.
- GitHub PR CI passes before merge.
- production route smoke checks pass after deployment.

Later T04 work will be driven by the remaining visual/UX route audit. Full file E2E, payments, SEO and release/domain work stay with their separate roadmap owners.
