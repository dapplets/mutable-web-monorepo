#!/bin/bash

set -e

# Ensure .env.example exists
if [ ! -f ".env.example" ]; then
  echo "❌ Error: .env.example not found in the current directory."
  exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
  echo "❌ Error: .env already exists."
  echo "Please remove or rename the existing .env file before running this script."
  echo "For example: rm .env"
  exit 1
fi

# Copy the template
cp .env.example .env
echo "✅ Copied .env.example to .env"

# Function to generate a 64-character hex secret
generate_secret() {
  openssl rand -hex 32
}

# Replace all __SECRET__ placeholders with generated secrets
while grep -q "__SECRET__" .env; do
  SECRET=$(generate_secret)
  # Replace only the first occurrence to ensure different secrets
  sed -i "0,/__SECRET__/s/__SECRET__/${SECRET}/" .env
done

echo "✅ Random secrets generated."