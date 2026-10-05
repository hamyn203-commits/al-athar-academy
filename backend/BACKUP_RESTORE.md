# Production Backup & Restore Runbook

This runbook is part of the T01 production-readiness gate. A production launch is not complete until the database backup policy is enabled in MongoDB Atlas and at least one restore drill has been completed successfully.

## Scope

Primary data store: MongoDB Atlas.

This runbook covers application data only. Private object-storage files require their own provider retention/versioning policy and are verified separately.

## Required production policy

- Use MongoDB Atlas managed backups for the production cluster.
- Enable point-in-time recovery when the selected Atlas tier supports it.
- Keep backups in a region/account configuration that does not depend on the application runtime.
- Never store database dumps, connection strings, encryption keys, or backup credentials in this repository.
- Restrict backup and restore permissions to production operators only.

## Recovery objectives

Initial launch targets:

- RPO: 24 hours maximum until point-in-time recovery is confirmed; target 15 minutes or better once PITR is enabled.
- RTO: 4 hours for a full database recovery drill.
- Restore validation: required before public commercial launch and after material database architecture changes.

These are operational targets, not claims about the current Atlas plan. The Atlas configuration must be checked against them.

## Pre-launch verification checklist

- [ ] Atlas production cluster identified and protected by managed backups.
- [ ] Backup retention policy reviewed and recorded by the owner.
- [ ] Point-in-time recovery status verified.
- [ ] Restore permissions limited to authorized operators.
- [ ] A recent backup is visible in Atlas.
- [ ] Restore performed into an isolated validation cluster.
- [ ] Application connected to the restored validation database.
- [ ] Critical entities validated after restore: users, teachers, students, sessions, courses, enrollments, progress, payments/donations metadata, and audit-sensitive records.
- [ ] Restore drill date and result recorded below.

## Restore procedure

1. Declare the incident and stop write-heavy application operations if continuing writes could increase corruption or inconsistency.
2. Record the incident time and determine the desired recovery point.
3. In MongoDB Atlas, restore the selected snapshot or point-in-time state into a new isolated cluster. Do not overwrite the production cluster as the first recovery action.
4. Create temporary application credentials scoped to the restored cluster.
5. Run backend readiness against the restored cluster and confirm the database connection is healthy.
6. Execute smoke checks for authentication, teacher/student lookup, sessions, courses, enrollments, progress, and administrative reads.
7. Compare expected record counts and critical business records with the incident baseline when available.
8. After approval, perform the controlled production cutover to the restored database.
9. Rotate any temporary credentials.
10. Monitor API errors, database connection failures, and write operations after cutover.
11. Record the recovery point, data loss if any, recovery duration, and corrective actions.

## Pre-deployment safety

Before any high-risk migration or destructive data maintenance:

- Confirm a recent Atlas backup exists.
- Document a rollback or restore path.
- Avoid destructive migrations without a tested rollback.
- Do not use production as the first environment for schema/data migration experiments.

## Restore drill record

| Date | Source recovery point | Validation cluster | Result | RPO observed | RTO observed | Owner / notes |
| --- | --- | --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Not yet executed | Pending | Pending | Required before commercial launch |

## Launch gate

T01 backup strategy is considered **documented** when this runbook exists.

The production backup point is considered **verified** only after the Atlas configuration checklist and one restore drill are completed. Until then, the roadmap must show backup/restore as pending external verification rather than completed.
