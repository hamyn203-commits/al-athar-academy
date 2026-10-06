# T05 — File Lifecycle E2E

T05 owns the full upload / authorized-download / delete lifecycle for object-backed files.

## T05.1 — Student submission lifecycle

Status: IN PROGRESS

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
