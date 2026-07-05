#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_ENV="$ROOT_DIR/backend/.env"
BACKEND_ENV_EXAMPLE="$ROOT_DIR/backend/.env.example"
FRONTEND_ENV="$ROOT_DIR/frontend/.env"
FRONTEND_ENV_EXAMPLE="$ROOT_DIR/frontend/.env.example"
FRONTEND_PID=""

log() {
  echo "[movie-catalog] $1"
}

is_port_busy() {
  local port="$1"
  lsof -iTCP:"$port" -sTCP:LISTEN -n -P >/dev/null 2>&1
}

ensure_app_ports_available() {
  if is_port_busy 4000; then
    echo "Port 4000 is already in use. Stop the existing backend before running npm run dev." >&2
    exit 1
  fi

  if is_port_busy 5173; then
    echo "Port 5173 is already in use. Stop the existing frontend before running npm run dev." >&2
    exit 1
  fi
}

ensure_backend_env() {
  if [[ ! -f "$BACKEND_ENV" ]]; then
    cp "$BACKEND_ENV_EXAMPLE" "$BACKEND_ENV"
    log "Created backend/.env from backend/.env.example"
  fi
}

ensure_frontend_env() {
  if [[ -f "$FRONTEND_ENV_EXAMPLE" && ! -f "$FRONTEND_ENV" ]]; then
    cp "$FRONTEND_ENV_EXAMPLE" "$FRONTEND_ENV"
    log "Created frontend/.env from frontend/.env.example"
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
  (
    cd "$ROOT_DIR/backend"
    npx prisma migrate deploy --schema prisma/schema.prisma
  )

  log "Seeding database"
  npm run seed -w backend
}

start_backend() {
  log "Starting backend dev server"
  npm run dev -w backend
}

start_frontend() {
  log "Starting frontend dev server"
  npm run dev -w frontend &
  FRONTEND_PID=$!
}

cleanup() {
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}

main() {
  ensure_backend_env
  ensure_frontend_env
  ensure_app_ports_available
  ensure_docker
  start_postgres
  wait_for_postgres
  prepare_backend
  trap cleanup EXIT INT TERM
  start_frontend
  start_backend
}

main "$@"
