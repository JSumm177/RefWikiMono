#!/bin/bash

# Start the database container
docker compose up -d db

# Load .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run the three environments concurrently.
# We use wait-on to wait for the Metro bundler (port 8081) to be ready before kicking off the Android and iOS builds/simulators.
npx concurrently \
  "cd backend && mvn jetty:run" \
  "cd frontend && npm run dev" \
  "cd mobile && npm start" \
  "npx wait-on tcp:8081 && cd mobile && npm run android" \
  "npx wait-on tcp:8081 && cd mobile && npm run ios"
