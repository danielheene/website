# syntax=docker/dockerfile:1.7
FROM node:26-alpine AS base
# node:26-alpine no longer ships corepack out of the box; install it explicitly before enabling.
RUN npm install -g corepack@latest && corepack enable

FROM base AS deps
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY web/package.json ./web/package.json
COPY storybook/package.json ./storybook/package.json
RUN pnpm install --filter web... --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/web/node_modules ./web/node_modules
COPY . .
ENV NODE_ENV=production
# Non-secret build-time configuration needed for `next build` (static generation reads
# these directly via process.env in next.config.ts / payload.config.ts). DATABASE_URL is
# deliberately NOT an ARG/ENV here — it is injected only via the BuildKit secret below
# (SEC-003) so it never lands in an image layer or the build cache metadata.
ARG SERVER_URL=http://localhost:3000
ARG STATUS_PAGE_URL=http://localhost:3000
ARG STATUS_PAGE_HEARTBEAT_URL=http://localhost:3000
ENV SERVER_URL=$SERVER_URL
ENV STATUS_PAGE_URL=$STATUS_PAGE_URL
ENV STATUS_PAGE_HEARTBEAT_URL=$STATUS_PAGE_HEARTBEAT_URL
# pnpm's "deps status" check tries to interactively confirm removal of a stale
# node_modules dir when it detects the manifest changed since install; there is no TTY
# in a Docker build, so this aborts unless CI=true tells pnpm to run non-interactively.
ENV CI=true
RUN --mount=type=secret,id=DATABASE_URL \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
    pnpm --filter web run build

FROM base AS runner
WORKDIR /repo
ENV NODE_ENV=production
RUN apk add --no-cache tailscale curl
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/web/node_modules ./web/node_modules
COPY --from=builder /repo/web/.next ./web/.next
COPY --from=builder /repo/web/public ./web/public
COPY web/package.json web/next.config.ts web/payload.config.ts web/env.ts ./web/
COPY web/src ./web/src
# Payload's admin panel dynamically imports its generated importMap.js (and other
# server-only route handlers) by source path at runtime, not purely via the compiled
# .next bundle — the draft Dockerfile omitted `web/app`, which broke the Payload admin
# UI even though `next start` itself came up. Keeping the full `app` dir here matches
# CON-002's "full node_modules / no pruned standalone bundle" approach.
COPY web/app ./web/app
COPY web/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pnpm", "--filter", "web", "run", "start"]
