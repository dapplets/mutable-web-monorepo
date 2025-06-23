#!/bin/sh
echo "Running migrations..."
node ./apps/aigency-backend/node_modules/typeorm/cli.js migration:run -d ./apps/aigency-backend/dist/typeorm.config.js

echo "Starting the app..."
node ./apps/aigency-backend/dist/main.js
