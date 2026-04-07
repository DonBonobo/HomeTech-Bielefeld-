#!/bin/sh
set -eu

ROOT="/root/HomeTech-Bielefeld"
RUNTIME_DIR="$ROOT/runtime"
LOG_DIR="$RUNTIME_DIR/logs"
PID_FILE="$RUNTIME_DIR/public-tunnel.pid"
LOG_FILE="$LOG_DIR/public-tunnel.log"
URL_FILE="$RUNTIME_DIR/public-url.txt"

mkdir -p "$LOG_DIR"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    URL="$(cat "$URL_FILE" 2>/dev/null || true)"
    if [ -n "${URL:-}" ]; then
      echo "already-running:$PID $URL"
    else
      echo "already-running:$PID"
    fi
    exit 0
  fi
  rm -f "$PID_FILE"
fi

: > "$LOG_FILE"
rm -f "$URL_FILE"

cd "$ROOT"
setsid sh -c "exec ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes -R 80:localhost:3000 nokey@localhost.run >> '$LOG_FILE' 2>&1" </dev/null >/dev/null 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"

COUNT=0
while [ "$COUNT" -lt 45 ]; do
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "failed:process-exited"
    rm -f "$PID_FILE"
    exit 1
  fi

  URL="$(grep 'tunneled with tls termination' "$LOG_FILE" | sed -n 's/.*\(https:\/\/[^[:space:]]*\).*/\1/p' | tail -n 1 || true)"
  if [ -n "${URL:-}" ]; then
    echo "$URL" > "$URL_FILE"
    echo "started:$PID $URL"
    exit 0
  fi

  COUNT=$((COUNT + 1))
  sleep 1
done

echo "started-no-url:$PID"
exit 1
