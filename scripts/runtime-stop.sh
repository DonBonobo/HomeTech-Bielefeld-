#!/bin/sh
set -eu

PID_FILE="/root/HomeTech-Bielefeld/runtime/next.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "not-running"
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [ -z "${PID:-}" ]; then
  rm -f "$PID_FILE"
  echo "not-running"
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  rm -f "$PID_FILE"
  echo "stopped:$PID"
else
  rm -f "$PID_FILE"
  echo "stale-pid:$PID"
fi
