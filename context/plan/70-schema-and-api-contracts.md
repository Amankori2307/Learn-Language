# Schema, API, and Algorithm Contracts

This file is the canonical implementation contract for data and learning logic.

## 1. Data schema (text-first)

## 1.1 `words`

Required fields:
- `id`
- `telugu`
- `english`
- `transliteration`
- `part_of_speech`
- `difficulty_level` (`beginner|easy|medium|hard`)
- `frequency_score` (0.0-1.0)
- `cefr_level` (nullable)
- `created_at`

Optional fields:
- `audio_url` (Phase 5)
- `image_url` (Phase 5)

## 1.2 `word_examples`

Fields:
- `id`
- `word_id`
- `telugu_sentence`
- `english_sentence`
- `context_tag`
- `difficulty`

Constraint:
- At least one example per word in MVP.

## 1.3 `clusters`

Fields:
- `id`
- `name`
- `type` (`difficulty|semantic|functional|grammar|frequency|weakness`)
- `description`

## 1.4 `word_clusters`

Fields:
- `word_id`
- `cluster_id`

Constraint:
- composite PK (`word_id`, `cluster_id`).

## 1.5 `user_word_progress`

Fields:
- `user_id`
- `word_id`
- `active_recall_score` (Telugu->English)
- `recognition_score` (English->Telugu)
- `correct_streak`
- `wrong_count`
- `ease_factor`
- `interval_days`
- `next_review_date`
- `last_seen_at`
- `pain_score` (0.0-1.0)
- `mastery_level` (`0..4`)

## 1.6 `quiz_attempts`

Fields:
- `id`
- `user_id`
- `word_id`
- `question_type`
- `direction` (`telugu_to_english|english_to_telugu`)
- `is_correct`
- `response_time_ms`
- `confidence_level` (1..3)
- `created_at`

## 2. Selection and SRS formulas

## 2.1 Candidate score

```text
candidate_score =
  difficulty_weight
+ days_since_last_seen
+ (wrong_count * 2)
- correct_streak
+ weak_area_bonus
```

Rules:
- Mastered words are excluded unless due.
- New words get onboarding boost.

## 2.2 SRS update (SM-2 style)

```text
if quality < 2:
  interval_days = 1
else:
  interval_days = max(1, round(previous_interval_days * ease_factor))

ease_factor = ease_factor + (0.1 - (3-quality) * (0.08 + (3-quality)*0.02))
```

Guardrails:
- Clamp `ease_factor` between `1.3` and `3.0`.
- Penalize long response times.
- Give small bonus for instant/high-confidence correct answers.

## 2.3 Pain score

```text
pain_score = weighted(
  recent_error_rate,
  avg_response_time,
  repeated_failures,
  direction_imbalance
)
```

Banding:
- `0.0-0.3`: easy
- `0.3-0.6`: medium
- `0.6-1.0`: hard

## 2.4 Session composition targets

V1 baseline:
- 30% due review
- 50% new items from current cluster
- 20% weak items

V2 adaptive override:
- Increase weak-item share when `pain_score` crosses threshold.
- Reduce new-item share when recent accuracy drops below configured floor.

## 3. API contracts

## 3.1 `GET /api/quiz/generate`

Query:
- `mode` (`daily_review|new_words|cluster|weak_words`)
- `count`
- `clusterId` (optional)

Response item:
- `wordId`
- `questionType`
- `direction`
- `questionText`
- `options[]`
- `metadata` (difficulty, cluster tags)

## 3.2 `POST /api/quiz/submit`

Request:
- `wordId`
- `selectedOptionId`
- `questionType`
- `direction`
- `responseTimeMs`
- `confidenceLevel`

Response:
- `isCorrect`
- `correctAnswer`
- `examples[]`
- `progressUpdate` (`nextReviewDate`, `masteryLevel`, `painScore`)

## 3.3 `GET /api/stats`

Response:
- `totalWords`
- `mastered`
- `learning`
- `weak`
- `streak`
- `xp`
- `clusterMastery[]`

## 4. Performance constraints

- Quiz generation target: `<200ms` for typical request.
- Required indexes:
- `(user_id, next_review_date)` on `user_word_progress`
- `(user_id, created_at)` on `quiz_attempts`
- `(word_id, cluster_id)` on `word_clusters`

