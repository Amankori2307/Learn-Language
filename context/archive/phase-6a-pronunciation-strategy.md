# Pronunciation Strategy (Decision Note)

## Goal

Provide pronunciation for words and sentences with high correctness, low operational risk, and predictable cost.

## Constraints

- Correctness is top priority.
- App is multi-language and text-first.
- Reviewer workflow already exists and should remain the quality gate.

## Option A: Reviewer-authored pronunciation (manual)

- How it works:
  - reviewer/admin enters pronunciation while adding/updating words and sentences
  - second-review remains available for disputed entries
- Pros:
  - highest controllable quality for learning use cases
  - full editorial consistency per language standard
  - no API/runtime dependency or vendor lock-in
- Cons:
  - slower content throughput
  - requires reviewer discipline and style guidance

## Option B: Rule-based transliteration generator (offline)

- How it works:
  - generate pronunciation from script using language-specific transliteration rules
  - reviewer edits output when needed
- Pros:
  - fast bootstrap for large datasets
  - deterministic and low cost
- Cons:
  - quality varies by language complexity and loan words
  - requires ongoing rule maintenance

## Option C: External TTS/phoneme provider (API)

- How it works:
  - call provider for pronunciation/phoneme output
  - optionally store generated result for caching
- Pros:
  - quick coverage for many languages
  - lower manual effort for long-tail content
- Cons:
  - variable correctness for pedagogy
  - recurring cost, rate limits, policy/licensing constraints
  - online dependency risk

## Recommendation

- Primary: Option A (reviewer-authored) as source of truth.
- Secondary assist: Option B as draft helper only (never auto-publish).
- Optional fallback: Option C behind explicit feature flag for low-confidence gaps.

## Rollout Plan

1. Keep manual pronunciation mandatory for reviewer-created words/sentences.
2. Add pronunciation style guide per language (syllable style, long-vowel convention, stress notation policy).
3. Add validation checks:
   - pronunciation required
   - Latin-script presence
   - placeholder detection
4. Add reviewer QA dashboard:
   - entries missing pronunciation
   - low-confidence or conflict-flagged pronunciation
5. If throughput pressure appears, introduce rule-based draft generation (Option B) with explicit reviewer approval step.

## Decision

- Adopt Option A now.
- Re-evaluate Option B after content volume crosses reviewer capacity thresholds.
- Keep Option C deferred until cost/licensing analysis is approved.
