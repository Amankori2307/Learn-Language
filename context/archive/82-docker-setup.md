# Docker Compose Setup (Hot Reload)

This setup brings up:
- PostgreSQL (`db`)
- App server + UI dev runtime (`app`)

The app container startup sequence:
1. Wait for Postgres readiness
2. Install dependencies (`pnpm install`)
3. Run `db:migrate`
4. Run review governance migration + backfill scripts
5. Run `content:import:mvp` (if seed exists)
6. Start `pnpm run dev` (watch mode)

## Run

```bash
docker compose up --build
```

App URL:
- [http://localhost:3000](http://localhost:3000)

Notes:
- Compose mounts the repo into `/app`; backend and frontend changes should auto-refresh without rebuilding image.
- Polling is enabled (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`) for stable file watching on Docker Desktop/macOS.
- `CI=true` is set in compose so `pnpm install` can run non-interactively in container startup.
- If you change dependencies (`package.json`), restart compose once.
- For Google OAuth, set `AUTH_PROVIDER=google` and provide `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`.

## Reset DB

```bash
docker compose down -v
```

Then re-run `docker compose up --build`.
