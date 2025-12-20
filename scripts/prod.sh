#!/usr/bin/env bash
set -e
source "$(dirname "$0")/_common.sh"

ensure_clean

echo "🚀 Starting PROD environment"

cd "$WEBSITE_DIR"
docker compose -f docker-compose.yml up -d

cd "$NGINX_DIR"
docker compose up -d

echo
echo "✅ PROD running at:"
echo "   https://fultonsmovies.co.uk"
