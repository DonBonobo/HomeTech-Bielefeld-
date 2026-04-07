Production runtime commands

Start:
/root/HomeTech-Bielefeld/scripts/runtime-start.sh

Stop:
/root/HomeTech-Bielefeld/scripts/runtime-stop.sh

Restart:
/root/HomeTech-Bielefeld/scripts/runtime-restart.sh

Status:
/root/HomeTech-Bielefeld/scripts/runtime-status.sh

Log file:
/root/HomeTech-Bielefeld/runtime/logs/next.log

PID file:
/root/HomeTech-Bielefeld/runtime/next.pid

Default bind:
HOST=0.0.0.0
PORT=3000

Public tunnel commands

Start:
/root/HomeTech-Bielefeld/scripts/public-start.sh

Stop:
/root/HomeTech-Bielefeld/scripts/public-stop.sh

Restart:
/root/HomeTech-Bielefeld/scripts/public-restart.sh

Status:
/root/HomeTech-Bielefeld/scripts/public-status.sh

Tunnel log:
/root/HomeTech-Bielefeld/runtime/logs/public-tunnel.log

Tunnel PID file:
/root/HomeTech-Bielefeld/runtime/public-tunnel.pid

Current public URL file:
/root/HomeTech-Bielefeld/runtime/public-url.txt

Notes:
- The public URL is provided by an anonymous localhost.run tunnel.
- The URL stays valid while the tunnel process keeps running.
- Restarting the tunnel can change the URL.
