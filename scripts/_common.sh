#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEBSITE_DIR="$ROOT_DIR/docker/website"
NGINX_DIR="$ROOT_DIR/docker/nginx"

running_containers() {
  docker ps --filter "label=com.docker.compose.project" --format '{{.Names}}' | grep -E 'website|nginx' || true
}

ensure_clean() {
  if running_containers | grep -q .; then
    echo "❌ Containers already running:"
    running_containers
    echo
    echo "Run: make stop"
    exit 1
  fi
}
