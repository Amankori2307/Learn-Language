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
| F-010 | todo | Define long-term design-system governance operations | Establish an explicit audit cadence, exception review process, and ownership model for Continuum changes |
| F-029 | todo | Re-evaluate learner confidence input model | Determine whether quiz confidence should remain user-entered or be inferred dynamically from observable answer signals, then document how confidence should affect SRS quality, strength, and learner UX |
| F-005 | todo | Revisit next-round performance optimization candidates | Leaderboard pushdown, distractor-pool sizing, cluster-query consolidation, and client-payload inspection |
| F-014 | todo | Investigate frequent logout behavior | Document session expiry criteria and reduce unexpected logouts without weakening security |
| F-019 | todo | Reduce Docker image sizes | Shrink frontend and backend images to speed up deploys and lower bandwidth usage |
| F-008 | todo | Add visual regression coverage for Continuum | Lock key public and app surfaces across phone and desktop viewports with screenshot-based checks |
| F-009 | todo | Increase semantic component adoption on feature surfaces | Replace acceptable tokenized one-off compositions with higher-level shared primitives where patterns have stabilized |
| F-020 | todo | Improve Telugu audio quality | Evaluate better Telugu TTS options while keeping the current English audio setup |
| F-030 | todo | Add language filter to admin vocab export | Let admins download repo-style `words.json` and `sentences.json` for a specific language instead of always exporting the full dataset |
| F-032 | todo | Add in-place rejected-word edit and resubmit flow | Replace the current revised-draft workaround with true editing of rejected vocabulary and a direct move back into approval |
| F-033 | todo | Add first-class sentence review workflow | Give example sentences their own review/edit lifecycle instead of governing them only through the parent word status |
| F-021 | todo | Add German language support | Extend vocab, audio, and UI to support German learning flows |
| F-017 | todo | Add support for additional OAuth providers | Extend auth to cover more OAuth options beyond Google without breaking existing flows |
| F-023 | todo | Add Language Hub pages | Add `/learn-<language>` SEO landing pages (starting with Telugu) with native-reviewer and word-bucket previews |
| F-025 | todo | Add Review Process page | Document the native-verified vocabulary review workflow and quality guarantees |
| F-026 | todo | Add Roadmap/Waitlist page | Collect interest for upcoming languages with a waitlist or voting flow |
| F-027 | todo | Add FAQ page | SEO-focused FAQ addressing pricing, browser-only usage, and flashcard differences |
| F-006 | todo | Strengthen the Continuum primitive library | Promote remaining documented layout conventions into first-class reusable primitives where that reduces feature-level duplication |
| F-007 | todo | Extend design-system governance beyond token misuse checks | Detect repeated composition drift, inconsistent semantic action usage, and non-approved responsive patterns |
| F-003 | todo | Review semantic search over vocabulary and clusters | Must not replace deterministic reviewer/admin filters |
| F-002 | todo | Evaluate adaptive study recommendations from learner analytics | Advisory only; do not place non-deterministic logic in grading paths |
| F-001 | todo | Evaluate reviewer-assist AI for draft/example generation | Keep reviewer approval as the final gate and preserve deterministic fallback behavior |
| F-004 | todo | Revisit server operational hardening gaps | Strong production secrets, SSH-key auth, and tighter firewall posture remain desirable |
| F-016 | todo | Audit and expand test coverage for core features | Ensure unit, integration, e2e, and smoke coverage is strong for both UI and backend |
| F-018 | todo | Assess and improve performance | Identify bottlenecks and define concrete optimizations for both frontend and backend |
