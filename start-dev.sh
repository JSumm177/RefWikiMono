#!/bin/bash

# Enforce Java 21
if ! java -version 2>&1 | grep -q "version \"21\."; then
  echo "❌ Error: Java 21 is required but not found."
  echo "Please install Java 21 or set your JAVA_HOME appropriately."
  exit 1
fi

# Optional: Auto-sync pods if they are missing
if [ ! -d "mobile/ios/Pods" ]; then
  echo "📦 Installing iOS dependencies..."
  (cd mobile/ios && pod install)
fi

# Android Prep: Auto-generate local.properties if missing
if [ ! -f "mobile/android/local.properties" ] && [ -n "$ANDROID_HOME" ]; then
  echo "🤖 Generating mobile/android/local.properties using ANDROID_HOME..."
  echo "sdk.dir=$ANDROID_HOME" > mobile/android/local.properties
fi

# Start the database container
docker compose up -d db

# Load .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run the three environments concurrently.
# We use wait-on to wait for the Metro bundler (port 8081) to be ready before kicking off the Android and iOS builds/simulators.
npx concurrently \
  "docker compose up backend-dev" \
  "cd frontend && npm run dev" \
  "cd mobile && npm start" \
  "npx wait-on tcp:8081 && cd mobile && npm run android" \
  "npx wait-on tcp:8081 && cd mobile && npm run ios"
