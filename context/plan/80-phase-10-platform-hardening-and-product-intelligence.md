# Phase 10 - Platform Hardening, API Normalization, Security, Performance, SEO, and Product Intelligence

Status model: `todo` | `doing` | `done` | `blocked`

## Goal

Stabilize the platform around a unified API contract, consistent routing, structured observability, stronger security posture, reduced runtime exposure, measurable performance, production-grade SEO, and clearer engineering governance.

This phase focuses on:

- standardizing all API responses behind one envelope
- enforcing one canonical `/api` route prefix and domain grouping model
- upgrading Winston logging into structured request and application observability
- adding controlled product analytics instrumentation
- hardening browser, auth, transport, and privileged endpoint security
- reducing unnecessary public port exposure and runtime predictability
- measuring and improving frontend/backend performance using concrete baselines
- strengthening technical SEO and search engine submission readiness
- expanding coding guidelines to prevent duplicated shared types/enums/constants
- documenting DI usage rules, including when `@Inject` is required
- identifying high-value, low-risk AI enhancements for the product

## Why this order

The order below is deliberate:

1. Do not change behavior-heavy features before cross-cutting contracts are defined.
2. Normalize response shapes before broad logging, analytics, or frontend changes, so all layers can depend on one API contract.
3. Normalize route prefixes before SEO, analytics, and smoke hardening, so all URLs and API entry points stabilize early.
4. Add observability before performance or security hardening, so results and regressions can be measured.
5. Harden security and runtime exposure before crawler submission or broader public indexing.
6. Expand governance and AI planning after the platform boundaries are explicit.

This avoids:

- reworking client services multiple times
- duplicate route migrations
- adding logging and analytics to unstable seams
- running performance work without baseline visibility
- exposing unstable or improperly indexed public surfaces
- introducing AI into unclear or insecure product areas

## Scope boundaries

In scope:

- API envelope standardization
- route prefix and API taxonomy normalization
- Winston logging and request correlation
- Mixpanel or equivalent analytics abstraction
- security headers, authorization review, error handling posture, rate limiting
- runtime port exposure hardening
- performance profiling and prioritized optimization
- metadata, sitemap, robots, structured data, crawler submission readiness
- coding guideline expansion and enforcement planning
- Nest DI guidance
- AI opportunity identification and prioritization

Out of scope for this phase:

- major new learner/reviewer product features unrelated to platform hardening
- full backend runtime migration away from current architecture
- large visual redesign work
- speculative AI feature implementation before a prioritized MVP is selected
- infrastructure changes that require provider migration unless needed for security exposure reduction

## Phase tasks

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P10-001 | done | Produce a platform hardening baseline covering API shapes, route registration, logging seams, security posture, runtime exposure, SEO coverage, and analytics touchpoints | - | M | all Phase 10 decisions are grounded in a concrete inventory and no implementation starts from assumptions |
| P10-002 | done | Standardize all API responses behind one canonical success/error envelope | P10-001 | L | all backend responses and shared route contracts use the same envelope and frontend transport unwraps it from one seam |
| P10-003 | done | Enforce a single global `/api` prefix and normalize route ownership by domain | P10-001,P10-002 | M | all API endpoints live under the canonical prefixed taxonomy and client/shared/backend route definitions match |
| P10-004 | done | Upgrade Winston-based observability for structured request logs, application logs, redaction, and request correlation | P10-002,P10-003 | M | request and app logs are consistent, structured, correlated by requestId, and safe for production |
| P10-005 | done | Add a controlled product analytics event pipeline behind a vendor abstraction | P10-003,P10-004 | M | core product events emit through a single analytics layer with stable taxonomy, env gating, and no scattered raw SDK calls |
| P10-006 | done | Harden application security across transport, auth, authorization, error handling, static exposure, and abuse controls | P10-002,P10-003,P10-004 | L | explicit security checklist passes and high-risk routes have enforced protection rules |
| P10-007 | done | Reduce unnecessary public runtime exposure and normalize service topology/port strategy | P10-003,P10-006 | M | production exposes only necessary public entry points and app code no longer depends on fixed internal host ports |
| P10-008 | done | Measure and significantly improve frontend/backend performance using a prioritized optimization plan | P10-004,P10-007 | L | baseline metrics exist, bottlenecks are ranked by impact, and the highest-value optimizations are implemented and verified |
| P10-009 | done | Harden technical SEO, route metadata, crawl controls, structured data, and search engine submission readiness | P10-003,P10-007 | M | public pages have intentional metadata/canonical behavior, private pages are not overshared, and crawler submission steps are ready |
| P10-010 | done | Extend coding guidelines and enforcement to prevent duplicate shared types, enums, and magic-number constants | P10-001 | S | the repo has explicit anti-duplication rules, ownership rules, and enforcement checks or review gates |
| P10-011 | done | Document dependency injection rules and clarify when `@Inject` is required versus unnecessary | P10-001 | S | Nest DI usage is consistent and the repo has a clear, reusable policy with examples |
| P10-012 | done | Define a product-safe AI enhancement roadmap with one low-risk MVP recommendation | P10-001,P10-006,P10-008 | M | AI opportunities are ranked by user value, risk, cost, latency, and control boundaries, with one recommended MVP and one deferred experiment |

## Micro-task execution map

The top-level tasks above are the phase gates. Actual execution should happen in smaller sub-steps. A top-level task is only `done` after all of its micro-tasks are `done`.

### P10-001 - Platform hardening baseline

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-001A | done | Inventory current success and error response shapes by backend endpoint group and shared route contract | - | a response-shape matrix exists for auth, quiz, analytics, vocabulary, review, audio, and infra/admin |
| P10-001B | done | Inventory actual route registration across Nest controllers, auth-mounted Express handlers, shared route contracts, and client service callers | P10-001A | a route-taxonomy matrix exists and path drift is explicitly listed |
| P10-001C | done | Inventory current logging seams, request identifiers, module log usage, and unsafe/redaction-prone payload logging points | P10-001B | all request/app log entry points and gaps are documented |
| P10-001D | done | Inventory security posture across CORS, auth/token handling, privileged route guards, static file exposure, environment secrets, and error leakage | P10-001C | a security gap list exists with severity and target ownership |
| P10-001E | done | Inventory runtime port exposure, compose topology, public service entry points, metadata coverage, sitemap/robots behavior, and analytics touchpoints | P10-001D | the current public surface, runtime topology, and crawl/analytics baselines are documented |

### P10-002 - Unified API envelope

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-002A | done | Define the canonical response envelope for success, validation failure, unauthorized, forbidden, not-found, conflict, rate-limited, and internal-error cases | P10-001E | one approved response schema exists for all response classes |
| P10-002B | done | Define the implementation seam for response normalization: success interceptor, exception filter, requestId attachment, and optional metadata support | P10-002A | the backend shaping strategy is explicit and reusable |
| P10-002C | done | Update shared route contracts and contract tests to express the canonical envelope instead of raw payloads | P10-002B | shared contracts no longer expose mixed response shapes |
| P10-002D | done | Implement backend envelope shaping and migrate controllers/services away from ad hoc payload shaping | P10-002C | all endpoints return the canonical envelope through the shared backend seam |
| P10-002E | done | Implement frontend transport unwrapping and error parsing from a single Axios/client seam | P10-002D | feature code reads normalized data/errors without custom envelope parsing |
| P10-002F | done | Update backend/controller/client tests and smoke assertions to verify envelope consistency end-to-end | P10-002E | all touched tests assert the canonical envelope and no legacy response assumptions remain |

### P10-003 - Global `/api` prefix and route normalization

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-003A | done | Define the canonical API taxonomy and ownership model for auth, quiz, analytics, vocabulary/clusters, review, audio, and admin endpoints | P10-002F | one approved domain map exists for all API routes |
| P10-003B | done | Add or confirm a single backend global `/api` prefix strategy and explicitly reconcile any handlers mounted outside the normal Nest controller flow | P10-003A | the application bootstrap and non-Nest handlers follow one route-prefix rule |
| P10-003C | done | Migrate backend route registration and auth callback/login/logout/profile endpoints to the canonical prefixed taxonomy | P10-003B | all API routes are reachable through the intended prefixed path only |
| P10-003D | done | Reconcile shared route contracts, client route builders, frontend services, and smoke/E2E expectations with the new canonical routes | P10-003C | shared/backend/client route definitions are aligned and no caller uses drifted paths |
| P10-003E | done | Validate production/runtime assumptions, reverse-proxy behavior, and callback URLs against the normalized route structure | P10-003D | route normalization does not break deploy-time ingress, auth callbacks, or existing public URLs unintentionally |

### P10-004 - Structured logging and request observability

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-004A | done | Define the structured log schema, log levels, production/dev transport behavior, and required request/application fields | P10-003E | one logging contract exists for request, app, and error events |
| P10-004B | done | Upgrade request logging to structured lifecycle events with requestId, route, method, status, duration, and optional user context | P10-004A | request logs are structured and traceable rather than ad hoc text lines |
| P10-004C | done | Normalize application logs across Nest bootstrap, services, repositories, and unexpected error boundaries to the shared Winston schema | P10-004B | backend app logs follow one structure and module naming pattern |
| P10-004D | done | Add redaction and sensitive-field handling rules so tokens, cookies, secrets, and unsafe payloads never leak to logs | P10-004C | production logging is safe for auth and user data flows |
| P10-004E | done | Add verification coverage and operational guidance for correlating requests, reading logs, and debugging failures by requestId | P10-004D | observability behavior is documented and verified by tests or targeted assertions |

### P10-005 - Product analytics event pipeline

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-005A | done | Define analytics ownership, vendor abstraction, environment gating, and privacy boundaries before any instrumentation | P10-004E | an approved analytics architecture exists without leaking vendor details into feature code |
| P10-005B | done | Define the canonical product event taxonomy and shared event properties for core learner/reviewer/admin flows | P10-005A | all initial product events have stable names and payload contracts |
| P10-005C | done | Implement the analytics adapter seam and helper utilities for client-owned and optionally server-owned events | P10-005B | events emit through one controlled adapter rather than raw SDK usage |
| P10-005D | done | Instrument the highest-value flows: auth, quiz start/submit/complete, cluster usage, review actions, draft creation, and profile save | P10-005C | critical product flows emit the approved events with stable properties |
| P10-005E | done | Add validation and monitoring checks to prevent duplicate firing, schema drift, or accidental PII emission | P10-005D | analytics behavior is stable, debuggable, and safe for production rollout |

### P10-006 - Security hardening

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-006A | done | Define the target browser/transport security baseline including headers, CORS rules, HTTPS assumptions, and trusted origins | P10-004E | a concrete transport/browser hardening policy exists |
| P10-006B | done | Review and harden auth/token/session handling, callback flows, and client-side credential storage posture | P10-006A | the auth surface has an explicit and documented security posture |
| P10-006C | done | Add or tighten abuse protections such as rate limiting and endpoint-specific guardrails for auth, review mutations, and expensive generation flows | P10-006B | high-risk or expensive endpoints are protected against obvious abuse patterns |
| P10-006D | done | Standardize error exposure and production-safe exception behavior so internals and stack traces are never leaked to clients | P10-006C | user-facing errors are consistent and safe in production mode |
| P10-006E | done | Re-verify reviewer/admin authorization boundaries, privileged route access, static asset exposure, and environment-secret handling | P10-006D | privileged capabilities remain properly gated and static/env exposures are minimized |

### P10-007 - Runtime topology and port hardening

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-007A | done | Define the target runtime topology for development and production, including public entry points and private service communication | P10-006E | the desired public/private service layout is explicit |
| P10-007B | done | Remove unnecessary production port publication and ensure backend services are not publicly exposed when a reverse proxy/internal network is sufficient | P10-007A | production exposes only required public ports and services |
| P10-007C | done | Make internal service ports configurable and remove code paths that assume fixed host-level backend/frontend ports | P10-007B | app/runtime logic no longer depends on predictable internal ports |
| P10-007D | done | Validate deploy, reverse-proxy, health-check, and smoke-test behavior against the hardened topology | P10-007C | operational tooling and verification still work under the new exposure model |

### P10-008 - Performance audit and optimization

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-008A | done | Define measurable frontend and backend performance baselines, target endpoints, target pages, and collection method | P10-007D | performance work starts from explicit baseline metrics rather than intuition |
| P10-008B | done | Audit frontend bundle size, hydration/render cost, route-level loading strategy, and high-cost UI surfaces | P10-008A | frontend bottlenecks are ranked with concrete evidence |
| P10-008C | done | Audit backend latency hot paths, query complexity, indexing gaps, payload size, and high-cost storage/service operations | P10-008B | backend bottlenecks are ranked with concrete evidence |
| P10-008D | done | Define and implement the highest-impact optimization slice set with explicit before/after measurement | P10-008C | the top-priority performance improvements are implemented and verified |
| P10-008E | done | Document the final performance findings, unresolved tradeoffs, and follow-up backlog by impact and cost | P10-008D | the repo has a stable performance decision record rather than one-off tuning |

### P10-009 - SEO and crawler readiness

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-009A | done | Classify routes into public, semi-public, and private/gated surfaces and define indexability rules for each class | P10-007D | crawl policy is intentional by route class |
| P10-009B | done | Define route-level metadata, canonical, social preview, and structured-data strategy for public pages | P10-009A | every public route class has a metadata and canonical policy |
| P10-009C | done | Reconcile sitemap, robots, root metadata, and route-specific metadata with the actual public route map | P10-009B | technical SEO surfaces are complete and internally consistent |
| P10-009D | done | Validate that gated/private pages are not accidentally optimized for indexing while public discovery pages remain crawlable | P10-009C | crawlability and privacy are balanced intentionally |
| P10-009E | done | Prepare search engine submission and monitoring runbook, including sitemap submission and post-submit verification steps | P10-009D | the app is ready for Google/Bing submission with a clear operational checklist |

### P10-010 - Coding-guideline expansion and enforcement

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-010A | done | Extend code guidelines with explicit bans on duplicate reusable shared types, duplicate enums, and duplicate magic-number constants | P10-001E | governance rules are explicit rather than implied |
| P10-010B | done | Define canonical ownership locations for shared contracts, domain enums, constants, and feature-local exceptions | P10-010A | contributors know where reusable types/constants are allowed to live |
| P10-010C | done | Define or implement enforcement mechanisms through lint rules, scripts, review checklists, or targeted CI gates | P10-010B | duplication rules are enforceable rather than aspirational |
| P10-010D | done | Produce a cleanup backlog for existing violations without mixing broad cleanup into unrelated implementation slices | P10-010C | existing debt is visible and future debt creation is constrained |

### P10-011 - Dependency injection policy

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-011A | done | Audit current Nest DI patterns and identify where constructor type-based injection is used versus explicit injection tokens | P10-001E | the repo's current DI patterns are understood concretely |
| P10-011B | done | Define the house rule for when plain constructor injection is preferred and when `@Inject` is required | P10-011A | DI rules are explicit and technically correct |
| P10-011C | done | Document examples for class providers, custom tokens, interfaces, factories, and ambiguous/multi-provider scenarios | P10-011B | future contributors can apply DI rules without guesswork |
| P10-011D | done | Integrate the DI policy into coding guidance and review expectations | P10-011C | DI consistency is part of normal engineering governance |

### P10-012 - AI enhancement roadmap

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P10-012A | done | Identify product problems where AI could materially improve learning quality, reviewer throughput, or discovery experience | P10-008E | the AI discussion starts from product value rather than technology-first ideas |
| P10-012B | done | Score each candidate use case by value, cost, latency, moderation risk, data dependency, control, and fallback path | P10-012A | candidate AI ideas are ranked objectively |
| P10-012C | done | Define hard constraints for deterministic grading, reviewer governance, privacy, and secure deployment of any AI-assisted feature | P10-012B | AI boundaries are explicit before any implementation proposal |
| P10-012D | done | Select one low-risk MVP and one higher-upside deferred experiment with implementation prerequisites and risk notes | P10-012C | the repo has an actionable AI roadmap instead of vague ideas |

## Sequencing guardrails

### What must not happen early

- Do not change response envelopes before the current API shape inventory is complete.
- Do not normalize routes before shared contracts and auth-mounted handlers are fully inventoried.
- Do not add analytics SDK calls directly inside feature components before the event taxonomy and adapter are approved.
- Do not attempt meaningful performance optimization before structured logging and performance baseline collection exist.
- Do not reduce public port exposure without deciding the target reverse-proxy/private-network topology first.
- Do not submit the app to search engines until sitemap, canonical behavior, and route-level metadata are verified.
- Do not implement AI-backed product behavior before security, privacy, and determinism constraints are defined.

### Recommended implementation slices

Each implementation slice should be small enough to finish with code, tests, and docs without mixing too many concerns:

1. baseline inventory and decision records
2. unified API envelope contract
3. route prefix normalization
4. structured logging and request correlation
5. analytics adapter and first event set
6. browser/auth/abuse security hardening
7. runtime topology and port exposure hardening
8. frontend/backend performance baseline and top optimization slice
9. metadata/sitemap/canonical/crawler readiness
10. coding-guideline and DI governance updates
11. AI roadmap selection

## Definition of readiness

Do not start a top-level implementation task until:

- its dependencies are `done`
- the decision record for that concern is written
- the target files and migration seams are listed
- the expected tests for that slice are named in advance
- backward-compatibility expectations are explicit for any contract-affecting change

## Per-slice checklist

For each micro-task implementation slice, record:

- target files
- change seam
- compatibility strategy
- risk notes
- acceptance checks
- tests to add or update
- follow-up debt explicitly deferred
