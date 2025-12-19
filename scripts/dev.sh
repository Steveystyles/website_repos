#!/usr/bin/env bash
set -e

echo "🔧 Switching to DEV mode..."

# Stop prod stack if running
echo "⛔ Stopping PROD containers (if any)..."
cd ~/website/docker/website || exit 1
docker compose down || true

cd ~/website/docker/nginx || exit 1
docker compose down || true

# Start dev stack
echo "▶️ Starting DEV containers..."
cd ~/website/docker/website || exit 1
docker compose -f docker-compose.dev.yml up -d

echo "✅ DEV mode active"
echo "🌐 http://192.168.0.15:3000"
