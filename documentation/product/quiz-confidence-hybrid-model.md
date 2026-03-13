# Quiz Confidence Model

This document describes the current quiz-confidence behavior in the product.

The learner is no longer asked to self-report confidence during quiz answers. Instead, the system infers a discrete recall-confidence signal and uses that signal inside the SRS update flow.

## Goal

Reduce answer friction without weakening scheduling quality.

The quiz flow should stay focused on recall. Learners choose an answer and submit it. The platform estimates recall confidence from observable answer behavior and current memory state.

## Current contract

Current confidence behavior:

- quiz answer submission does not require learner-entered `confidenceLevel`
- quiz attempts still persist a confidence value for history and analytics compatibility
- the stored confidence value now reflects the system's effective confidence signal
- SRS uses the effective confidence signal when computing answer quality
- SRS uses the effective confidence signal when updating direction-specific strength

Primary implementation seams:

- [client/src/features/quiz/use-quiz-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/use-quiz-page-view-model.ts)
- [server/src/modules/quiz/quiz.service.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.ts)
- [server/src/infrastructure/services/quiz-confidence.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/services/quiz-confidence.ts)
- [server/src/infrastructure/services/srs.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/services/srs.ts)
- [shared/routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts)

## Confidence sources

The system distinguishes between historical manual confidence and current inferred confidence:

- `manual`
- `inferred`

For new quiz attempts, the effective source is always `inferred`.

Persisted attempt fields:

- `confidenceLevel`
- `inferredConfidenceLevel`
- `effectiveConfidenceLevel`
- `confidenceSource`

For current submissions:

- `confidenceLevel` mirrors `effectiveConfidenceLevel` for backward compatibility
- `inferredConfidenceLevel` stores the raw inferred result
- `effectiveConfidenceLevel` stores the value actually used by SRS
- `confidenceSource` is `inferred`

## Inference inputs

Version 1 stays simple and deterministic.

Inputs:

- correctness
- response time
- current correct streak
- wrong-count history
- direction-specific strength
- submitted direction or question type

Non-goals:

- opaque AI scoring
- device-specific guesswork
- unrelated session metadata

## Inference output

The inferred model uses the existing discrete scale:

- `1` = low confidence
- `2` = medium confidence
- `3` = high confidence

This keeps attempt history, analytics sorting, and SRS integration stable while removing quiz friction.

## Rules v1

The current deterministic rules are:

1. Start from baseline `2`.
2. If the answer is incorrect, set confidence to `1`.
3. On correct answers, adjust confidence from response-time bands.
4. Bias upward modestly when the direction-specific strength is already strong.
5. Bias downward modestly when the direction-specific strength is weak.
6. Bias upward modestly for strong streaks.
7. Bias downward modestly when wrong-count history is elevated.
8. Clamp the final result to the `1..3` range.

Correctness remains the dominant signal. Timing and memory-state signals only nudge correct answers up or down.

## SRS interaction

SRS now consumes the effective inferred confidence signal as its confidence input.

Important behavior:

- response time still matters, but it is folded into the inferred confidence model instead of being applied again as a separate SRS quality bonus/penalty
- this avoids double-counting the same timing signal
- direction-specific strength updates still use the effective confidence signal

## UX implications

Learners no longer see:

- a quiz confidence selector
- a profile-level preference for enabling the selector

Learners still see confidence-derived history values, but those values now represent a system-generated recall signal rather than a self-report.

## Migration notes

- historical attempts may still contain manual confidence data
- new attempts are recorded with `confidenceSource = inferred`
- old rows do not need synthetic backfills to remain readable
- existing history and analytics surfaces can continue reading `confidenceLevel`

## Future tuning questions

Open follow-up questions:

1. Should history eventually label the signal more explicitly than "confidence" everywhere?
2. Should analytics surface disagreement or stability metrics for inferred confidence later?
3. Do the response-time thresholds need language- or mode-specific tuning after more production data?

## Decision

The current product decision is:

- remove learner-entered confidence from quiz flow
- keep a confidence-driven SRS signal
- infer that signal deterministically on the server

This preserves the scheduling model while removing a piece of quiz friction from every answer.
