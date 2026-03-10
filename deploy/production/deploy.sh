#!/usr/bin/env sh
set -eu

: "${APP_DIR:?APP_DIR is required}"
: "${GHCR_OWNER:?GHCR_OWNER is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

cd "$APP_DIR"

if [ ! -f .env.production ]; then
  echo "Missing $APP_DIR/.env.production"
  echo "Create $APP_DIR/.env.production before running deploy."
  exit 1
fi

cat > .deploy.env <<EOF
GHCR_OWNER=$GHCR_OWNER
IMAGE_TAG=$IMAGE_TAG
EOF

if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
else
  echo "GHCR credentials not provided; assuming public images."
fi

docker compose --env-file .deploy.env -f docker-compose.prod.yml pull
docker compose --env-file .deploy.env -f docker-compose.prod.yml up -d --remove-orphans

docker image prune -f >/dev/null 2>&1 || true

echo "Deployed images tagged $IMAGE_TAG"
docker compose --env-file .deploy.env -f docker-compose.prod.yml ps
