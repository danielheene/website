#!/bin/sh
set -e

if [ -n "$TAILSCALE_AUTHKEY" ]; then
  mkdir -p /tmp/tailscale
  tailscaled \
    --tun=userspace-networking \
    --socks5-server=localhost:1055 \
    --outbound-http-proxy-listen=localhost:1055 \
    --state=/tmp/tailscale/tailscaled.state &

  # Wait for the tailscaled control socket to appear before calling `tailscale up`.
  for _ in $(seq 1 30); do
    [ -S /tmp/tailscale/tailscaled.sock ] && break
    sleep 0.5
  done

  tailscale up \
    --authkey="$TAILSCALE_AUTHKEY" \
    --hostname="web-$(hostname)" \
    --accept-routes
fi

exec "$@"
