#!/bin/bash
cd "$(dirname "$0")"
echo "Building Utah 3D Terrain Map..."
npm run build 2>&1 | tail -3
echo ""
echo "Starting preview server..."
npx vite preview --open
