# Phase 4 - Hardening, Performance, and Release

Objective: make the core product reliable, observable, and ready for sustained production usage.

## Entry criteria

- Phase 3 complete.

## Tasks

### P4-001 - API contract hardening
Status: `done`

Scope:
- Validate request/response schemas for all public routes.
- Add error code catalog.

Acceptance:
- Contract tests pass for quiz, clusters, words, stats endpoints.

### P4-002 - Performance tuning for quiz generation
Status: `done`

Scope:
- Index tuning for progress lookups and due reviews.
- Query optimization for candidate scoring.

Acceptance:
- Quiz generation response target under 200ms on reference dataset.

### P4-003 - Observability baseline
Status: `done`

Scope:
- Structured logs with request IDs.
- Core funnel events: session start, answer submit, session complete.

Acceptance:
- Debugging production issues is possible from logs alone.

### P4-004 - Quality gates
Status: `done`

Scope:
- Minimum test coverage for core engine paths.
- Lint/typecheck/test in CI required for merge.

Acceptance:
- No direct deploy without passing gates.

### P4-005 - Release readiness and runbook
Status: `doing`

Scope:
- Deployment checklist.
- Rollback instructions.
- DB migration policy.
- Incident playbook.

Acceptance:
- Another engineer can deploy and rollback using docs only.

### P4-006 - Complex sentence workouts (text-only)
Status: `done`

Scope:
- Add advanced fill-in-the-blank sentence flows.
- Add read-and-type translation drills.
- Keep this phase text-only (no audio/speaking dependency).

Acceptance:
- Advanced workouts improve challenge while using only text input/output.

### P4-007 - Contextual learning mode
Status: `todo`

Scope:
- Introduce short story/dialogue learning units.
- Teach new vocabulary in context before quiz prompts.

Acceptance:
- Context units can launch quizzes with linked vocabulary lists.

### P4-008 - Reinforcement loops
Status: `todo`

Scope:
- After lesson completion, auto-generate micro-review with weak words.
- Include related words from same cluster.

Acceptance:
- Every completed lesson offers immediate targeted reinforcement set.

### P4-009 - Optional AI tutor mode (text)
Status: `todo`

Scope:
- Add conversational tutor that uses user's known vocabulary.
- Evaluate responses and suggest next practice.
- Keep behind feature flag until stable.

Acceptance:
- Tutor can run safely without affecting core quiz/SRS performance.

## Exit criteria

- Core text-first app is production-ready.
- Team can release safely without relying on ad hoc tribal knowledge.
