#!/bin/bash
cd "$(dirname "$0")"
echo "Building Utah 3D Terrain Map..."
npm run build 2>&1 | tail -3
echo ""
# Kill any stale server on port 4200
lsof -ti :4200 | xargs kill 2>/dev/null
sleep 0.5

echo "Starting preview server..."
npx vite preview --port 4200 --strictPort &
SERVER_PID=$!

# Wait for port 4200 to be listening
for i in $(seq 1 20); do
  sleep 0.5
  if nc -z localhost 4200 2>/dev/null; then
    break
  fi
done

if ! nc -z localhost 4200 2>/dev/null; then
  echo "ERROR: Server failed to start on port 4200."
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

open -na "Google Chrome" --args --new-window "http://localhost:4200"
wait $SERVER_PID
