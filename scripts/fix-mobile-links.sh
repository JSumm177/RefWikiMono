#!/bin/bash
PROJECT_ROOT=$(pwd)
MOBILE_ROOT="$PROJECT_ROOT/mobile"
NODE_MODULES="$PROJECT_ROOT/node_modules"

mkdir -p "$MOBILE_ROOT/node_modules"

# List of common packages that should be linked
packages=(
  "react"
  "react-dom"
  "@babel/runtime"
  "fbjs"
  "invariant"
  "nullthrows"
)

for pkg in "${packages[@]}"; do
  if [ ! -d "$MOBILE_ROOT/node_modules/$pkg" ]; then
    echo "Linking $pkg..."
    if [[ $pkg == @*/* ]]; then
      # Handle scoped packages
      scope=$(echo $pkg | cut -d'/' -f1)
      mkdir -p "$MOBILE_ROOT/node_modules/$scope"
    fi
    ln -s "$NODE_MODULES/$pkg" "$MOBILE_ROOT/node_modules/$pkg"
  fi
done
