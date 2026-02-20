# Phase 2 - Memory and Retention Systems

Objective: implement learning science core (SRS + session generation + exercise variety) for real retention gains.

Maps to conversation chunks:
- SRS Lite
- Daily lesson/session generator
- Multi-example reinforcement
- Exercise variety

## Entry criteria

- Phase 1 complete.

## Tasks

### P2-001 - Deterministic candidate scoring service
Status: `done`

Scope:
- Extract scoring into standalone service.
- Apply ranking tie-breakers for deterministic ordering.
- Keep score formula aligned with product contract.

Acceptance:
- Candidate ranking is stable and predictable for same inputs.

### P2-002 - Daily session generator v1
Status: `done`

Scope:
- 30% due-review items.
- 50% new items from selected cluster.
- 20% weak items.

Acceptance:
- Generated session follows target mix within tolerance (+/-10%).

### P2-003 - Distractor generation strategy
Status: `done`

Scope:
- Priority order: same cluster -> same POS -> similar transliteration -> random.
- Ensure unique options and no duplicate distractors.

Acceptance:
- Option quality improves and duplicates never appear.

### P2-004 - Answer submission + SM-2 updates + mastery tiers
Status: `done`

Scope:
- Apply confidence-aware and response-time-aware SRS updates.
- Update ease factor, interval, next review date, and mastery tiers.
- Keep update logic in a standalone service with tests.

Acceptance:
- Progress transitions are deterministic and follow SRS rules.

### P2-005 - Due-review and weak-word modes
Status: `done`

Scope:
- Daily session composition supports review/new/weak ratios.
- Weak-word mode prioritizes weak items.
- Mode handling is respected by quiz generation.

Acceptance:
- Mode-filtered session candidate selection works as expected.

### P2-006 - Quiz/SRS test suite
Status: `done`

Scope:
- Unit tests for scoring and interval updates.
- Integration tests for generate + submit APIs.
- Edge case coverage (no due items, all mastered, empty cluster).

Acceptance:
- Tests prevent regression in SRS and selection behavior.

## Exit criteria

- Retention loop operational: generate -> answer -> update -> schedule next review.
- No audio/video/image dependency exists in this phase.
