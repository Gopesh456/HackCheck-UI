#!/usr/bin/env bash

echo "[INFO] Checking for Node.js..."
if ! command -v node &> /dev/null
then
  echo "[ERROR] Node.js not found. Install it and rerun."
  exit 1
fi

echo "[INFO] Node.js version: $(node -v)"

echo
echo "[INFO] Installing dependencies..."
npm install || { echo "[ERROR] Dependency install failed."; exit 1; }

echo
echo "[INFO] Building the application..."
npm run build || { echo "[ERROR] Build failed."; exit 1; }

echo
echo "[INFO] Starting the server..."
npm run start || { echo "[ERROR] Server start failed."; exit 1; }

echo
echo "[SUCCESS] The application is running!"
echo "Open http://localhost:3000 in your browser."
