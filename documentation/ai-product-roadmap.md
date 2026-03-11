# AI Product Roadmap

This document captures the Phase 10 recommendation for AI work. The goal is to improve learning quality and reviewer throughput without introducing non-deterministic grading, unsafe automation, or latency-sensitive regressions in the core quiz loop.

## Evaluation criteria

Each candidate is scored against:

- learner or reviewer value
- implementation cost
- runtime latency
- moderation risk
- privacy sensitivity
- determinism requirements
- fallback availability when the model is unavailable

## Candidate opportunities

### 1. Reviewer assist for draft/example generation

- Value: high
- Cost: medium
- Risk: medium
- Why it helps:
  - reviewers already curate vocabulary and example content
  - AI can accelerate first-draft generation for meanings, example sentences, or cluster suggestions
  - reviewer approval remains the final gate, so quality stays governed
- Constraints:
  - generated content must never auto-publish
  - every suggestion needs visible provenance and easy discard/edit flow

### 2. Adaptive study recommendations

- Value: high
- Cost: medium
- Risk: low-medium
- Why it helps:
  - the app already has analytics, weak-cluster data, word buckets, and quiz history
  - AI can turn those signals into clearer next-step recommendations
- Constraints:
  - recommendations should be advisory, not opaque scoring logic
  - fallback should be deterministic rule-based copy if the model is unavailable

### 3. Semantic search over vocabulary and clusters

- Value: medium
- Cost: medium-high
- Risk: low-medium
- Why it helps:
  - can improve discovery for related words and themes beyond exact string matching
- Constraints:
  - should not replace deterministic filters for admin/reviewer workflows
  - requires index/storage design and multilingual query evaluation

### 4. Explanation or pronunciation assistance

- Value: medium
- Cost: medium-high
- Risk: medium-high
- Why it helps:
  - could generate learner-friendly explanations or pronunciation hints
- Constraints:
  - must be clearly labeled as assistive content
  - needs a safe fallback because the quiz loop cannot depend on remote-model latency

## Rejected for now

- non-deterministic grading in the core quiz path
- automatic reviewer approval or conflict resolution
- AI-only flows with no deterministic fallback
- model calls on every quiz answer submission

## Recommended MVP

Start with reviewer assist for vocabulary draft enrichment.

Why this is the best first move:

- highest value with the strongest human review control
- no need to trust model output blindly
- does not sit on the learner's latency-critical path
- easy to ship behind feature flags and role gating

Suggested MVP scope:

- generate draft example sentences from a candidate word plus part of speech
- optionally suggest cluster tags and short reviewer-facing rationale
- keep all output editable and untrusted until reviewer approval

## Deferred higher-upside experiment

Adaptive study recommendations should be the next serious experiment after the reviewer-assist MVP.

Why defer it:

- it depends on already-stable analytics and performance budgets
- it benefits from observing real event data from the Phase 10 analytics pipeline
- recommendation quality is easier to evaluate once the platform has stronger measurement in place

## Rollout guardrails

- gate all AI features behind explicit env/feature flags
- never send secrets, raw auth material, or unnecessary PII to model providers
- log usage at the feature boundary, not the full prompt contents if that risks sensitive data
- preserve deterministic product behavior when AI is unavailable
- document model/provider assumptions before shipping any implementation
