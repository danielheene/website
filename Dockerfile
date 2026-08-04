# syntax=docker/dockerfile:1.7
# Debian rather than Alpine: node-av (pulled in by @mediabunny/server for video
# thumbnails) ships prebuilt glibc binaries that cannot load under musl —
# gcompat is not enough, the binding fails relocating glibc-only symbols.
FROM node:26-slim AS base
# the image no longer ships corepack out of the box; install it explicitly before enabling.
RUN npm install -g corepack@latest && corepack enable

FROM base AS deps
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
# Every workspace member's manifest must be present before install: pnpm resolves
# the whole workspace graph up front and fails on a missing member. Only the
# manifests are copied here so the install layer stays cached across source edits.
COPY apps/web/package.json ./apps/web/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ui/package.json ./packages/ui/
# The workspace file is copied above on purpose: it carries `allowBuilds`, which
# approves the native packages (sharp, @swc/core, node-av, …) that must compile
# for the build and runtime to work. Passing --ignore-workspace here would skip
# it and fail with ERR_PNPM_IGNORED_BUILDS.
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
# the app's own node_modules is a separate tree under pnpm's isolated linker
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY . .
ENV NODE_ENV=production
# Non-secret build-time configuration needed for `next build` (static generation reads
# these directly via process.env in next.config.ts / payload.config.ts). DATABASE_URL is
# deliberately NOT an ARG/ENV here — it is injected only via the BuildKit secret below
# (SEC-003) so it never lands in an image layer or the build cache metadata.
ARG SERVER_HOST=localhost:3000
ARG SERVER_URL=http://localhost:3000
ARG STATUS_PAGE_URL=http://localhost:3000
ARG STATUS_PAGE_HEARTBEAT_URL=http://localhost:3000
ENV SERVER_HOST=$SERVER_HOST
ENV SERVER_URL=$SERVER_URL
ENV STATUS_PAGE_URL=$STATUS_PAGE_URL
ENV STATUS_PAGE_HEARTBEAT_URL=$STATUS_PAGE_HEARTBEAT_URL
# next.config.ts validates the full env schema at load time and exits on failure,
# so every required var needs a value here even when the build never calls the
# service behind it. These are non-secret placeholders; real values come from the
# runtime environment.
ENV PAYLOAD_SECRET=build-time-placeholder
ENV PREVIEW_SECRET=build-time-placeholder
ENV CRON_SECRET=build-time-placeholder
ENV REDIS_URL=redis://localhost:6379
ENV S3_BUCKET=placeholder
ENV S3_REGION=us-east-1
ENV S3_ACCESS_KEY=placeholder
ENV S3_SECRET_KEY=placeholder
ENV S3_ENDPOINT=http://localhost:9000
ENV UMAMI_USERNAME=placeholder
ENV UMAMI_PASSWORD=placeholder
ENV NEXT_PUBLIC_UMAMI_URL=http://localhost:3002
ENV NEXT_PUBLIC_UMAMI_SITE_ID=00000000-0000-4000-8000-000000000000
ENV USESEND_URL=http://localhost:3003
ENV USESEND_API_KEY=placeholder
ENV USESEND_DEFAULT_FROM_ADDRESS=build@example.com
ENV USESEND_DEFAULT_FROM_NAME=Build
ENV OPENAI_API_KEY=placeholder
ENV ANTHROPIC_API_KEY=placeholder
ENV MAPBOX_API_KEY=placeholder
# pnpm's "deps status" check tries to interactively confirm removal of a stale
# node_modules dir when it detects the manifest changed since install; there is no TTY
# in a Docker build, so this aborts unless CI=true tells pnpm to run non-interactively.
ENV CI=true
RUN --mount=type=secret,id=DATABASE_URL \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
    pnpm run build

FROM base AS runner
WORKDIR /repo
ENV NODE_ENV=production
ENV CI=true
# tailscale is required by docker-entrypoint.sh whenever TAILSCALE_AUTHKEY is
# set; installed from the upstream static tarball because Debian's own package
# lags well behind.
ARG TAILSCALE_VERSION=1.78.1
RUN apt-get update \
    && apt-get install --no-install-recommends -y curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && ARCH="$(dpkg --print-architecture)" \
    && case "$ARCH" in \
         amd64) TS_ARCH=amd64 ;; \
         arm64) TS_ARCH=arm64 ;; \
         *) echo "unsupported architecture: $ARCH" >&2; exit 1 ;; \
       esac \
    && curl -fsSL "https://pkgs.tailscale.com/stable/tailscale_${TAILSCALE_VERSION}_${TS_ARCH}.tgz" \
       | tar -xz -C /tmp \
    && mv "/tmp/tailscale_${TAILSCALE_VERSION}_${TS_ARCH}/tailscale" /usr/local/bin/ \
    && mv "/tmp/tailscale_${TAILSCALE_VERSION}_${TS_ARCH}/tailscaled" /usr/local/bin/ \
    && rm -rf "/tmp/tailscale_${TAILSCALE_VERSION}_${TS_ARCH}"
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /repo/apps/web/.next ./apps/web/.next
COPY --from=builder /repo/apps/web/public ./apps/web/public
# tsconfig.json ships too: next.config.ts is transpiled at boot and resolves
# `@/` through its paths mapping, so without it startup fails on
# MODULE_NOT_FOUND for @/types/environment. The shared tsconfig package it
# extends must ship for the same reason.
COPY pnpm-workspace.yaml ./
COPY packages/tsconfig ./packages/tsconfig
# @repo/utils and @repo/ui ship raw TypeScript (no dist), so their source has to
# be present at runtime for the same reason src/ is: next.config.ts and
# payload.config.ts are transpiled at boot and pull them in via workspace links.
COPY packages/utils ./packages/utils
COPY packages/ui ./packages/ui
COPY apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts apps/web/payload.config.ts apps/web/proxy.ts ./apps/web/
COPY apps/web/src ./apps/web/src
# Payload's admin panel dynamically imports its generated importMap.js (and other
# server-only route handlers) by source path at runtime, not purely via the compiled
# .next bundle — omitting `app` breaks the Payload admin UI even though `next start`
# itself comes up. Keeping the full `app` dir here matches CON-002's
# "full node_modules / no pruned standalone bundle" approach.
COPY apps/web/app ./apps/web/app
# Payload CLI scripts (`payload run scripts/<name>.ts`) — data initialization and
# backfills are run against a deployed container, so they have to ship with it.
# Only the .ts entries: dev.mjs and e2e-docker.sh are development-only.
COPY apps/web/scripts/*.ts ./apps/web/scripts/
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
# next must run with the app as its cwd; the workspace root above stays in the
# image only so pnpm's isolated node_modules links still resolve.
WORKDIR /repo/apps/web
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
# next is invoked directly rather than through `pnpm run start`: pnpm re-runs its
# deps-status check on every invocation and tries to reinstall, which fails in the
# runner because the lockfile is deliberately not shipped.
CMD ["node_modules/.bin/next", "start"]
