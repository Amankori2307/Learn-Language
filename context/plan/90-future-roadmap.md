# Future Product Roadmap

Objective: define what to build next after current phase completion, with clear priority levels and execution order.

## Priority legend

- `Must Have`: required for strong product correctness, retention, and scale readiness.
- `Should Have`: high-value upgrades that improve outcomes and quality.
- `Good to Have`: useful enhancements after core systems are stable.

## Must Have (next)

### M1 - Language-scoped persistence correctness (hard guarantee)
Why:
- Multi-language support exists in UI/API shape; data isolation must be fully enforced at DB/query/reporting level.

Scope:
- Verify all progress/review/stats/leaderboard/session queries are scoped by `(userId, language)`.
- Add regression tests for cross-language data leakage.

Done when:
- No endpoint returns mixed-language user progress.
- Automated tests prove isolation.

### M2 - Review governance v2 (quality gate hardening)
Why:
- Content correctness is core for learning trust.

Scope:
- Add reviewer confidence score and second-review option for sensitive entries.
- Add reviewer disagreement workflow (conflict queue).
- Add source-quality scoring and minimum evidence fields.

Done when:
- Every approved word has auditable evidence + reviewer trace.

### M3 - Spaced repetition tuning and correctness
Why:
- Retention quality depends on scheduling accuracy.

Scope:
- Add versioned SRS config (so algorithm changes are reversible).
- Track per-direction memory strength separately (`source->target`, `target->source`).
- Add drift checks for overdue queues and wrong scheduling.

Done when:
- SRS behavior is measurable, configurable, and regression-tested.

### M4 - Content quality checks in CI
Why:
- Seed/import quality must not degrade.

Scope:
- Add deeper validators:
  - duplicate transliteration collisions
  - missing pronunciation quality
  - invalid example meaning mismatch
  - cluster/tag consistency
- Block CI on critical content errors.

Done when:
- Broken content cannot be merged.

## Should Have (after must-have)

### S1 - Full attempt analytics dashboard
Scope:
- Accuracy by mode, by direction, by cluster, by language, by day.
- Time-to-answer and confidence correlation.

Done when:
- Product decisions can be data-driven from internal dashboard views.

### S2 - Personalized remediation engine
Scope:
- Auto-generate weak-area packs from attempt history.
- Recommend next session mode based on rolling performance.

Done when:
- Users receive adaptive next-best action with measurable lift.

### S3 - Reviewer workspace UX improvements
Scope:
- Diff view for edits, batch review keyboard shortcuts, inline pronunciation checks.

Done when:
- Reviewer throughput increases without accuracy regression.

### S4 - Offline-friendly learning mode (text-first)
Scope:
- Cache active session + due words.
- Sync attempts when online.

Done when:
- Learner can complete core text session without network interruption.

## Good to Have (later)

### G1 - Media layer expansion
Scope:
- P5-001..P5-005 completion (audio assets, listening mode, image hints, moderation/cost controls, media QA).

### G2 - Achievement and motivation layer
Scope:
- Challenge ladders, milestone badges, weekly goals, streak recovery token.

### G3 - Tutor mode enhancement
Scope:
- Better guided corrections using known vocabulary boundaries and CEFR-style progression.

### G4 - Community contribution pipeline
Scope:
- Contributor submissions, reviewer triage, contributor trust levels.

## Recommended execution order

1. M1 language correctness hardening
2. M4 CI content quality gates
3. M2 review governance v2
4. M3 SRS tuning/versioning
5. S1 analytics dashboard
6. S2 remediation engine
7. S3 reviewer UX
8. S4 offline mode
9. G1/G2/G3/G4 based on product goals

## Risks to manage

- Incorrect content approvals reduce learner trust quickly.
- Mixed-language progress leakage creates confusing UX.
- Over-complex feature growth before SRS correctness harms retention.
- Media expansion before core quality controls increases cost and complexity.

## Suggested immediate next sprint

- Sprint goal: complete `M1 + M4`.
- Deliverables:
  - language-isolation test suite
  - endpoint audit checklist
  - content validator upgrade
  - CI gates for critical content errors
