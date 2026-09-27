#!/bin/bash
# Double-click this file in Finder to start the whole MaidHire project — Postgres, Langflow (the AI
# receptionist backend), Prisma Studio, the shared package build, and both the API and web dev
# servers — without opening a terminal yourself. (macOS's equivalent of a Windows .bat launcher.)

set -e
cd "$(dirname "$0")"

PG_BIN="/usr/local/opt/postgresql@15/bin"
export PATH="$PG_BIN:$PATH"

echo "=================================================="
echo " MaidHire — starting everything"
echo "=================================================="

# 1. Postgres
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "[1/6] Postgres already running."
else
  echo "[1/6] Starting Postgres..."
  brew services start postgresql@15
  for i in 1 2 3 4 5 6 7 8 9 10; do
    pg_isready -h localhost -p 5432 >/dev/null 2>&1 && break
    sleep 1
  done
fi

# 2. Langflow — backs the AI phone/chat receptionist (apps/api calls it at LANGFLOW_API_URL).
#    Not required for the rest of the site, so a failure here just warns instead of stopping the script.
LANGFLOW_APP="/Users/joydeepb/Desktop/Langflow .app"
if curl -sf -m 2 -o /dev/null http://localhost:7860/health 2>/dev/null; then
  echo "[2/6] Langflow already running."
elif [ -d "$LANGFLOW_APP" ]; then
  echo "[2/6] Starting Langflow..."
  open -a "$LANGFLOW_APP"
  for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    curl -sf -m 2 -o /dev/null http://localhost:7860/health 2>/dev/null && break
    sleep 2
  done
  curl -sf -m 2 -o /dev/null http://localhost:7860/health 2>/dev/null || echo "  (Langflow is still starting up — the AI receptionist will work once it's ready)"
else
  echo "[2/6] Langflow app not found at \"$LANGFLOW_APP\" — skipping. The AI receptionist chat/voice features need it running manually."
fi

# 3. Apply any pending database migrations (safe no-op if already up to date)
#    Run via the workspace script (not a bare npx call) so Prisma loads apps/api/.env correctly.
echo "[3/6] Checking database migrations..."
npm run db:deploy -w apps/api

# 4. Build the shared package (types/schemas used by both api and web)
echo "[4/6] Building shared package..."
npm run build -w packages/shared

# 5. Prisma Studio — a visual browser/editor for the database, at http://localhost:5555
echo "[5/6] Starting Prisma Studio (:5555)..."
npm run db:studio -w apps/api > /tmp/maidhire-prisma-studio.log 2>&1 &

# Stop everything by port when this window closes (Ctrl+C or just closing it), so nothing is
# left running as an orphan process. Killing by port is more reliable here than tracking PIDs —
# `npm run dev` fans out through concurrently into separate vite/tsx processes.
# Note: bash only actually runs a trap for INT/TERM once it's not blocked on a foreground external
# command — waiting on a backgrounded job with `wait`, below, is what makes it interruptible.
cleanup() {
  echo ""
  echo "Stopping MaidHire (web, api, Prisma Studio)..."
  local pids
  pids=$(lsof -ti:4000,5173,5555 -sTCP:LISTEN 2>/dev/null || true)
  [ -n "$pids" ] && kill $pids >/dev/null 2>&1
  exit 0
}
trap cleanup EXIT INT TERM

# 6. Open the site + Prisma Studio once they're likely up, then start both dev servers in the background
#    and wait on them (see note above — this, not a plain foreground call, is what lets Ctrl+C work).
echo "[6/6] Starting API (:4000) and Web (:5173)..."
( sleep 4 && open "http://localhost:5173" && open "http://localhost:5555" ) &

echo ""
echo "Web app:       http://localhost:5173"
echo "API:           http://localhost:4000"
echo "Prisma Studio: http://localhost:5555   (browse/edit the database directly)"
echo "Langflow:      http://localhost:7860   (AI receptionist — chat widget & voice)"
echo ""
echo "Close this window (or press Ctrl+C) to stop the API, web server and Prisma Studio."
echo "Postgres and Langflow will keep running in the background as usual."
echo ""

npm run dev &
wait $!
