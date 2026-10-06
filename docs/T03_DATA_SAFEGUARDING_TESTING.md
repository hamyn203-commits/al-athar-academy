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
