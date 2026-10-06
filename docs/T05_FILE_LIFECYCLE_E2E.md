# T05 — File Lifecycle E2E

T05 owns the full upload / authorized-download / delete lifecycle for object-backed files.

## T05.1 — Student submission lifecycle

Status: COMPLETE ✅

Audit findings:

- Homework and assignment direct uploads were owner-scoped.
- Private download routes already enforced student / teacher / admin access.
- Object-storage deletion existed at the provider layer but was not used by any business route.
- Assignment deletion could remove the assignment while leaving submissions and stored files behind.
- Teacher-task re-submission could overwrite the stored reference and orphan the previous object.

Implementation:

- Added ownership-bound external object deletion.
- Added a shared lifecycle helper for external objects and safe local development files.
- Students can delete only their own homework and assignment submissions.
- Admin cleanup still deletes using the original student owner stored on the record.
- Homework deletion resets the related session/task submission state.
- Teacher-task file overwrite is blocked until the existing submission is deleted.
- Assignment deletion is blocked while submissions still exist.
- Assignment submission deletion decrements the assignment submission count.
- No generic object-storage delete endpoint is exposed.

Acceptance gate:

- storage lifecycle unit tests pass.
- security regression contracts pass.
- existing backend automated tests remain green.
- frontend route/build gates remain green.
- GitHub PR CI passes before merge.
- production readiness and runtime-error smoke checks pass after deployment.

Later T05 tasks will cover the remaining teacher-document/public-media lifecycle and production object-store E2E verification without mixing payment work from T06.

Verification evidence:
- GitHub PR #16 CI run `37496967129`: frontend + backend successful.
- Backend automated suite: 19/19 tests passed.
- Production master SHA: `417a915fbd572ae52503320c32278b8bf9d68efe`.
- Frontend deployment `dpl_DTmrivR6Wsr4AQnKiPDahvCqw8Cb`: READY.
- API deployment `dpl_5MZqaz8P5FYxmZkpSbkJPyxU9mdx`: READY.
- Production `/api/readiness` returned HTTP 200 with `ready: true`.
- Production `/api/uploads/status` reported `vercel-blob`, configured, direct upload enabled and private-by-default.
- No frontend or API runtime errors were observed in the post-deploy smoke window.

Important boundary:
- T05.1 verifies ownership-bound deletion logic, local deletion behavior, CI contracts and production deployment health.
- A destructive production Blob delete drill was not performed in this task; production object-store lifecycle verification remains a later T05 task with disposable test data.

## T05.2 — Teacher application asset lifecycle

Status: COMPLETE ✅

Audit findings:

- Teacher-registration uploads can be owned by the verified email before the User record exists.
- The Teacher record did not persist that storage owner explicitly.
- Public teacher media stores application proxy URLs instead of the raw Vercel Blob reference.
- Rejecting a teacher changes review state but intentionally keeps the application record for audit/review.
- Automatic deletion on rejection would therefore mix retention policy with review state and is not enabled.

Implementation:

- New applications persist hidden `storageOwner` metadata.
- Public media proxy URLs can be safely unwrapped to the provider reference.
- Teacher asset collection deduplicates reused fallback media references.
- Legacy records can prove ownership through the linked User id/email when `storageOwner` is absent.
- Admin-only `DELETE /api/teachers/admin/:id/assets` is available only for `rejected` or `suspended` records.
- All external assets must prove purpose + owner before any provider deletion begins.
- Unresolved ownership fails closed with `ASSET_OWNERSHIP_UNRESOLVED`.
- Legacy local assets block automated purge and require manual cleanup.
- Successful purge retains the teacher audit record, replaces required file fields with safe placeholders, clears `storageOwner`, disables verification and records `assetsPurgedAt`.
- Rejection itself does not automatically purge assets.

Acceptance gate:

- teacher asset lifecycle tests pass.
- existing storage lifecycle tests remain green.
- security regression contracts pass.
- frontend route/safety/build gates remain green.
- GitHub PR CI passes before merge.
- production readiness, storage status and runtime-error smoke checks pass after deployment.

A destructive production Blob purge drill remains deferred until T05's disposable production-object verification task.

Verification evidence:
- GitHub PR #18 CI run `37500770357`: frontend + backend successful.
- Backend automated suite: 25/25 tests passed.
- Production master SHA: `e6b4a9a741acafa58050e44d659334c8c37ec811`.
- Frontend deployment `dpl_Cwqd72vsUWbDSDuZZZZHnwakXX4L`: READY.
- API deployment `dpl_BtZReE4kkjGAC27S47S7xWoadq2x`: READY.
- Teacher registration route returned HTTP 200.
- Production `/api/readiness` returned HTTP 200 with `ready: true`.
- Production `/api/uploads/status` reported `vercel-blob`, configured, direct upload enabled and private-by-default.
- No frontend or API runtime errors were observed in the post-deploy smoke window.

Important boundary:
- T05.2 verifies traceable teacher asset ownership, safe purge controls, CI contracts and production deployment health.
- No real teacher asset was purged during verification.
- Disposable production object upload/read/delete verification remains T05.3.

## T05.3 — Disposable production object lifecycle verification

Status: COMPLETE ✅

Purpose:
- Verify the actual production-connected object store with disposable data only.
- Exercise create → authenticated private read → content verification → delete → absence verification.
- Never touch a real student, teacher, course or assignment asset.

Temporary verification mechanism:
- `POST /api/uploads/_internal/storage-e2e`.
- Production-only.
- Requires dedicated `STORAGE_E2E_SECRET` through `Authorization: Bearer ...`.
- Secret comparison uses timing-safe equality.
- Probe objects are restricted to `uploads/e2e/`.
- Cleanup is attempted in `finally` if the lifecycle fails before normal deletion.
- Response never returns storage credentials.

Acceptance gate:
- route/safety/build/backend tests pass before merge.
- production API deployment contains the temporary secret.
- probe reports create/read/delete/absence all successful against the production Vercel Blob store.
- production readiness and runtime error checks remain healthy.
- after evidence is captured, the temporary endpoint is removed and the temporary secret is disabled.
- final production deployment confirms the internal probe route is no longer present.

### Temporary one-time query bridge

The available deployment fetch tooling cannot send a custom Authorization header. For the single production verification call only, T05.3 temporarily adds:
- `GET /api/uploads/_internal/storage-e2e-once?token=...`
- production-only behavior
- an additional `STORAGE_E2E_QUERY_BRIDGE=true` gate
- the same timing-safe comparison against `STORAGE_E2E_SECRET`
- the same disposable lifecycle implementation as the Bearer-protected POST route

This bridge is not a permanent API. After one successful production probe:
1. disable `STORAGE_E2E_QUERY_BRIDGE`
2. disable `STORAGE_E2E_SECRET`
3. remove both temporary probe routes from the codebase
4. deploy the cleanup and verify the internal route is gone

### T05.3 production evidence

- Temporary probe implementation PR #20 CI run `37502143027`: frontend + backend successful.
- One-time bridge PR #21 CI run `37503165106`: frontend + backend successful.
- Probe-capable production API SHA: `b8304e303ffd1567d68be7f35ec4bed7fe214609`.
- Disposable production Vercel Blob probe returned HTTP 200 and:
  - `success: true`
  - `driver: vercel-blob`
  - `created: true`
  - `readVerified: true`
  - `deleted: true`
  - `absentAfterDelete: true`
- The disposable object was isolated under `uploads/e2e/`; no student, teacher, course or assignment asset was used.
- The temporary query bridge was disabled immediately after the successful call.
- The temporary storage probe secret was rotated to a disabled value immediately after the successful call.
- This cleanup removes both temporary storage-probe routes and all probe-only provider helpers from production code.
- CI now contains a negative contract that fails if `storage-e2e` or its temporary env references reappear in the upload routes.

Final T05.3 closure evidence:
- Cleanup frontend deployment `dpl_FVsNqnH9M1t93dDNXFw8By2EfRPn` on SHA `dae876ab7d4099782f99c81e8af2164e19756e11`: READY.
- Cleanup API deployment `dpl_D4LjiE69MT9s28kDNkW16Q15Z7jH` on the same SHA: READY.
- Removed POST probe route returned HTTP 404.
- Removed one-time bridge route returned HTTP 404.
- Production `/api/readiness` returned HTTP 200 with `ready: true`.
- Production `/api/uploads/status` returned `vercel-blob`, configured, direct upload enabled and private-by-default.
- No frontend or API runtime errors were observed in the final cleanup smoke window.

## T05 overall status

Status: COMPLETE ✅

T05 closes after:
- T05.1 student submission lifecycle
- T05.2 teacher application asset lifecycle
- T05.3 disposable production object lifecycle verification and cleanup

No temporary storage-probe route remains in production.