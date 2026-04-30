#!/bin/bash

# Enforce required tools are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: 'docker' is not installed or not in PATH."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: 'npm' is not installed or not in PATH."
    exit 1
fi

# Enforce Java 21
if ! java -version 2>&1 | grep -q "version \"21\."; then
  echo "❌ Error: Java 21 is required but not found."
  echo "Please install Java 21 or set your JAVA_HOME appropriately."
  exit 1
fi

# Optional: Auto-sync pods if they are missing (macOS only)
if [ "$(uname -s)" == "Darwin" ]; then
  if [ ! -d "mobile/ios/Pods" ]; then
    echo "📦 Installing iOS dependencies..."
    (cd mobile/ios && command -v pod &> /dev/null && pod install || echo "⚠️ Warning: 'pod' command not found, skipping pod install.")
  fi
fi

# Android Prep: Auto-generate local.properties if missing
if [ ! -f "mobile/android/local.properties" ] && [ -n "$ANDROID_HOME" ]; then
  echo "🤖 Generating mobile/android/local.properties using ANDROID_HOME..."
  echo "sdk.dir=$ANDROID_HOME" > mobile/android/local.properties
fi

# Start the database container
docker compose up -d db

# Load .env file if it exists safely
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Prepare commands for concurrent execution
COMMANDS=(
  "docker compose up backend-dev"
  "cd frontend && npm run dev"
  "cd mobile && npm start"
  "npx wait-on tcp:8081 && cd mobile && npm run android -- --no-packager"
)

# Run the iOS build only if on macOS
if [ "$(uname -s)" == "Darwin" ]; then
  COMMANDS+=("npx wait-on tcp:8081 && cd mobile && npm run ios -- --no-packager")
fi

# Run the environments concurrently.
# We use wait-on to wait for the Metro bundler (port 8081) to be ready before kicking off the Android and iOS builds/simulators.
npx --yes concurrently "${COMMANDS[@]}"
