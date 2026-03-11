# Security Hardening Contract

This document records the completed `P10-006` baseline hardening now enforced by the backend runtime.

## Current protections

- backend responses now include baseline browser security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- production responses additionally emit HSTS
- sensitive auth responses now send `Cache-Control: no-store`
- generated audio static serving now disables dotfiles, directory redirects, index serving, and fallback traversal
- auth, quiz, audio resolve, and review endpoints now have targeted in-memory rate limits
- request rejections from CORS and other unhandled Express-layer failures now map to the canonical error envelope instead of leaking default HTML or stack-shaped output
- reviewer authorization now correctly returns `403 FORBIDDEN` instead of a mismatched `UNAUTHORIZED` error code

## Current route protections

- `/api/auth/*`
  - no-store caching
  - auth-focused rate limiting
- `/api/quiz/*`
  - request rate limiting
- `/api/audio/resolve`
  - request rate limiting
- `/api/review/*`
  - reviewer/admin authorization where required
  - request rate limiting
- `/audio/generated/*`
  - hardened static serving options

## Current envelope additions

Security and abuse-control failures may now return:

- `RATE_LIMITED`

This is emitted with HTTP `429` through the same shared envelope used by the rest of the API.

## Known limitations

- current rate limiting is in-memory and process-local; it protects a single runtime instance but is not yet shared across horizontally scaled nodes
- CSRF posture is still implicitly tied to the current bearer/cookie auth split and should be revisited if more state-changing cookie-auth endpoints are added
- security headers are backend/API oriented; frontend document-level CSP remains a separate future concern if the rendering stack is tightened further
