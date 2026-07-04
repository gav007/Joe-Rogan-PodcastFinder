#!/bin/bash
# Starts the local web server for Podcast Finder.
#
# Usage:
#   ./scripts/start_web_app.sh
#
# Stop it:
#   Press Ctrl+C in the terminal it's running in, or from another terminal:
#   fuser -k 8123/tcp
#
# Restart it:
#   Stop it as above, then run this script again.

set -e

cd "$(dirname "$0")/.." || exit 1

PORT=8123

if ss -ltn "( sport = :$PORT )" | grep -q ":$PORT"; then
    echo "Port $PORT is already in use - the web app may already be running."
    echo "Open http://localhost:$PORT/web/index.html in your browser."
    echo "To stop the existing server: fuser -k ${PORT}/tcp"
    exit 0
fi

echo "Starting Podcast Finder web server on port $PORT..."
echo "Open http://localhost:$PORT/web/index.html in your browser."
echo "Press Ctrl+C to stop."
exec python3 -m http.server "$PORT"
