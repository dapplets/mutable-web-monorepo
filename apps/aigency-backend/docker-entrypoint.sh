#!/bin/sh
echo "Running migrations..."
node dist/typeorm-cli.js migration:run -d dist/typeorm.config.js

echo "Starting the app..."
node dist/main.js
