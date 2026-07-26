#!/bin/sh
set -e

# Initialize volume with database if it doesn't exist
if [ ! -f /app/data/bank-of-dad.sqlite ]; then
  echo "Initializing database in volume from image..."
  cp /app/data-init/bank-of-dad.sqlite /app/data/bank-of-dad.sqlite
  echo "Database initialized."
else
  echo "Database already exists in volume."
fi

# Start the application
exec "$@"
