#!/bin/bash

# Check if package.json exists at the root level
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found in root directory"
  exit 1
fi

# Check if next.config.mjs exists
if [ ! -f "next.config.mjs" ]; then
  echo "ERROR: next.config.mjs not found"
  exit 1
fi

# Check if app directory exists
if [ ! -d "app" ]; then
  echo "ERROR: app directory not found"
  exit 1
fi

echo "All required files and directories found. Repository structure looks correct."
exit 0
