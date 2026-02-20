# Beta Readiness Checklist

Status key: `[ ]` pending, `[x]` done

## Product

- [x] Core text-only learning loop works end-to-end
- [x] Daily review/new/weak/cluster modes available
- [x] Confidence input captured during quiz attempts
- [x] Session summary provides recommended next action

## Data

- [x] Import pipeline available (`content:import`)
- [x] Content validation available (`content:validate`)
- [x] MVP dataset prepared (300 words / 20 clusters / 300 examples)
- [ ] MVP dataset imported into production database

## Algorithm

- [x] Deterministic candidate scoring service
- [x] Distractor priority strategy implemented
- [x] SRS update service with mastery tiers
- [x] Adaptive session throttling based on recent accuracy

## Quality and Observability

- [x] `npm run ci` passing
- [x] API contract tests added
- [x] Service-level unit tests for core algorithms
- [x] Quiz funnel telemetry events logged

## Performance

- [x] Benchmark script added (`benchmark:quiz`)
- [x] Latest benchmark report generated (`context/plan/perf-report.md`)
- [x] Quiz generation path target < 200ms met in benchmark

## Operations

- [x] Production runbook documented
- [x] Rollback procedure documented
- [x] Incident triage steps documented

## Release Gate

- [ ] Complete production DB import for MVP dataset
- [ ] Execute authenticated end-to-end smoke test in deployed environment
- [ ] Sign-off by product + engineering owner

