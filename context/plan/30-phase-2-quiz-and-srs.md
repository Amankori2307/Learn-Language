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

### P2-001 - SRS Lite (SM-2 based)
Status: `todo`

Scope:
- Store ease factor, interval, next review date.
- Correct vs incorrect branch updates.
- Confidence-aware adjustment.

Acceptance:
- Next review date changes per attempt according to documented formula.

### P2-002 - Daily session generator v1
Status: `todo`

Scope:
- 30% due-review items.
- 50% new items from selected cluster.
- 20% weak items.

Acceptance:
- Generated session follows target mix within tolerance (+/-10%).

### P2-003 - Distractor generation strategy
Status: `todo`

Scope:
- Priority order: same cluster -> same POS -> similar transliteration -> random.
- Ensure unique options and no duplicate distractors.

Acceptance:
- Option quality improves and duplicates never appear.

### P2-004 - Multi-example reinforcement
Status: `todo`

Scope:
- Attach 3+ examples where available.
- Surface examples in answer feedback screen.

Acceptance:
- Correct answer response includes examples consistently.

### P2-005 - Exercise variety pack
Status: `todo`

Scope:
- MCQ.
- Fill-in-the-blank.
- Type-answer.
- Keep text-first only.

Acceptance:
- At least 3 exercise types selectable per session.

### P2-006 - Quiz/SRS test suite
Status: `todo`

Scope:
- Unit tests for scoring and interval updates.
- Integration tests for generate + submit APIs.
- Edge case coverage (no due items, all mastered, empty cluster).

Acceptance:
- Tests prevent regression in SRS and selection behavior.

## Exit criteria

- Retention loop operational: generate -> answer -> update -> schedule next review.
- No audio/video/image dependency exists in this phase.

