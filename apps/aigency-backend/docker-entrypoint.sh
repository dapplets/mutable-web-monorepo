#!/bin/sh
echo "Running migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/typeorm.config.js

echo "Starting the app..."
node ./dist/main.js
