#!/bin/sh
set -eu

/root/HomeTech-Bielefeld/scripts/runtime-stop.sh || true
/root/HomeTech-Bielefeld/scripts/runtime-start.sh
