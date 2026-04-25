#!/bin/sh
set -e

install_deps() {
  echo "Checking/Installing dependencies..."
  npm install
}

install_deps

if [ "$1" = "npm" ] && [ "$2" = "run" ] && [ "$3" = "dev" ]; then
  (
    while true; do
      inotifywait -e modify /app/package.json
      echo "package.json changed, updating dependencies..."
      npm install
    done
  ) &
fi

exec "$@"
