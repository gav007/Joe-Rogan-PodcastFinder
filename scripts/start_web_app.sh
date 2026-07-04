#!/bin/bash

set -e

cd /home/gav/podcasts-finder || exit 1

PORT=8123
URL="http://localhost:$PORT/web/index.html"

mkdir -p logs

if ss -ltn | grep -q ":$PORT "; then
    echo "Podcast Finder server is already running on port $PORT."
else
    echo "Starting Podcast Finder web server on port $PORT..."
    nohup python3 -m http.server "$PORT" --bind 0.0.0.0 > logs/web_server.log 2>&1 &
    sleep 2
fi

echo "Opening Podcast Finder in browser..."
powershell.exe -NoProfile -Command "Start-Process '$URL'" >/dev/null 2>&1

echo "Done. Browser should be open at $URL"
