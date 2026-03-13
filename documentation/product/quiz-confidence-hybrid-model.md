# Quiz Confidence Hybrid Model

This document defines a concrete hybrid-model proposal for quiz confidence.

It does not mean the model is live yet. It is the reviewable implementation contract for deciding whether learner-entered confidence should stay manual, become inferred, or move to a hybrid operating mode.

## Goal

Reduce quiz friction without weakening scheduling quality.

Today, the learner can optionally provide a low/medium/high confidence value on each answer. That value is used by the quiz and SRS pipeline, so removing it blindly would change real learning behavior.

The hybrid model is the recommended investigation path because it lets the product compare learner-entered confidence against an inferred confidence signal before making a permanent product decision.

## Current contract

Current confidence behavior:

- quiz answer submission includes `confidenceLevel`
- the confidence selector is behind an explicit learner preference
- quiz attempts persist confidence in history
- SRS uses confidence when computing answer quality
- SRS uses confidence when updating direction-specific strength

Primary implementation seams today:

- [client/src/features/quiz/use-quiz-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/use-quiz-page-view-model.ts)
- [client/src/hooks/use-quiz-confidence-preference.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-quiz-confidence-preference.ts)
- [server/src/modules/quiz/quiz.service.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.ts)
- [server/src/infrastructure/services/srs.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/services/srs.ts)
- [shared/routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts)

## Candidate models

### 1. Manual confidence

The learner continues to provide confidence explicitly.

Pros:

- direct learner self-report
- no migration complexity
- preserves current behavior

Cons:

- adds friction to quiz completion
- self-report can be noisy or inconsistent
- many learners may ignore the control or answer quickly without reflecting

### 2. Inferred confidence

Confidence is computed from observable answer signals.

Possible inputs:

- correctness
- response time
- current correct streak
- wrong-count history
- direction-specific strength
- question type
- quiz mode

Pros:

- lower quiz friction
- more consistent system behavior
- easier to keep enabled by default

Cons:

- can misread fast guesses as certainty
- can misread slow but deliberate recall as low confidence
- changes current SRS semantics if shipped directly

### 3. Hybrid confidence

Confidence is inferred by the system while still allowing optional learner override or side-by-side comparison.

Pros:

- lowest-risk path to evaluation
- preserves current manual signal for comparison
- allows feature-flagged rollout

Cons:

- adds short-term implementation complexity
- requires temporary coexistence of manual and inferred semantics

## Recommended model

Recommended path: `hybrid`

Reason:

- confidence already affects scheduling quality and strength updates
- there is not enough evidence yet that inferred confidence is better than manual input
- the product should not remove a correctness-affecting signal before measuring disagreement and predictive value

## Hybrid model design

### Confidence sources

The system should distinguish between:

- `manual`
- `inferred`

If a hybrid override mode is enabled later, an answer can carry:

- `manualConfidenceLevel`
- `inferredConfidenceLevel`
- `effectiveConfidenceLevel`
- `confidenceSource`

Where:

- `effectiveConfidenceLevel` is the value that actually feeds SRS
- `confidenceSource` is the source used for the effective value

### Inference inputs

Version 1 of inferred confidence should remain simple and deterministic.

Recommended inputs:

- `isCorrect`
- `responseTimeMs`
- `correctStreak`
- `wrongCount`
- direction-specific strength for the submitted direction
- `questionType`

Do not use:

- opaque AI scoring
- device-specific heuristics
- browsing/session metadata unrelated to recall quality

### Inference output

The inferred model should produce the same current discrete scale:

- `1` = low confidence
- `2` = medium confidence
- `3` = high confidence

This keeps the current SRS contract stable during the experiment.

## Proposed inferred-confidence rules v1

These rules are intentionally simple so they can be reviewed and tuned:

1. Start from baseline `2`.
2. If the answer is incorrect, clamp to `1`.
3. If the answer is correct and response time is fast, raise toward `3`.
4. If the answer is correct but response time is slow, reduce toward `1` or `2`.
5. If direction-specific strength is already high, bias upward modestly.
6. If wrong-count history is elevated or recent streak is weak, bias downward modestly.
7. Never let one secondary signal override correctness.

This means correctness remains the dominant signal, with response time and memory state acting as modifiers.

## Instrumentation plan

Phase 1 should add comparison telemetry without changing SRS behavior.

Store or emit:

- `manualConfidenceLevel`
- `inferredConfidenceLevel`
- `effectiveConfidenceLevel`
- `confidenceSource`
- `responseTimeMs`
- `isCorrect`
- `questionType`
- `mode`
- `language`
- direction-specific strength snapshot
- streak and wrong-count snapshot

Primary purpose:

- measure disagreement between manual and inferred confidence
- test whether inferred confidence predicts later recall at least as well as manual confidence

## Evaluation metrics

### Product metrics

- answer completion time
- quiz friction and completion rate
- confidence-selector usage rate when visible
- disagreement rate between manual and inferred values

### Learning metrics

- correlation with next-review correctness
- correlation with future weak-word entry
- impact on mastery progression speed
- impact on direction-specific strength growth

### Decision metrics

- whether inferred confidence is at least as predictive as manual confidence
- whether removing manual input materially improves answer throughput
- whether history and analytics remain understandable to learners

## Rollout plan

### Phase 1. Comparison-only

- keep manual confidence as the effective SRS input
- compute inferred confidence in parallel
- instrument both values

Done when:

- enough quiz traffic exists to compare manual and inferred confidence across languages and modes

### Phase 2. Flagged hybrid mode

- allow inferred confidence to become the effective value behind a feature flag
- optionally keep manual confidence visible for selected cohorts

Done when:

- SRS behavior under inferred confidence is measurable without forcing a full migration

### Phase 3. Product decision

Choose one:

- keep manual confidence
- keep hybrid permanently
- remove manual confidence and use inferred confidence only

## Migration strategy

Do not remove the current confidence field immediately.

Recommended migration path:

1. preserve the current manual confidence field for historical attempts
2. add inferred/effective/source fields only when the experiment starts
3. keep old attempts readable without backfilling invented values
4. delay route-contract removal until the final product decision

## Rollback strategy

Rollback must be low-risk.

Requirements:

- a feature flag can switch effective confidence back to manual
- manual confidence submission remains supported during the experiment
- history can still render attempts even if inferred fields are absent

## Open product questions

These decisions should be reviewed before implementation:

1. Should the learner continue to see a visible confidence signal in history if the value becomes inferred?
2. Should the profile toggle remain, change meaning, or disappear under hybrid mode?
3. Is the product optimizing primarily for lower quiz friction or for explicit learner self-report?
4. Should inferred confidence be invisible to the learner, or surfaced as an explanation in analytics later?

## Recommendation

Proceed only with the comparison-first hybrid plan.

Do not replace manual confidence directly.

The current system already uses confidence deeply enough that immediate removal would create behavior change without evidence. The hybrid model is the safest path because it measures real disagreement and predictive value before committing the product to a new scheduling signal.
