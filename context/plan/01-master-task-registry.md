# Master Task Registry (Active Only)

Status legend: `todo` | `doing` | `blocked`

Completed work is intentionally removed from this file and should live in feature documentation and `APP_CONTEXT.md`, not in the active backlog.

## Phase 10 - Platform hardening and product intelligence (active)

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P10-010 | doing | Extend coding guidelines and enforcement to prevent duplicate shared types, enums, and magic-number constants | P10-001 | S | the repo has explicit anti-duplication rules, ownership rules, and enforcement checks or review gates |
| P10-011 | todo | Document dependency injection rules and clarify when `@Inject` is required versus unnecessary | P10-001 | S | Nest DI usage is consistent and the repo has a clear, reusable policy with examples |
| P10-012 | todo | Define a product-safe AI enhancement roadmap with one low-risk MVP recommendation | P10-001,P10-006,P10-008 | M | AI opportunities are ranked by user value, risk, cost, latency, and control boundaries, with one recommended MVP and one deferred experiment |
