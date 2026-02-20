# Phase 3 - Adaptive Intelligence and Product Stickiness

Objective: personalize practice and improve consistency of daily usage using text-first mechanics.

Maps to conversation chunks:
- Difficulty scoring
- Weak-area detection
- Adaptive session generator v2
- Bidirectional proficiency
- Streak/XP and micro challenges
- Cluster mastery badges

## Entry criteria

- Phase 2 complete.

## Tasks

### P3-001 - Difficulty scoring model
Status: `todo`

Scope:
- Build per-item dynamic difficulty from response correctness + response time.
- Normalize into easy/medium/hard bands.

Acceptance:
- Difficulty updates after every attempt and is queryable.

### P3-002 - Pain score and weak-area detection
Status: `todo`

Scope:
- Compute weighted pain score from error rate + slow answers + repeated misses.
- Aggregate by cluster and part-of-speech.

Acceptance:
- Weak area list available for each user.

### P3-003 - Adaptive session generator v2
Status: `done`

Scope:
- Prioritize weak items when pain score crosses threshold.
- Throttle new content when user overload detected.

Acceptance:
- Session composition changes based on user state, not static ratios only.

### P3-004 - Bidirectional proficiency model
Status: `done`

Scope:
- Track Telugu->English and English->Telugu separately.
- Recommend direction based on imbalance.

Acceptance:
- Dashboard and session planner reflect direction-specific weakness.

### P3-005 - Dashboard and progress UX
Status: `done`

Scope:
- Show total learned, mastered, weak words, streak, XP.
- Add direct CTA buttons: Continue, Daily Review, Cluster Practice, Weak Words.

Acceptance:
- User can launch all major learning flows from dashboard.

### P3-006 - Engagement mechanics
Status: `todo`

Scope:
- Daily streak.
- XP scoring with bonus for hard/weak item improvements.
- Micro challenges.
- Cluster mastery badge state.

Acceptance:
- Engagement values update reliably after sessions.

## Exit criteria

- App feels adaptive and personalized for text-only usage.
- Users can identify and work on weak areas without manual filtering.
