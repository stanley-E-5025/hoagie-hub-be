#!/bin/sh

if [ "$RUN_SEED" = "true" ]; then
  echo "Running database seed..."
  node dist/seed.js
  echo "Seed completed."
fi

echo "Starting application..."
npm run start:prod 