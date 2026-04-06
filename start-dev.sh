#!/bin/bash

# Start the database container
docker compose up -d db

# Load .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run the three environments concurrently
npx concurrently "cd backend && mvn jetty:run" "cd frontend && npm run dev" "cd mobile && npm start"
