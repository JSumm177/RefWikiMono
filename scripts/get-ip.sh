#!/bin/bash

# Detect local IP on macOS
IP=$(ipconfig getifaddr en0 || ifconfig | grep "inet " | grep -v 127.0.0.1 | cut -d ' ' -f2 | head -n 1)

if [ -z "$IP" ]; then
  IP="localhost"
fi

echo "📍 Current Host IP: $IP"

# Update .env at root
if [ -f .env ]; then
  # Remove existing LOCAL_IP if it exists
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' '/LOCAL_IP=/d' .env
  else
    sed -i '/LOCAL_IP=/d' .env
  fi
  echo "LOCAL_IP=$IP" >> .env
else
  echo "LOCAL_IP=$IP" > .env
fi
