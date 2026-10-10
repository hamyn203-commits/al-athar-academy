# Subscription circle operation

The EGP 10 community plan forms groups of 15–20 compatible learners. Payment approval puts a new subscription into `awaiting_placement`; placement does not consume credits. Teacher, plan, section, age group, gender, track and level must agree. Different purchased session counts can share a circle.

Unstarted circles move from `forming` to `ready` at the plan minimum, including at capacity. Only the admin start endpoint activates placed subscriptions, after validating a nonempty weekly schedule, timezone, plan duration, approved teacher and paid roster. A weekly schedule does not automatically create dated sessions: administrators schedule each actual lesson from the circle card, using existing tutor availability and collision checks.

Existing active/full circles remain operational. Falling below the formation minimum after exhaustion does not stop an already running cohort. Unstarted economic circles upgrade their former 15-seat capacity to 20 on placement/start; active legacy circles keep their existing capacity. Existing price quotes and balances are not rewritten.

The manual payment review page links directly to placement. Administration has separate waiting-request and circle views; circle cards show seats, missing learners, subscription balances, weekly schedules, start and dated session scheduling. The generic join/update routes cannot bypass paid placement or activate subscription circles.

Session credit settlement runs only for completed group lessons. It checks usage by student/session before selecting the current active package, so a replay cannot charge a newly activated renewal. Each transaction first writes a circle version counter to serialize concurrent settlement snapshots. The existing unique subscription/session and student/session ledger indexes remain. No historical ledger records are deleted or rewritten. Eligible early excuses retain credit under the existing attendance policy.

Validation includes service regression tests for 15th/20th/21st learner boundaries, start prerequisites, mixed package sizes, completion replay across renewal, excuses and exhaustion. Playwright exercises real admin navigation, placement, minimum reached, start and scheduling with unchanged balances against an isolated MongoDB replica set. CI results are distinct from production account/payment verification; no production verification flags are changed.
