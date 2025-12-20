#!/usr/bin/env bash
set -e
source "$(dirname "$0")/_common.sh"

ensure_clean

echo "🚀 Starting DEV environment"

cd "$WEBSITE_DIR"
docker compose -f docker-compose.dev.yml up -d

echo
echo "✅ DEV running at:"
echo "   http://192.168.0.15:3000"
