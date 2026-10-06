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

Status: COMPLETE ✅

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

Verification evidence:
- GitHub PR #12 CI run `37490977491`: frontend + backend successful.
- Production master SHA: `d7ed00b85dd26ed300854c3f5ca0f6d885213e6b`.
- Frontend deployment `dpl_Gsc3TjaLmfDzoJtxQrV6uub3cxUa`: READY.
- API deployment `dpl_EL1KaJSXHUgkg8tJoeNLTL64yA1V`: READY.
- Localized route smoke checks returned HTTP 200 for Arabic, English and Indonesian routes.
- `/api/readiness` returned HTTP 200 with `ready: true`.
- No frontend or API runtime errors were observed in the post-deploy smoke window.

## T04.3 — Locale transition & localized 404 contract

Status: COMPLETE ✅

Audit findings:
- Language switching dropped the current query string and URL hash.
- Invalid-locale redirects dropped query/hash state.
- Root locale redirects did not preserve query/hash state.
- Locale-specific 404s were rendered outside the locale layout and could use the wrong active language.

Implementation:
- Added `localizedLocation()` as the central locale-transition helper.
- Language switching preserves pathname, query string and hash.
- Invalid-locale recovery preserves query string and hash.
- Initial root locale redirect preserves query string and hash.
- Localized route trees now own their 404 fallback so not-found pages inherit the requested locale.
- Blocking route contracts cover the new behavior.

Acceptance gate:
- `npm run test:routes` passes.
- production safety scan passes.
- frontend production build passes.
- backend security/contracts and automated tests remain green.
- GitHub PR CI passes before merge.
- post-deploy locale-state and localized-404 smoke checks pass.

Verification evidence:
- GitHub PR #14 CI run `37495243841`: frontend + backend successful.
- Production master SHA: `88b9be5d0edb9075a87b691c20314913382506bb`.
- Frontend deployment `dpl_5618R5AgoVLwLE6LAUaQHhur9Y72`: READY.
- API deployment `dpl_E7QRznWCmt3MoBBVUC64qzxafYTw`: READY.
- Production smoke checks succeeded for localized 404, localized course/login routes and API readiness.
- `/api/readiness` returned HTTP 200 with `ready: true`.
- No frontend or API runtime errors were observed in the post-deploy smoke window.
- Static active-route audit found zero unmatched literal internal destinations.

## T04 overall status

Status: COMPLETE ✅

T04 closes after:
- T04.1 route and navigation contract
- T04.2 internal navigation locale sweep
- T04.3 locale transition and localized 404 contract

The remaining full upload/download/delete lifecycle is intentionally owned by T05.
