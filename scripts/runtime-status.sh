#!/bin/sh
set -eu

PID_FILE="/root/HomeTech-Bielefeld/runtime/next.pid"
LOG_FILE="/root/HomeTech-Bielefeld/runtime/logs/next.log"

find_next_pid() {
  pgrep -o -f "next-server" 2>/dev/null || true
}

if [ ! -f "$PID_FILE" ]; then
  PID="$(find_next_pid)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "$PID" > "$PID_FILE"
    echo "status:running pid:$PID"
  else
    echo "status:not-running"
    exit 0
  fi
else
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -z "${PID:-}" ]; then
    PID="$(find_next_pid)"
    if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
      echo "$PID" > "$PID_FILE"
      echo "status:running pid:$PID"
    else
      echo "status:not-running"
      exit 0
    fi
  elif kill -0 "$PID" 2>/dev/null; then
    echo "status:running pid:$PID"
  else
    FALLBACK_PID="$(find_next_pid)"
    if [ -n "${FALLBACK_PID:-}" ] && kill -0 "$FALLBACK_PID" 2>/dev/null; then
      echo "$FALLBACK_PID" > "$PID_FILE"
      echo "status:running pid:$FALLBACK_PID"
      PID="$FALLBACK_PID"
    else
      echo "status:stale pid:$PID"
      exit 0
    fi
  fi
fi

echo "log:$LOG_FILE"
