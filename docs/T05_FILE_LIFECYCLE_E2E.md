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
