# Future Tasks

This file is for plausible future work that is intentionally not active yet.

Use it to capture:

- deferred product ideas
- potential technical improvements
- possible follow-up phases
- work that should not enter the current execution lane yet

Do not use it for:

- the active task
- items currently marked `doing`
- completed history
- archived records

When a future item becomes active, move it into `context/active-tasks/backlog.md` or into a dedicated active phase file under `context/active-tasks/`.

## Current future candidates

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| F-001 | todo | Evaluate reviewer-assist AI for draft/example generation | Keep reviewer approval as the final gate and preserve deterministic fallback behavior |
| F-002 | todo | Evaluate adaptive study recommendations from learner analytics | Advisory only; do not place non-deterministic logic in grading paths |
| F-003 | todo | Review semantic search over vocabulary and clusters | Must not replace deterministic reviewer/admin filters |
| F-004 | todo | Revisit server operational hardening gaps | Strong production secrets, SSH-key auth, and tighter firewall posture remain desirable |
| F-005 | todo | Revisit next-round performance optimization candidates | Leaderboard pushdown, distractor-pool sizing, cluster-query consolidation, and client-payload inspection |
