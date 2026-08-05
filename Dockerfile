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
# Only genuinely build-time values are declared here, and none of them are secret.
#
# Next inlines everything listed in next.config.ts's `env:` block into the compiled
# bundle, so those values are frozen at build time and cannot be changed by the
# runtime environment. Two of them are read from client components
# ('use client': packages/ui/src/ServiceStatus and src/components/LivePreviewListener),
# which means they MUST be correct here — a placeholder would ship to the browser.
#
# Everything else — secrets and server-only config alike — is deliberately absent:
# it is read from the container environment at boot, so Doppler/Dokploy supply it
# at runtime and it never lands in an image layer.
#
# The remaining ARGs below are not inlined; they exist only because next.config.ts
# validates the full schema before building. A Sentry DSN is public by design — it
# ships to the browser SDK — so it is a build arg rather than a secret.
ARG SERVER_URL
ARG SERVER_HOST
ARG STATUS_PAGE_URL
ARG STATUS_PAGE_HEARTBEAT_URL
ARG SENTRY_DSN
ARG S3_BUCKET
ARG S3_REGION
ARG S3_ENDPOINT
ARG NEXT_PUBLIC_UMAMI_URL
ARG NEXT_PUBLIC_UMAMI_SITE_ID
ARG USESEND_URL
ARG USESEND_DEFAULT_FROM_ADDRESS
ARG USESEND_DEFAULT_FROM_NAME
ENV SERVER_URL=$SERVER_URL \
    SERVER_HOST=$SERVER_HOST \
    STATUS_PAGE_URL=$STATUS_PAGE_URL \
    STATUS_PAGE_HEARTBEAT_URL=$STATUS_PAGE_HEARTBEAT_URL \
    SENTRY_DSN=$SENTRY_DSN \
    S3_BUCKET=$S3_BUCKET \
    S3_REGION=$S3_REGION \
    S3_ENDPOINT=$S3_ENDPOINT \
    NEXT_PUBLIC_UMAMI_URL=$NEXT_PUBLIC_UMAMI_URL \
    NEXT_PUBLIC_UMAMI_SITE_ID=$NEXT_PUBLIC_UMAMI_SITE_ID \
    USESEND_URL=$USESEND_URL \
    USESEND_DEFAULT_FROM_ADDRESS=$USESEND_DEFAULT_FROM_ADDRESS \
    USESEND_DEFAULT_FROM_NAME=$USESEND_DEFAULT_FROM_NAME
# Fail loudly at build time rather than silently baking `undefined` into the client
# bundle, which would surface much later as a broken status link / live preview.
RUN test -n "$SERVER_URL" || { echo "SERVER_URL build arg is required (inlined into the client bundle)" >&2; exit 1; }
# pnpm's "deps status" check tries to interactively confirm removal of a stale
# node_modules dir when it detects the manifest changed since install; there is no TTY
# in a Docker build, so this aborts unless CI=true tells pnpm to run non-interactively.
ENV CI=true
# generateStaticParams() calls payload.find() in six routes, so the build needs a
# reachable database. It arrives as a BuildKit secret — mounted only for the lifetime
# of this RUN, never written to a layer or recorded in build-cache metadata.
# SENTRY_AUTH_TOKEN is optional and only enables source-map upload when present.
RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=PAYLOAD_SECRET \
    --mount=type=secret,id=PREVIEW_SECRET \
    --mount=type=secret,id=CRON_SECRET \
    --mount=type=secret,id=REDIS_URL \
    --mount=type=secret,id=S3_ACCESS_KEY \
    --mount=type=secret,id=S3_SECRET_KEY \
    --mount=type=secret,id=UMAMI_USERNAME \
    --mount=type=secret,id=UMAMI_PASSWORD \
    --mount=type=secret,id=USESEND_API_KEY \
    --mount=type=secret,id=OPENAI_API_KEY \
    --mount=type=secret,id=ANTHROPIC_API_KEY \
    --mount=type=secret,id=MAPBOX_API_KEY \
    for s in DATABASE_URL SENTRY_AUTH_TOKEN PAYLOAD_SECRET PREVIEW_SECRET \
             CRON_SECRET REDIS_URL S3_ACCESS_KEY S3_SECRET_KEY \
             UMAMI_USERNAME UMAMI_PASSWORD USESEND_API_KEY \
             OPENAI_API_KEY ANTHROPIC_API_KEY MAPBOX_API_KEY; do \
      # `read` keeps values with spaces or shell metacharacters intact, which
      # `export $(...)` word-splitting would mangle.
      if [ -s "/run/secrets/$s" ]; then \
        IFS= read -r v < "/run/secrets/$s" && export "$s=$v"; \
      fi; \
    done \
    && pnpm run build

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
