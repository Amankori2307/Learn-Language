# Platform Hardening Baseline

This document records the current hardened backend/runtime baseline after the Phase 10 work landed. It is the high-level inventory that ties together the more specific contracts in `documentation/`.

## API transport contract

The backend now uses shared response envelopes instead of mixed raw payloads.

Primary implementation:

- [server/src/common/http.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/http.ts)
- [shared/routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts)

Current success shape:

```ts
{
  success: true,
  error: false,
  data: T,
  message: string,
  requestId: string,
  meta?: Record<string, unknown>
}
```

Current error shape:

```ts
{
  success: false,
  error: true,
  data: null,
  code: "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION_ERROR" | "NOT_FOUND" | "RATE_LIMITED" | "INTERNAL_ERROR",
  message: string,
  requestId: string,
  details?: unknown
}
```

## Route registration baseline

The Nest app now applies a global `api` prefix in [server/src/main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts).

Current route shape:

- controller routes such as `/auth/me` become `/api/auth/me`
- auth OIDC endpoints are mounted directly on `/api/auth/google`, `/api/auth/google/callback`, and `/api/auth/logout`
- shared route ownership is centralized in [shared/routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts)

Current feature modules exposed by the backend:

- auth
- quiz
- analytics
- vocabulary
- review
- audio
- infra/admin

## Security and abuse-control baseline

Primary implementation:

- [server/src/main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts)
- [server/src/common/security/security.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/security/security.ts)
- [documentation/operations/security.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/security.md)

Current protections:

- CORS allowlist resolution from configured frontend origins plus local defaults
- global validation pipe with transform and whitelisting
- explicit browser/security headers on backend responses
- `x-request-id` propagation per request
- `no-store` caching for `/api/auth/*`
- rate limiting for:
  - `/api/auth/*`
  - `/api/quiz/*`
  - `/api/audio/resolve`
  - `/api/review/*`
- hardened static serving for generated audio under `/audio/generated`
- centralized Express-layer error mapping

## Observability baseline

Primary implementation:

- [server/src/common/logger/logger.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/logger/logger.ts)
- [server/src/common/logger/nest-app-logger.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/logger/nest-app-logger.ts)
- [documentation/operations/observability.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/observability.md)

Current behavior:

- Winston owns backend logging
- request lifecycle logs are structured JSON
- request IDs are propagated into responses and logs
- sensitive fields are redacted recursively
- API event logging still uses `logApiEvent(...)` for internal event-shaped logs

## Runtime exposure baseline

Primary implementation:

- [deploy/production/docker-compose.prod.yml](/Users/aman/Projects/personal-projects/Learn-Language/deploy/production/docker-compose.prod.yml)
- [documentation/operations/runtime-topology.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/runtime-topology.md)

Current production posture:

- public traffic is expected through the host reverse proxy on `80/443`
- frontend and backend ports are loopback-bound by default
- frontend runtime port comes from `FRONTEND_PORT`
- backend runtime port comes from `BACKEND_PORT`

## SEO/runtime exposure baseline

Primary implementation:

- [shared/domain/constants/seo.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/domain/constants/seo.ts)
- [app/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/layout.tsx)
- [app/sitemap.ts](/Users/aman/Projects/personal-projects/Learn-Language/app/sitemap.ts)
- [app/robots.ts](/Users/aman/Projects/personal-projects/Learn-Language/app/robots.ts)
- [documentation/operations/seo-crawlability.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/seo-crawlability.md)

Current behavior:

- public/indexable and protected/non-indexable routes are owned from one shared registry
- sitemap entries are generated only from indexable routes
- protected app routes and `/api/` are disallowed in robots output
- root layout owns the common metadata, icons, manifest, GTM bootstrap, and structured data

## Related detailed contracts

Use this file as the top-level inventory, then defer to the specialized docs for exact rules:

- [security-hardening-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/security.md)
- [observability-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/observability.md)
- [runtime-topology-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/runtime-topology.md)
- [seo-crawlability-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/seo-crawlability.md)
