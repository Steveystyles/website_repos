#!/usr/bin/env bash
set -e

echo "🚀 Switching to PROD mode..."

# Stop dev stack if running
echo "⛔ Stopping DEV containers (if any)..."
cd ~/website/docker/website || exit 1
docker compose -f docker-compose.dev.yml down || true

# Start prod website
echo "▶️ Starting PROD website..."
docker compose up -d

# Start nginx
echo "▶️ Starting nginx..."
cd ~/website/docker/nginx || exit 1
docker compose up -d

echo "✅ PROD mode active"
echo "🌍 https://fultonsmovies.co.uk"
