# Platform Hardening Baseline

This document is the execution baseline for `P10-001`. It records the current state of API responses, route registration, logging, analytics touchpoints, security posture, runtime exposure, and SEO so later Phase 10 tasks can change the system from explicit facts instead of assumptions.

## 1. API response baseline

### Current success-shape behavior

Current success responses are inconsistent at the transport contract level:

- most controllers return raw payloads directly through `res.json(...)`
- success responses are not wrapped in a shared envelope
- clients often parse raw data directly from Axios `response.data`

Observed examples:

| Area | Endpoint examples | Current success shape |
| ---- | ----------------- | --------------------- |
| auth | `/auth/me`, `/api/profile` | raw user/profile object |
| quiz | `/api/quiz/generate`, `/api/quiz/submit` | raw array/object |
| analytics | `/api/stats`, `/api/analytics/learning`, `/api/leaderboard` | raw object/array payloads |
| vocabulary | `/api/words`, `/api/clusters` | raw array/object payloads |
| review | `/api/review/queue`, `/api/review/words` | raw object payloads |
| audio | `/api/audio/resolve` | raw object payload |
| infra | `/api/admin/seed`, `/api/admin/srs/drift` | raw object payloads |

Primary files:

- [auth.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/auth.controller.ts)
- [quiz.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.controller.ts)
- [analytics.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.controller.ts)
- [vocabulary.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/vocabulary/vocabulary.controller.ts)
- [review.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.ts)
- [audio.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/audio/audio.controller.ts)
- [infra.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/infra/infra.controller.ts)

### Current error-shape behavior

Error responses are more standardized than success responses.

Current shared error helper:

- [http.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/http.ts)

Current error shape:

```ts
{
  code: "UNAUTHORIZED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR",
  message: string,
  requestId: string,
  details?: unknown
}
```

Current limitations:

- there is no matching success envelope
- there is no explicit `success` or `error` boolean
- there is no common `meta` field for pagination/totals
- there is no unified global exception filter; each controller repeats `try/catch` and `handleError(...)`
- `FORBIDDEN`, `CONFLICT`, and `RATE_LIMITED` are not part of the shared error-code type yet

### Current contract mismatch risk

The shared route contract in [routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts) models success responses as raw payloads and error responses as raw error objects. This means a future envelope migration will be a cross-cutting contract change touching:

- shared route schemas
- controller response behavior
- service/client parsing
- hook-level data parsing
- controller tests
- route contract tests
- smoke/E2E assertions

## 2. Route registration baseline

### Current backend route strategy

The backend does not currently use a Nest global prefix. Instead:

- most controller decorators hardcode full `/api/...` paths directly
- auth still exposes non-`/api` endpoints
- Google OAuth routes are mounted manually through Express in auth setup

Primary bootstrap/auth files:

- [main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts)
- [auth.oidc.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/auth.oidc.ts)

### Current controller route map

| Area | Current routes |
| ---- | -------------- |
| auth controller | `/auth/me`, `/api/profile`, `/api/profile` |
| auth Express routes | `/auth/google`, `/auth/google/callback`, `/auth/logout` |
| quiz | `/api/quiz/generate`, `/api/quiz/submit` |
| analytics | `/api/stats`, `/api/analytics/learning`, `/api/analytics/word-buckets`, `/api/attempts/history`, `/api/leaderboard` |
| vocabulary | `/api/words`, `/api/words/:id`, `/api/clusters`, `/api/clusters/:id` |
| review | `/api/review/queue`, `/api/review/conflicts`, `/api/review/words/:id`, `/api/review/words/bulk`, `/api/review/words/:id/resolve-conflict`, `/api/review/words/:id/history`, `/api/review/words` |
| audio | `/api/audio/resolve` |
| admin/infra | `/api/admin/seed`, `/api/admin/srs/drift` |

### Current client route usage drift

Client service usage is mixed:

- some services use `api.*.path` from [routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts)
- some services hardcode paths directly even when shared contracts exist
- auth service uses non-`/api` auth paths directly

Examples:

- [authService.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/services/authService.ts)
- [reviewService.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/services/reviewService.ts)
- [userService.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/services/userService.ts)
- [audioService.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/services/audioService.ts)

Current route-normalization gaps:

- non-`/api` auth endpoints remain live
- `/auth/me` is inconsistent with `/api/profile`
- route ownership is split between controller decorators and Express-mounted auth code
- some client callers bypass shared route contracts

## 3. Logging and observability baseline

### Existing logging

The repo already has Winston-based app logging and Morgan-backed request logging.

Primary files:

- [logger.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/logger/logger.ts)
- [nest-app-logger.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/logger/nest-app-logger.ts)
- [main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts)

Current strengths:

- Winston is already the central logger
- request IDs are assigned in bootstrap and echoed as `x-request-id`
- Nest logging is routed through Winston
- some auth and guard paths already log structured metadata

Current request logging behavior:

- Morgan writes text-like lines into Winston
- request logs include method, URL, status, content-length, response time, and requestId

Current observability gaps:

- request lifecycle logging is line-oriented rather than fully structured
- there is no explicit start/end/error event model for requests
- log schemas vary by caller
- redaction rules are not centralized
- user context is not consistently attached
- some error handling still falls back to `console.error`, for example auth controller unexpected-error handling
- API event logging currently writes internal event names such as `quiz_session_generated` and `audio_resolved` to logs, but there is no dedicated analytics pipeline yet

### Existing API event logging

Current helper:

- [http.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/http.ts)

Current behavior:

- `logApiEvent(...)` sends event-shaped log lines to Winston
- this is logging, not product analytics

Current gap:

- there is no Mixpanel/PostHog/Plausible adapter
- there is no shared event taxonomy
- there is no privacy gating for user analytics

## 4. Security baseline

### Current transport/browser posture

Current strengths:

- CORS is explicitly configured in [main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts)
- allowed origins are restricted to configured origins plus defaults
- request IDs are assigned
- auth cookies are `httpOnly`
- auth cookies use `sameSite: "lax"`
- auth cookies are `secure` in production
- validation pipe is enabled globally
- env validation exists through Zod

Current gaps:

- Helmet or equivalent browser-security headers are not present
- no explicit rate limiting is present
- no explicit CSRF posture is documented for auth cookie + bearer fallback behavior
- some privileged endpoints rely on role checks but lack a documented security checklist
- static generated audio is served directly from `/audio/generated`
- production-safe exception handling is manual and controller-specific instead of centralized

### Current auth/token posture

Current auth behavior:

- auth supports bearer tokens and auth cookie fallback
- OAuth callback signs a JWT and sets a cookie
- frontend also stores auth token client-side through [authTokenStorage.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/services/authTokenStorage.ts)

Current security questions for Phase 10:

- is dual cookie plus client-stored bearer token behavior necessary
- should `/auth/google/callback` and token handoff be changed under the normalized API design
- should local token storage remain as-is

### Current authorization posture

Primary guard files:

- [authenticated.guard.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/guards/authenticated.guard.ts)
- [reviewer.guard.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/guards/reviewer.guard.ts)

Current strengths:

- authenticated routes are guarded
- reviewer/admin routes use reviewer guard

Current gaps:

- authorization behavior is not summarized in one operational security document
- there is no explicit forbidden error code in the current shared error envelope

## 5. Runtime topology and port baseline

### Current development/runtime assumptions

Current backend startup:

- [main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts) reads `BACKEND_PORT`, then `PORT`, then defaults to `5001`

Current client API base:

- [apiClient.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/services/apiClient.ts) reads `NEXT_PUBLIC_API_BASE_URL`

Current environment validation:

- [env.validation.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/config/env.validation.ts)

Current gap:

- `PORT` defaults to `3000` in env validation while backend bootstrap defaults to `5001`; this is already a drift risk

### Current production exposure

Production compose:

- [docker-compose.prod.yml](/Users/aman/Projects/personal-projects/Learn-Language/deploy/production/docker-compose.prod.yml)

Current published ports:

- frontend: `3000:3000`
- backend: `5001:5001`

Current topology gap:

- backend is publicly published directly instead of clearly hidden behind a proxy/internal network
- internal service ports are fixed and visible in deployment files

Important constraint for Phase 10:

- the public web entry point still needs stable ingress such as `80/443`
- the realistic hardening goal is to remove unnecessary public backend exposure, not to make the website itself unreachable or unpredictable

### Current CI/runtime references

CI:

- [ci-cd.yml](/Users/aman/Projects/personal-projects/Learn-Language/.github/workflows/ci-cd.yml)

Current exposed CI port:

- Postgres service on `5432`

## 6. SEO baseline

### Existing SEO implementation

Current files:

- [layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/layout.tsx)
- [sitemap.ts](/Users/aman/Projects/personal-projects/Learn-Language/app/sitemap.ts)
- [robots.ts](/Users/aman/Projects/personal-projects/Learn-Language/app/robots.ts)
- [seo.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/domain/constants/seo.ts)

Current strengths:

- base metadata is present
- Open Graph and Twitter metadata exist
- JSON-LD structured data exists
- sitemap exists
- robots exists

### Current SEO contradictions and gaps

Current contradictions:

- `robots.ts` disallows `/review/` and `/quiz/`
- `APP_PUBLIC_ROUTES` still includes `/review` and `/review/add`
- `APP_PUBLIC_ROUTES` also includes `/auth` and `/profile`, which are auth-related rather than obviously public discovery routes

Current technical gap list:

- route-level metadata policy is not defined per public page
- public/private route classification is not explicit
- sitemap currently uses a static route list rather than a clearly justified public-route map
- there is no documented Search Console submission or monitoring runbook

## 7. Analytics baseline

### Current state

There is no Mixpanel or equivalent product analytics SDK integrated at this time.

Repo search result:

- no Mixpanel/PostHog/Plausible SDK usage was found in `client`, `server`, `app`, or `shared`

Current situation:

- some product-like events are logged through `logApiEvent(...)`
- these log events are not product analytics events
- there is no vendor abstraction
- there is no event taxonomy document
- there is no consent/env gating design

## 8. Immediate implications for next Phase 10 tasks

### P10-002 implications

The API-envelope task must account for:

- raw success responses across all controllers
- already-standardized error envelopes
- the need for additional codes beyond the current `ErrorCode` union
- frontend services and hooks that parse raw `response.data`

### P10-003 implications

The route-normalization task must account for:

- manual auth route mounting under `/auth/*`
- hardcoded `/api/...` strings in controller decorators
- client services that still hardcode review/auth paths

### P10-004 implications

The observability task should extend:

- existing Winston transport
- existing requestId behavior
- existing Nest logger integration

It should replace:

- inconsistent log schema usage
- `console.error` fallbacks
- non-redacted free-form logging

### P10-006 and P10-007 implications

Security/runtime hardening should prioritize:

- browser headers
- rate limiting
- auth token posture review
- backend public-port exposure reduction
- operational topology clarification

### P10-009 implications

SEO work must start by reclassifying routes, because the current sitemap and robots rules are not internally consistent.
