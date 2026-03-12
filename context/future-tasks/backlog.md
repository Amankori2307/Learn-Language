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
| F-006 | todo | Strengthen the Continuum primitive library | Promote remaining documented layout conventions into first-class reusable primitives where that reduces feature-level duplication |
| F-007 | todo | Extend design-system governance beyond token misuse checks | Detect repeated composition drift, inconsistent semantic action usage, and non-approved responsive patterns |
| F-008 | todo | Add visual regression coverage for Continuum | Lock key public and app surfaces across phone and desktop viewports with screenshot-based checks |
| F-009 | todo | Increase semantic component adoption on feature surfaces | Replace acceptable tokenized one-off compositions with higher-level shared primitives where patterns have stabilized |
| F-010 | todo | Define long-term design-system governance operations | Establish an explicit audit cadence, exception review process, and ownership model for Continuum changes |
| F-011 | todo | Ship the remaining planned named themes | Implement the planned `warm`, `midnight`, `editorial`, `playful`, and `high-contrast` themes end to end across provider mappings, tokens, and selector UX |
| F-012 | todo | Expand vocabulary coverage | Add more reviewed vocabulary, examples, and cluster coverage without lowering content-quality gates |
| F-013 | todo | Fix macOS audio quality and playback reliability | Identify why audio is distorted or fails on macOS and harden the audio pipeline and permissions flow |
| F-014 | todo | Investigate frequent logout behavior | Document session expiry criteria and reduce unexpected logouts without weakening security |
| F-015 | todo | Add Mixpanel env placeholders | Add Mixpanel-related entries in sample `.env` files with dummy values so the integration can be wired safely |
| F-016 | todo | Audit and expand test coverage for core features | Ensure unit, integration, e2e, and smoke coverage is strong for both UI and backend |
| F-017 | todo | Add support for additional OAuth providers | Extend auth to cover more OAuth options beyond Google without breaking existing flows |
| F-018 | todo | Assess and improve performance | Identify bottlenecks and define concrete optimizations for both frontend and backend |
| F-019 | todo | Reduce Docker image sizes | Shrink frontend and backend images to speed up deploys and lower bandwidth usage |
| F-020 | todo | Improve Telugu audio quality | Evaluate better Telugu TTS options while keeping the current English audio setup |
