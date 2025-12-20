#!/usr/bin/env bash
set -e
source "$(dirname "$0")/_common.sh"

echo "🛑 Stopping all containers (compose-managed)"

cd "$WEBSITE_DIR" && docker compose down || true
cd "$NGINX_DIR" && docker compose down || true

echo "🧹 Cleaning up orphan website/nginx containers (if any)"

docker ps -a --format '{{.Names}}' \
  | grep -E '^website|^nginx' \
  | xargs -r docker stop

docker ps -a --format '{{.Names}}' \
  | grep -E '^website|^nginx' \
  | xargs -r docker rm

echo "✅ All containers stopped"
