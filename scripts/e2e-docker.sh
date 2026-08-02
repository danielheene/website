#!/usr/bin/env bash
set -euo pipefail

#    Runs the Playwright E2E suite with Chromium inside the official
#    Playwright Docker image, targeting the dev server on the HOST.
#
#    Prerequisites:
#      docker compose up -d      (Mongo/Redis/S3)
#      pnpm run dev:app          (Next.js on the host, port 3000)
#
#    The image tag MUST match the @playwright/test version in package.json —
#    bump them together, otherwise browser revisions mismatch.

IMAGE="mcr.microsoft.com/playwright:v1.62.1-noble"

#    Host networking lets the container reach the dev server as
#    http://localhost:3000 — required because the Payload admin UI talks to
#    the absolute SERVER_URL, which must match the browser origin.
#    Requires Docker Desktop >= 4.34 on macOS/Windows (built-in on Linux).
BASE_URL="${E2E_BASE_URL:-http://localhost:3000}"

TTY_FLAGS=""
if [ -t 0 ]; then TTY_FLAGS="-it"; fi

# shellcheck disable=SC2086
docker run --rm $TTY_FLAGS \
  --network host \
  --ipc=host \
  -v "$PWD:/work" -w /work \
  -e CI=1 \
  -e E2E_NO_SERVER=1 \
  -e E2E_BASE_URL="$BASE_URL" \
  "$IMAGE" \
  npx playwright test "$@"
