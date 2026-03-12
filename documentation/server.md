# Server Setup

This document records the exact production server setup performed for `Learn-Language` on `2026-03-10`, so the stack can be rebuilt if the server is replaced or reset.

## Target server

- Provider: Contabo
- Host IP: `5.189.158.30`
- OS: Ubuntu `24.04.4 LTS`
- App domains:
  - `learn-lang.amankori.me`
  - `api.learn-lang.amankori.me`
- App directory on server: `/opt/learn-language`

## What GitHub Actions does

The CI/CD workflow in [`.github/workflows/ci-cd.yml`](/Users/aman/Projects/personal-projects/Learn-Language/.github/workflows/ci-cd.yml) only:

- builds the app
- builds Docker images
- pushes images to GHCR

It does not deploy to the server.

## What deploys the server

Manual deployment is done from local machine with:

- [`script/deploy-production.sh`](/Users/aman/Projects/personal-projects/Learn-Language/script/deploy-production.sh)

The deploy script defaults to the `latest` image tag, so deployment is not tied to the local checked-out branch. Set `IMAGE_TAG` explicitly only when you want to deploy a specific published image.

Server-side runtime files are:

- [`deploy/production/docker-compose.prod.yml`](/Users/aman/Projects/personal-projects/Learn-Language/deploy/production/docker-compose.prod.yml)
- [`deploy/production/deploy.sh`](/Users/aman/Projects/personal-projects/Learn-Language/deploy/production/deploy.sh)

## Initial server inspection that was done

Connected to the server over SSH and checked:

```sh
cat /etc/os-release
pwd
ls -la /root
ls -la /opt
```

Result:

- Ubuntu `24.04.4 LTS`
- no existing app deployment in `/opt`
- no Nginx installed initially
- no Docker installed initially

## Docker and Compose installation

Installed Docker Engine and Docker Compose v2:

```sh
apt-get update
apt-get install -y docker.io docker-compose-v2
systemctl enable --now docker
docker --version
docker compose version
```

Installed versions at setup time:

- Docker `28.2.2`
- Docker Compose `2.37.1`

## Verified GHCR image pull

Tested that GHCR images were publicly pullable from the server:

```sh
docker pull ghcr.io/amankori2307/learn-lang-backend:latest
```

This succeeded, so GHCR authentication is optional for deployment as long as the images remain public.

## Firewall changes

UFW was already active.

Existing allowed ports:

- `22`
- `80`
- `443`
- `10102`

Added app ports during initial setup:

```sh
ufw allow 3000/tcp
ufw allow 5001/tcp
```

These were initially left open so the containers could be reached directly if needed.

Current recommended steady-state posture:

- keep public traffic on `80/443` only
- proxy from Nginx to loopback-bound container ports
- do not leave `3000` and `5001` publicly open unless temporarily debugging

## App directory creation

Created deployment directory:

```sh
mkdir -p /opt/learn-language
```

Uploaded these files into `/opt/learn-language`:

- `docker-compose.prod.yml`
- `deploy.sh`
- `.env.production` (now uploaded from local on every deploy)

## Runtime env files created on server

Created `/opt/learn-language/.deploy.env` with:

```env
GHCR_OWNER=amankori2307
IMAGE_TAG=latest
```

Production now uses `/opt/learn-language/.env.production`.
The local deploy script uploads the repository's `.env.production` to that path on every deploy, then force-recreates the containers so runtime env changes are applied.

Originally the server was bootstrapped with `/opt/learn-language/.env.backend`, but the setup was later normalized to `.env.production` so the Docker runtime matches the app's production env naming.

Final effective values written during setup:

```env
DATABASE_URL=postgresql://u_learn_language:<db-password>@5.189.158.30:10102/learn_language
AUTH_PROVIDER=google
GOOGLE_CLIENT_ID=placeholder-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=placeholder-google-client-secret
JWT_SECRET=learn-language-prod-secret-2026
FRONTEND_BASE_URL=https://learn-lang.amankori.me
FRONTEND_ORIGINS=https://learn-lang.amankori.me
REVIEWER_EMAILS=
ADMIN_EMAILS=
ENABLE_GCP_TTS=false
GOOGLE_TTS_API_KEY=
```

Then locked the files down:

```sh
chmod 600 /opt/learn-language/.env.production /opt/learn-language/.deploy.env
```

## Important secret note

The credentials originally pasted into chat should be treated as exposed.

Rotate these:

- server root password
- Postgres password
- `JWT_SECRET`

Also replace the placeholder Google OAuth values in `/opt/learn-language/.env.production` with the real production credentials.

## Docker Compose stack

The production compose file uses:

- frontend image: `ghcr.io/${GHCR_OWNER}/learn-lang-frontend:${IMAGE_TAG}`
- backend image: `ghcr.io/${GHCR_OWNER}/learn-lang-backend:${IMAGE_TAG}`

Frontend:

- binds loopback-only host port `${FRONTEND_HOST_BIND:-127.0.0.1}:${FRONTEND_HOST_PORT:-3000}` to container `${FRONTEND_PORT:-3000}`

Backend:

- binds loopback-only host port `${BACKEND_HOST_BIND:-127.0.0.1}:${BACKEND_HOST_PORT:-5001}` to container `${BACKEND_PORT:-5001}`
- loads env from `.env.production`
- runs:

```sh
pnpm run db:migrate:production && pnpm run content:import:production && pnpm run start:backend
```

## First production startup

Started the stack with:

```sh
cd /opt/learn-language
docker compose --env-file .deploy.env -f docker-compose.prod.yml up -d --pull always
docker compose --env-file .deploy.env -f docker-compose.prod.yml ps
docker compose --env-file .deploy.env -f docker-compose.prod.yml logs backend --tail=100
docker compose --env-file .deploy.env -f docker-compose.prod.yml logs frontend --tail=100
```

What happened:

- frontend image pulled successfully
- backend image pulled successfully
- backend ran DB migrations successfully
- backend imported dataset successfully
- frontend started successfully on port `3000`
- backend started successfully on port `5001`

Observed backend startup behavior:

- `GET /` returns `404`
- protected API endpoints return `401` without auth
- this is expected

## Direct IP verification that was done during initial setup

Verified direct access before Nginx:

```sh
curl -I http://5.189.158.30:3000
curl -i http://5.189.158.30:5001/api/admin/srs/drift
```

Result:

- frontend returned `200 OK`
- backend protected endpoint returned `401 Unauthorized`

## DNS verification

After domain update, verified both domains resolved to the server:

```sh
getent hosts learn-lang.amankori.me api.learn-lang.amankori.me
hostname -I
ufw status
```

Confirmed:

- `learn-lang.amankori.me -> 5.189.158.30`
- `api.learn-lang.amankori.me -> 5.189.158.30`

## Nginx installation

Installed and enabled Nginx:

```sh
apt-get update
apt-get install -y nginx
systemctl enable --now nginx
nginx -v
systemctl status nginx --no-pager --lines=20
```

## Nginx reverse proxy config

Created `/etc/nginx/sites-available/learn-language` with two server blocks.

Frontend host:

- `server_name learn-lang.amankori.me`
- proxies to `http://127.0.0.1:3000`

API host:

- `server_name api.learn-lang.amankori.me`
- proxies to `http://127.0.0.1:5001`

Shared proxy headers configured:

- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `Upgrade`
- `Connection "upgrade"`

Applied config with:

```sh
ln -sf /etc/nginx/sites-available/learn-language /etc/nginx/sites-enabled/learn-language
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## Backend env update for production domain

After DNS and Nginx were ready, updated backend env to production domain values:

```sh
sed -i "s#^FRONTEND_BASE_URL=.*#FRONTEND_BASE_URL=https://learn-lang.amankori.me#" /opt/learn-language/.env.production
sed -i "s#^FRONTEND_ORIGINS=.*#FRONTEND_ORIGINS=https://learn-lang.amankori.me#" /opt/learn-language/.env.production
```

Then restarted backend:

```sh
cd /opt/learn-language
docker compose --env-file .deploy.env -f docker-compose.prod.yml restart backend
```

## Let’s Encrypt SSL setup

Installed Certbot and Nginx plugin:

```sh
apt-get update
apt-get install -y certbot python3-certbot-nginx
```

Issued certificates and enabled redirects:

```sh
certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect \
  -d learn-lang.amankori.me \
  -d api.learn-lang.amankori.me
```

Result:

- certificate issued successfully
- HTTPS enabled for both domains
- HTTP redirected to HTTPS
- automatic renewal timer enabled

Certificate path:

```text
/etc/letsencrypt/live/learn-lang.amankori.me/fullchain.pem
/etc/letsencrypt/live/learn-lang.amankori.me/privkey.pem
```

Renewal timer verified with:

```sh
systemctl status certbot.timer --no-pager --lines=10
```

## Final verification that was done

Verified Nginx config:

```sh
nginx -t
```

Verified public HTTP redirect:

```sh
curl -I http://learn-lang.amankori.me
```

Expected:

- `301 Moved Permanently` to `https://learn-lang.amankori.me/`

Verified public HTTPS frontend:

```sh
curl -I https://learn-lang.amankori.me
```

Expected:

- `200 OK`

Verified public HTTPS API:

```sh
curl -i https://api.learn-lang.amankori.me/api/admin/srs/drift
```

Expected:

- `401 Unauthorized`

This `401` is correct because the endpoint is protected and the backend is reachable through Nginx.

## Current known issues / follow-up required

These still need manual completion:

1. Replace `JWT_SECRET` with a strong production secret.
2. Rotate the exposed server and database passwords.
3. Consider closing direct public access to `3000` and `5001` after confirming Nginx-only access is sufficient:

```sh
ufw delete allow 3000/tcp
ufw delete allow 5001/tcp
```

4. Consider changing deployment to SSH key auth instead of root password auth.
5. Consider pinning deploys to `sha-<commit>` instead of `latest` in `/opt/learn-language/.deploy.env` if you want deterministic rollbacks.

## Manual deploy procedure for future use

From local machine, run:

```sh
export PROD_SSH_HOST=5.189.158.30
export PROD_SSH_USER=root
export PROD_APP_DIR=/opt/learn-language
export GHCR_OWNER=amankori2307
export IMAGE_TAG=latest
sh ./script/deploy-production.sh
```

If you want a specific image version:

```sh
export IMAGE_TAG=sha-<full-commit-sha>
sh ./script/deploy-production.sh
```

Because GHCR images were verified as public, `GHCR_USERNAME` and `GHCR_TOKEN` are optional unless repository visibility changes.

## Manual recovery checklist if server crashes

1. Provision Ubuntu 24.04 server.
2. Point DNS for:
   - `learn-lang.amankori.me`
   - `api.learn-lang.amankori.me`
3. Install Docker and Docker Compose.
4. Install Nginx.
5. Install Certbot and `python3-certbot-nginx`.
6. Create `/opt/learn-language`.
7. Copy production deploy files into `/opt/learn-language`.
8. Create local `.env.production` and remote `.deploy.env`.
9. Open firewall ports `22`, `80`, `443`.
10. Optionally open `3000` and `5001` temporarily for debugging.
11. Start Docker stack.
12. Install Nginx proxy config.
13. Request Let’s Encrypt certificates.
14. Verify frontend and API over HTTPS.
15. Replace placeholder Google OAuth credentials before handing over to users.
