# T04 — Visual / UX Route Work

This is the execution record for roadmap task T04. The current repository explicitly assigns visual/UX route work to T04. Work owned by later roadmap tasks is not mixed into this phase.

## T04.1 — Route & navigation contract

Status: COMPLETE ✅

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

Verification evidence:
- GitHub CI run `37489047890`: frontend + backend successful.
- Production master SHA: `5f68510a4f15a513741155029319df44edd1753a`.
- Frontend and API deployments reached READY.
- Localized login/dashboard route shells returned HTTP 200.
- `/api/readiness` returned HTTP 200 with `ready: true`.
- No API runtime errors were observed in the post-deploy smoke window.

Later T04 work will be driven by the remaining visual/UX route audit. Full file E2E, payments, SEO and release/domain work stay with their separate roadmap owners.

## T04.2 — Internal navigation locale sweep

Status: IN PROGRESS

Audit scope:
- active production components and pages only
- direct `navigate('/...')` calls
- direct React Router `to="/..."` links
- dynamic `/courses/:slug`, `/teachers/:id`, `/verify-certificate/:id`, `/meeting/:id` and `/live/:id` routes
- notification meeting links
- chat CTA links
- error-recovery home navigation

Implementation:
- Added `localizeInternalHref()` to the central navigation contract.
- Internal paths receive the active locale prefix.
- Already-localized paths remain unchanged.
- External URLs and protocol-relative URLs remain untouched.
- Notification, assistant, AI Hub, Live Room, Live Sessions, Student Dashboard, Teacher Registration and Error Boundary navigation are locale-safe.
- Live room copy links now preserve the active locale.
- Route-contract CI now scans these active files for hard-coded absolute internal navigation.

Acceptance gate:
- branch audit shows zero direct hard-coded internal navigation in the targeted active files.
- `npm run test:routes` passes.
- production safety scan passes.
- frontend production build passes.
- backend security/contracts and automated tests remain green.
- GitHub PR CI passes before merge.
- post-deploy localized route smoke checks pass.
