#!/bin/bash

# Detect local IP
IP=$(ipconfig getifaddr en0 || ifconfig | grep "inet " | grep -v 127.0.0.1 | cut -d ' ' -f2 | head -n 1)

if [ -z "$IP" ]; then
  IP="localhost"
fi

echo "Setting Local IP to: $IP"

# Update .env
if [ -f .env ]; then
  # Remove existing LOCAL_IP
  sed -i '' '/LOCAL_IP=/d' .env
  echo "LOCAL_IP=$IP" >> .env
else
  echo "LOCAL_IP=$IP" > .env
fi

# Also update a JS file for the frontend/mobile if needed
echo "export const LOCAL_IP = '$IP';" > mobile/utils/ip.js
