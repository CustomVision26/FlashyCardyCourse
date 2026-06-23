#!/usr/bin/env bash
set -euo pipefail

# Build & launch Flipvise in the iOS Simulator on a Mac (e.g. a cloud Mac).
#
# Usage:
#   bash scripts/ios-simulator.sh https://your-app.vercel.app
# or:
#   CAPACITOR_SERVER_URL=https://your-app.vercel.app bash scripts/ios-simulator.sh
#
# The app loads its UI from this URL (Flipvise is server-rendered), so point it
# at your deployed site. No Apple signing is required for the Simulator.

URL="${1:-${CAPACITOR_SERVER_URL:-}}"
if [ -z "$URL" ]; then
  echo "ERROR: provide your app URL."
  echo "  bash scripts/ios-simulator.sh https://your-app.vercel.app"
  exit 1
fi
export CAPACITOR_SERVER_URL="$URL"
echo "==> Using server URL: $CAPACITOR_SERVER_URL"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js >= 22 is required. Install it from https://nodejs.org"
  exit 1
fi

echo "==> Installing dependencies"
npm install

if [ ! -d ios ]; then
  echo "==> Adding iOS platform"
  npm run cap:add:ios
fi

echo "==> Applying native iOS customizations"
npm run cap:ios:postadd

echo "==> Generating app icon & splash"
npm run cap:assets:ios

echo "==> Syncing Capacitor"
npx cap sync ios

echo "==> Launching the iOS Simulator (pick a device when prompted)"
npx cap run ios
