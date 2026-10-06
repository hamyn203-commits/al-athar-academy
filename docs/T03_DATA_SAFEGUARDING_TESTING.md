# T03 — Data, Safeguarding & Testing

Status: IN PROGRESS

T01 and T02 are closed. T03 now owns the production test gate and the remaining data/safeguarding hardening work.

## Current workstream — T03.1 Automated integration test gate

Implemented on this branch:

- Node 22 integration tests using the built-in `node:test` runner.
- Public health and 404 contract checks.
- Untrusted browser-origin rejection.
- Prevention of privileged self-registration.
- Student/admin role isolation.
- Development admin bootstrap + login verification.
- Refresh-session and logout revocation verification.
- Blocking `npm test` step in backend CI.

Exit criteria:

- Existing syntax/security checks pass.
- New integration tests pass in CI.
- PR diff is reviewed before merge.

## Next T03 work

After T03.1 is merged, continue with the remaining T03 data/safeguarding review. Do not mix later roadmap owners such as full upload/download/delete E2E, payments, SEO, or release/domain work into this task.

## T03.2 Upload / data security hardening

Implemented on this branch:

- Central upload policy shared by Vercel Blob and S3 presigning.
- MIME type must match the filename extension.
- Vercel direct-upload tokens are limited to the single validated MIME type.
- Upload metadata is validated before a direct-upload token is issued.
- Role, purpose, file size and filename checks are centralized.
- Unsafe object-storage paths are rejected.
- Vercel Blob references require HTTPS.
- Unit tests cover valid and spoofed upload metadata plus object-path ownership rules.

This task intentionally does not implement full upload/download/delete E2E; that remains with its later roadmap owner.

## T03.3 Safeguarding and guardian permission enforcement

Implemented on this branch:

- Guardian child overviews query and expose progress, attendance and grades only when the corresponding permission is enabled.
- Historical guardian reports are redacted at read time using the current permissions.
- Grade/evaluation history requires the linked child's `viewGrades` permission.
- Weekly summaries separate progress data from attendance data.
- Guardian dashboard progress metrics are hidden when `viewProgress` is disabled.
- Attendance RSVP state is hidden when `viewAttendance` is disabled.
- Guardian permission updates accept only known boolean fields.
- Public trial requests for students under 18 require a guardian name.
- Automated tests cover minor trial gating and permission-based report redaction.

Verification evidence before merge:
- all backend JavaScript syntax checks passed
- security regression contracts passed
- automated suite: 15/15 tests passed
- frontend production build completed successfully

This task strengthens existing guardian-child ownership controls without changing the later full file E2E, payment, SEO or release/domain roadmap owners.