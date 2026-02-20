# Docker Compose Single-Command Setup

This setup brings up:
- PostgreSQL (`db`)
- App server + UI (`app`)

The app container startup sequence:
1. Wait for Postgres readiness
2. Run `db:push`
3. Run `content:import:mvp`
4. Build app
5. Start app

## Run

```bash
docker compose up --build
```

App URL:
- [http://localhost:5000](http://localhost:5000)

Notes:
- Compose defaults `AUTH_PROVIDER=dev` so you can use the app locally without external OAuth setup.
- For Google OAuth, set `AUTH_PROVIDER=google` and provide `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + callback registration.

## Reset DB

```bash
docker compose down -v
```

Then re-run `docker compose up --build`.

