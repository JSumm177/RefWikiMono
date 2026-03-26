#!/bin/bash

# Check if the mysql-db container is running
if [ "$(docker ps -q -f name=mysql-db)" ]; then
    echo "Database is running. Starting the web application..."
    # Build and start the 'app' service in the background
    docker-compose up -d --build app
else
    echo "Error: The database container ('mysql-db') is not running."
    echo "Please start the database first before starting the web application."
    exit 1
fi
