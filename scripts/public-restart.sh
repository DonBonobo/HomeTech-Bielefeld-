#!/bin/sh
set -eu

/root/HomeTech-Bielefeld/scripts/public-stop.sh || true
/root/HomeTech-Bielefeld/scripts/public-start.sh
