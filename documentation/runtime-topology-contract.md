# Runtime Topology Contract

This document records the completed `P10-007` runtime exposure hardening.

## Current topology

- public traffic is expected to enter through the host reverse proxy on `80/443`
- frontend and backend containers are still reachable from the host, but only through loopback-bound published ports
- frontend host binding is now configurable through:
  - `FRONTEND_HOST_BIND`
  - `FRONTEND_HOST_PORT`
  - `FRONTEND_PORT`
- backend host binding is now configurable through:
  - `BACKEND_HOST_BIND`
  - `BACKEND_HOST_PORT`
  - `BACKEND_PORT`

Default production bindings now resolve to:

- `127.0.0.1:3000 -> frontend container`
- `127.0.0.1:5001 -> backend container`

This preserves the current Nginx-on-host proxy model while removing direct public exposure of the application containers.

## Current invariants

- application code no longer assumes the frontend dev port is always `3000`; `dev:frontend` now honors `FRONTEND_PORT`
- backend app config now resolves its runtime port from `BACKEND_PORT` first, which matches bootstrap behavior and removes the old `PORT=3000` drift
- production compose no longer publishes frontend/backend ports on all interfaces by default

## Operational implications

- Nginx or any host-level reverse proxy should continue proxying to loopback-bound ports
- UFW should allow only `22`, `80`, and `443` for the app surface in the normal production posture
- temporary direct port exposure for debugging should be explicit and temporary, not the default steady-state deployment

## Known limitations

- ports are now configurable and not publicly exposed by default, but the reverse proxy entry point remains intentionally stable and discoverable on `80/443`
- this is still a host-proxy topology rather than a pure internal Docker-network proxy topology
