#!/bin/sh
set -eu

ROOT="/root/HomeTech-Bielefeld"
RUNTIME_DIR="$ROOT/runtime"
LOG_DIR="$RUNTIME_DIR/logs"
PID_FILE="$RUNTIME_DIR/next.pid"
LOG_FILE="$LOG_DIR/next.log"
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

mkdir -p "$LOG_DIR"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "already-running:$PID"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

cd "$ROOT"
setsid sh -c "cd '$ROOT' && exec npm run start -- --hostname $HOST --port $PORT >> '$LOG_FILE' 2>&1" </dev/null >/dev/null 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"
echo "started:$PID"
