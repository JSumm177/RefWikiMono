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

# Optional: Auto-sync pods if they are missing
if [ ! -d "mobile/ios/Pods" ]; then
  echo "📦 Installing iOS dependencies..."
  (cd mobile/ios && pod install)
fi

# Android Prep: Ensure environment and local.properties are correct
if [ -n "$ANDROID_HOME" ]; then
  echo "🤖 Configuring Android environment..."
  # Use macOS tool to set JAVA_HOME for Java 21 if on Darwin
  if [[ "$OSTYPE" == "darwin"* ]]; then
    JAVA_HOME_TEMP=$(/usr/libexec/java_home -v 21 2>/dev/null || echo "$JAVA_HOME")
    export JAVA_HOME="$JAVA_HOME_TEMP"
  fi

  # Ensure local.properties has both SDK and NDK paths
  echo "sdk.dir=$ANDROID_HOME" > mobile/android/local.properties
  NDK_PATH=$(ls -d $ANDROID_HOME/ndk/* 2>/dev/null | sort -V | tail -1)
  if [ -n "$NDK_PATH" ]; then
    echo "ndk.dir=$NDK_PATH" >> mobile/android/local.properties
    export ANDROID_NDK_HOME=$NDK_PATH
  fi
fi

# Start the database container
docker compose up -d db

# Clean up port 8081 to prevent Metro conflicts
lsof -ti:8081 | xargs kill -9 || true

# Check if production container is running on 8080
if [ "$(docker ps -q -f name=refwiki-app)" ]; then
  echo "⚠️ Warning: 'refwiki-app' (production) is running on port 8080."
  echo "This will conflict with 'backend-dev'. Stopping it..."
  docker stop refwiki-app
fi

# Detect and update local IP for mobile apps
./scripts/get-ip.sh

# Load .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

export REACT_TERMINAL=Terminal

# Run the full stack dev environment using Turborepo
# This will concurrently run:
# - backend: docker compose up backend-dev
# - frontend: vite
# - mobile: npx expo start --clear
npm run dev
