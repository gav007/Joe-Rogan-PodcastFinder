#!/bin/bash

PORT=8123

PID=$(lsof -ti tcp:$PORT)

if [ -z "$PID" ]; then
    echo "Podcast Finder server is not running."
    exit 0
fi

echo "Stopping Podcast Finder server on port $PORT..."
kill $PID
echo "Stopped."
