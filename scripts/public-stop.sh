#!/bin/sh
set -eu

PID_FILE="/root/HomeTech-Bielefeld/runtime/public-tunnel.pid"
URL_FILE="/root/HomeTech-Bielefeld/runtime/public-url.txt"

if [ ! -f "$PID_FILE" ]; then
  echo "not-running"
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [ -z "${PID:-}" ]; then
  rm -f "$PID_FILE" "$URL_FILE"
  echo "not-running"
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  rm -f "$PID_FILE" "$URL_FILE"
  echo "stopped:$PID"
else
  rm -f "$PID_FILE" "$URL_FILE"
  echo "stale-pid:$PID"
fi
