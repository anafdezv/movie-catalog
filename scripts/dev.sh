#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_ENV="$ROOT_DIR/backend/.env"
BACKEND_ENV_EXAMPLE="$ROOT_DIR/backend/.env.example"

log() {
  echo "[movie-catalog] $1"
}

ensure_backend_env() {
  if [[ ! -f "$BACKEND_ENV" ]]; then
    cp "$BACKEND_ENV_EXAMPLE" "$BACKEND_ENV"
    log "Created backend/.env from backend/.env.example"
  fi
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed or not available in PATH." >&2
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running. Open Docker Desktop and try again." >&2
    exit 1
  fi
}

start_postgres() {
  log "Starting PostgreSQL container"
  docker compose -f "$ROOT_DIR/docker-compose.yml" up -d postgres >/dev/null
}

wait_for_postgres() {
  log "Waiting for PostgreSQL on localhost:5432"

  for _ in {1..30}; do
    if nc -z localhost 5432 >/dev/null 2>&1; then
      return
    fi

    sleep 1
  done

  echo "PostgreSQL did not become ready on localhost:5432." >&2
  exit 1
}

prepare_backend() {
  log "Generating Prisma client"
  npm run prisma:generate -w backend

  log "Applying migrations"
  npx prisma migrate deploy --schema "$ROOT_DIR/backend/prisma/schema.prisma"

  log "Seeding database"
  npm run seed -w backend
}

start_backend() {
  log "Starting backend dev server"
  npm run dev -w backend
}

main() {
  ensure_backend_env
  ensure_docker
  start_postgres
  wait_for_postgres
  prepare_backend
  start_backend
}

main "$@"
