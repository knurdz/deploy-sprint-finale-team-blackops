#!/bin/sh
set -e

node /app/server/index.mjs &

# Chain into the base nginx image's own entrypoint (its
# /docker-entrypoint.d/*.sh init scripts still run) instead of calling
# nginx directly, so we only add the auth server, not skip nginx's usual
# startup behavior.
exec /docker-entrypoint.sh nginx -g 'daemon off;'
