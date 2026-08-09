# syntax=docker/dockerfile:1.7
# Debian rather than Alpine: node-av (pulled in by @mediabunny/server for video
# thumbnails) ships prebuilt glibc binaries that cannot load under musl —
# gcompat is not enough, the binding fails relocating glibc-only symbols.
FROM node:26-slim AS base
# the image no longer ships corepack out of the box; install it explicitly before enabling.
RUN npm install -g corepack@latest && corepack enable

FROM base AS deps
WORKDIR /repo
# Only the manifests are copied here so the install layer stays cached across
# source edits.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
# pnpm-workspace.yaml is copied on purpose even though this is a single-package
# repo: it carries `allowBuilds`, which approves the native packages (sharp,
# @swc/core, node-av, …) that must compile for the build and runtime to work,
# along with the overrides and patchedDependencies the lockfile is resolved
# against. Passing --ignore-workspace here would skip it and fail with
# ERR_PNPM_IGNORED_BUILDS.
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# Exactly three values are baked into the image, and all three are public.
#
# Next inlines everything listed in next.config.ts's `env:` block into the compiled
# bundle, where the runtime environment can no longer change it. On top of that,
# `cacheComponents: true` gives nearly every route a shell rendered at build time,
# so a server-side process.env read is captured into that shell and served from
# cache. Between the two, these three cannot be made runtime-configurable:
#
#   SERVER_URL       robots.ts and the root layout's metadataBase, both prerendered
#   STATUS_PAGE_URL  reaches ServiceStatus through the prerendered Footer
#   SENTRY_DSN       Sentry.init runs at module scope in instrumentation-client.ts
#
# The consequence is that an image is specific to one environment. Nothing secret
# is involved: a DSN ships to the browser SDK either way, and the other two are
# this site's own public addresses.
#
# Every secret and all server-only config is deliberately absent — it is read from
# the container environment at boot, so it never lands in a layer.
ARG SERVER_URL
ARG STATUS_PAGE_URL
ARG SENTRY_DSN
ENV SERVER_URL=$SERVER_URL \
    STATUS_PAGE_URL=$STATUS_PAGE_URL \
    SENTRY_DSN=$SENTRY_DSN
# Fail loudly rather than baking `undefined` into the client bundle and the
# prerendered robots.txt, which surfaces much later as a broken status link,
# wrong canonical URLs, and `Sitemap: undefined/sitemap.xml`.
RUN test -n "$SERVER_URL" || { echo "SERVER_URL build arg is required (inlined into the client bundle)" >&2; exit 1; }
RUN test -n "$STATUS_PAGE_URL" || { echo "STATUS_PAGE_URL build arg is required (inlined into the client bundle)" >&2; exit 1; }
# pnpm's "deps status" check tries to interactively confirm removal of a stale
# node_modules dir when it detects the manifest changed since install; there is no TTY
# in a Docker build, so this aborts unless CI=true tells pnpm to run non-interactively.
ENV CI=true
# generateStaticParams() calls payload.find() in six routes, so the build needs a
# reachable database. It arrives as a BuildKit secret — mounted only for the lifetime
# of this RUN, never written to a layer or recorded in build-cache metadata.
# SENTRY_AUTH_TOKEN is optional and only enables source-map upload when present.
# Only what the build itself reads, matching buildTimeEnvKeys in
# src/types/environment.ts: the database and Payload's secret for the prerender
# pass, the S3 settings the media collections resolve against, and the optional
# Sentry credentials for source-map upload. Runtime-only secrets are no longer
# passed at all — the build has no use for them, and not passing them is one
# fewer place they can leak.
RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=PAYLOAD_SECRET \
    --mount=type=secret,id=REDIS_URL \
    --mount=type=secret,id=S3_BUCKET \
    --mount=type=secret,id=S3_REGION \
    --mount=type=secret,id=S3_ENDPOINT \
    --mount=type=secret,id=S3_ACCESS_KEY \
    --mount=type=secret,id=S3_SECRET_KEY \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=SENTRY_ORG \
    --mount=type=secret,id=SENTRY_PROJECT \
    for s in DATABASE_URL PAYLOAD_SECRET REDIS_URL S3_BUCKET S3_REGION S3_ENDPOINT \
             S3_ACCESS_KEY S3_SECRET_KEY \
             SENTRY_AUTH_TOKEN SENTRY_ORG SENTRY_PROJECT; do \
      # Quoting the whole assignment word keeps values containing spaces or shell
      # metacharacters intact, which bare `export $(...)` word-splitting would mangle.
      # Do NOT use `read` here: it returns 1 at EOF when the file has no trailing
      # newline, which is exactly how BuildKit writes secrets — that both skipped
      # the export and aborted this RUN before the build could start.
      if [ -s "/run/secrets/$s" ]; then \
        export "$s=$(cat "/run/secrets/$s")"; \
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
COPY --from=builder /repo/.next ./.next
COPY --from=builder /repo/public ./public
# tsconfig.json ships too: next.config.ts is transpiled at boot and resolves
# `@/` through its paths mapping, so without it startup fails on
# MODULE_NOT_FOUND for @/types/environment.
COPY package.json tsconfig.json next.config.ts payload.config.ts proxy.ts ./
# src/ ships as raw TypeScript because next.config.ts and payload.config.ts are
# transpiled at boot and pull it in — this now includes the components and lib
# helpers that used to live in packages/ui and packages/utils.
COPY src ./src
# Payload's admin panel dynamically imports its generated importMap.js (and other
# server-only route handlers) by source path at runtime, not purely via the compiled
# .next bundle — omitting `app` breaks the Payload admin UI even though `next start`
# itself comes up. Keeping the full `app` dir here matches CON-002's
# "full node_modules / no pruned standalone bundle" approach.
COPY app ./app
# Payload CLI scripts (`payload run scripts/<name>.ts`) — data initialization and
# backfills are run against a deployed container, so they have to ship with it.
# Only the .ts entries: dev.mjs and e2e-docker.sh are development-only.
COPY scripts/*.ts ./scripts/
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
# next is invoked directly rather than through `pnpm run start`: pnpm re-runs its
# deps-status check on every invocation and tries to reinstall, which fails in the
# runner because the lockfile is deliberately not shipped.
CMD ["node_modules/.bin/next", "start"]
