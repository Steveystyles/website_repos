#!/usr/bin/env bash

echo "📦 Running containers:"
docker ps --format "table {{.Names}}\t{{.Ports}}"

echo
echo "🧠 Mode detection:"

if docker ps --format '{{.Names}}' | grep -q website-dev; then
  echo "🧪 DEV mode is running"
elif docker ps --format '{{.Names}}' | grep -q website-app; then
  echo "🚀 PROD mode is running"
else
  echo "⚠️ No mode active"
fi
