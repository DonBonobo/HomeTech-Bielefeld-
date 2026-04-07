#!/bin/sh
set -eu

PID_FILE="/root/HomeTech-Bielefeld/runtime/next.pid"

find_next_pid() {
  pgrep -o -f "next-server" 2>/dev/null || true
}

if [ ! -f "$PID_FILE" ]; then
  PID="$(find_next_pid)"
  if [ -z "${PID:-}" ]; then
    echo "not-running"
    exit 0
  fi
  kill "$PID"
  echo "stopped:$PID"
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
  FALLBACK_PID="$(find_next_pid)"
  if [ -n "${FALLBACK_PID:-}" ] && kill -0 "$FALLBACK_PID" 2>/dev/null; then
    kill "$FALLBACK_PID"
    rm -f "$PID_FILE"
    echo "stopped:$FALLBACK_PID"
    exit 0
  fi
  rm -f "$PID_FILE"
  echo "stale-pid:$PID"
fi
