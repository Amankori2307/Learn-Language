#!/usr/bin/env sh
set -eu

timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

log() {
  level="$1"
  shift
  printf "%s [%s] %s\n" "$(timestamp)" "$level" "$*"
}

fail() {
  log "ERROR" "$*"
  exit 1
}

require_env() {
  name="$1"
  eval "value=\${$name:-}"
  [ -n "$value" ] || fail "$name is required"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

derive_ghcr_owner() {
  remote_url="$(git config --get remote.origin.url || true)"
  [ -n "$remote_url" ] || return 1

  owner="$(printf "%s" "$remote_url" \
    | sed -E 's#^[^@]+@[^:]+:##; s#^https?://[^/]+/##; s#\.git$##' \
    | cut -d/ -f1 \
    | tr '[:upper:]' '[:lower:]')"

  [ -n "$owner" ] || return 1
  printf "%s" "$owner"
}

CURRENT_STEP="initialization"

on_exit() {
  status=$?
  if [ "$status" -eq 0 ]; then
    log "INFO" "Deployment completed successfully"
    exit 0
  fi
  log "ERROR" "Deployment failed during step: $CURRENT_STEP"
  exit "$status"
}

trap on_exit EXIT

require_env PROD_SSH_HOST
require_env PROD_SSH_USER
require_env PROD_APP_DIR

require_cmd ssh
require_cmd scp

if [ ! -f .env.production ]; then
  fail "Missing local .env.production"
fi

IMAGE_TAG="${IMAGE_TAG:-latest}"

if [ -n "${GHCR_OWNER:-}" ]; then
  GHCR_OWNER="$GHCR_OWNER"
else
  require_cmd git
  GHCR_OWNER="$(derive_ghcr_owner)"
fi

if [ -z "${GHCR_OWNER}" ]; then
  fail "Could not determine GHCR_OWNER from git remote. Set GHCR_OWNER explicitly."
fi

run_ssh() {
  if [ -n "${PROD_SSH_PASSWORD:-}" ]; then
    SSHPASS="${PROD_SSH_PASSWORD}" sshpass -e ssh \
      -o PreferredAuthentications=password \
      -o PubkeyAuthentication=no \
      -o IdentitiesOnly=yes \
      -o StrictHostKeyChecking=no \
      -o UserKnownHostsFile=/dev/null \
      "$@"
    return
  fi
  ssh "$@"
}

run_scp() {
  if [ -n "${PROD_SSH_PASSWORD:-}" ]; then
    SSHPASS="${PROD_SSH_PASSWORD}" sshpass -e scp \
      -o PreferredAuthentications=password \
      -o PubkeyAuthentication=no \
      -o IdentitiesOnly=yes \
      -o StrictHostKeyChecking=no \
      -o UserKnownHostsFile=/dev/null \
      "$@"
    return
  fi
  scp "$@"
}

if [ -n "${PROD_SSH_PASSWORD:-}" ] && ! command -v sshpass >/dev/null 2>&1; then
  fail "sshpass is required when PROD_SSH_PASSWORD is set."
fi

log "INFO" "Starting deploy"
log "INFO" "Target: ${PROD_SSH_USER}@${PROD_SSH_HOST}:${PROD_APP_DIR}"
log "INFO" "Image tag: ${IMAGE_TAG}"
log "INFO" "GHCR owner: ${GHCR_OWNER}"
if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  log "INFO" "GHCR credentials provided; remote deploy will authenticate before pull"
else
  log "INFO" "GHCR credentials not provided; remote deploy will assume public images"
fi

CURRENT_STEP="prepare remote directory"
log "INFO" "Ensuring remote directory exists"
run_ssh "$PROD_SSH_USER@$PROD_SSH_HOST" "mkdir -p '$PROD_APP_DIR'"

CURRENT_STEP="upload deploy bundle"
log "INFO" "Uploading deploy bundle and production env to remote server"
run_scp \
  deploy/production/docker-compose.prod.yml \
  deploy/production/deploy.sh \
  .env.production \
  "$PROD_SSH_USER@$PROD_SSH_HOST:$PROD_APP_DIR/"

CURRENT_STEP="set remote script permissions"
log "INFO" "Marking remote deploy script as executable and locking env permissions"
run_ssh \
  "$PROD_SSH_USER@$PROD_SSH_HOST" \
  "chmod +x '$PROD_APP_DIR/deploy.sh' && chmod 600 '$PROD_APP_DIR/.env.production'"

CURRENT_STEP="run remote deployment"
log "INFO" "Triggering remote deployment"
run_ssh \
  "$PROD_SSH_USER@$PROD_SSH_HOST" \
  "APP_DIR='$PROD_APP_DIR' GHCR_OWNER='$GHCR_OWNER' GHCR_USERNAME='${GHCR_USERNAME:-}' GHCR_TOKEN='${GHCR_TOKEN:-}' IMAGE_TAG='$IMAGE_TAG' '$PROD_APP_DIR/deploy.sh'"

CURRENT_STEP="finalization"
log "INFO" "Remote deployment finished"
