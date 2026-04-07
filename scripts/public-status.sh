#!/bin/sh
set -eu

PID_FILE="/root/HomeTech-Bielefeld/runtime/public-tunnel.pid"
LOG_FILE="/root/HomeTech-Bielefeld/runtime/logs/public-tunnel.log"
URL_FILE="/root/HomeTech-Bielefeld/runtime/public-url.txt"

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
  URL="$(cat "$URL_FILE" 2>/dev/null || true)"
  if [ -z "${URL:-}" ] && [ -f "$LOG_FILE" ]; then
    URL="$(grep 'tunneled with tls termination' "$LOG_FILE" | sed -n 's/.*\(https:\/\/[^[:space:]]*\).*/\1/p' | tail -n 1 || true)"
  fi
  if [ -n "${URL:-}" ]; then
    echo "status:running pid:$PID url:$URL"
  else
    echo "status:running pid:$PID"
  fi
  echo "log:$LOG_FILE"
else
  echo "status:stale pid:$PID"
fi
