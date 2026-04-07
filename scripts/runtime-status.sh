#!/bin/sh
set -eu

PID_FILE="/root/HomeTech-Bielefeld/runtime/next.pid"
LOG_FILE="/root/HomeTech-Bielefeld/runtime/logs/next.log"

if [ ! -f "$PID_FILE" ]; then
  echo "status:not-running"
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [ -z "${PID:-}" ]; then
  echo "status:not-running"
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  echo "status:running pid:$PID"
  if [ -f "$LOG_FILE" ]; then
    tail -n 20 "$LOG_FILE"
  fi
else
  echo "status:stale pid:$PID"
fi
