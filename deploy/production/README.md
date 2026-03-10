# Production Deploy

This directory contains the server-side files used by the local deploy script to roll the latest published images onto a remote host.

## Remote layout

Create a directory on the server, for example:

```sh
mkdir -p /opt/learn-language
```

The local deploy script copies these files into that directory:

- `docker-compose.prod.yml`
- `deploy.sh`

You must create the production env file on the server once:

```sh
touch /opt/learn-language/.env.production
```

Then fill in the real values, especially:

- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `FRONTEND_BASE_URL`
- `FRONTEND_ORIGINS`

## Local deploy command

Run the deploy from your machine after the GitHub Actions image build finishes.

Required environment variables:

- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_APP_DIR`
- `GHCR_USERNAME`
- `GHCR_TOKEN`

Optional environment variables:

- `PROD_SSH_PASSWORD`
  - only needed if you are using password SSH auth; requires `sshpass` locally
- `GHCR_OWNER`
  - defaults to the GitHub repo owner inferred from `origin`
- `IMAGE_TAG`
  - defaults to `sha-$(git rev-parse HEAD)`

Example:

```sh
export PROD_SSH_HOST=your-server-ip
export PROD_SSH_USER=root
export PROD_APP_DIR=/opt/learn-language
export GHCR_USERNAME=your-github-username
export GHCR_TOKEN=your-ghcr-read-token
./script/deploy-production.sh
```

## Server prerequisites

Install these on the server:

- Docker
- Docker Compose v2 (`docker compose`)

The deploy script logs into `ghcr.io`, pulls the exact image tag built from the current commit, and restarts the frontend and backend containers.
