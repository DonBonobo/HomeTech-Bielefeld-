#!/bin/sh
set -eu

ROOT="/root/HomeTech-Bielefeld"
RUNTIME_DIR="$ROOT/runtime"
LOG_DIR="$RUNTIME_DIR/logs"
PID_FILE="$RUNTIME_DIR/next.pid"
LOG_FILE="$LOG_DIR/next.log"
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

find_next_pid() {
  pgrep -o -f "next-server" 2>/dev/null || true
}

mkdir -p "$LOG_DIR"
: > "$LOG_FILE"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "already-running:$PID"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

RUNNING_PID="$(find_next_pid)"
if [ -n "${RUNNING_PID:-}" ] && kill -0 "$RUNNING_PID" 2>/dev/null; then
  echo "$RUNNING_PID" > "$PID_FILE"
  echo "already-running:$RUNNING_PID"
  exit 0
fi

cd "$ROOT"
setsid sh -c "cd '$ROOT' && exec ./node_modules/.bin/next start --hostname $HOST --port $PORT >> '$LOG_FILE' 2>&1" </dev/null >/dev/null 2>&1 &

COUNT=0
while [ "$COUNT" -lt 30 ]; do
  PID="$(find_next_pid)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "$PID" > "$PID_FILE"
    echo "started:$PID"
    exit 0
  fi

  COUNT=$((COUNT + 1))
  sleep 1
done

echo "failed:next-server-not-found"
exit 1
