# syntax=docker/dockerfile:1

# The public frontend app — the site's pages, feeds and API routes.
#
# The image is assembled from the repo root's build context, so the paths below
# are repo-root relative.
#
# No `output: 'standalone'` — standalone's Node require-tracing has repeatedly
# conflicted with Turbopack's content-hashed module ids under Sentry's
# require-patching integrations (redis/mongoose/pino), crashing the server on
# boot. `next start` against a plain install avoids that trace step entirely,
# at the cost of a full `node_modules` instead of a pruned one.
#
# Dependencies are installed inside the image rather than copied in from the
# host: native modules (sharp, the SWC binaries) are platform specific, and an
# install done on macOS would not run on the Linux image.

ARG NODE_VERSION=26

# ---- bun ---------------------------------------------------------------------
# Bun is not in the base image; it is the package manager this repo uses.
FROM oven/bun:1 AS bun
# The `bun` binary lives in /usr/local/bin inside the oven image.


FROM node:${NODE_VERSION}-slim AS app
ARG VERSION=""
ARG REVISION=""
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
LABEL org.opencontainers.image.title="website-frontend" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="https://github.com/danielheene/website"

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app
# Workspace manifests and lockfile first, so the dependency layer is cached
# independently of the source changes.
COPY --chown=node:node package.json bun.lock bunfig.toml ./
COPY --chown=node:node patches ./patches
COPY --chown=node:node packages ./packages
COPY --chown=node:node apps/backend/package.json ./apps/backend/
COPY --chown=node:node apps/frontend/package.json ./apps/frontend/
COPY --chown=node:node apps/storybook/package.json ./apps/storybook/
RUN bun install --frozen-lockfile --ignore-scripts

# The app source and its build output.
COPY --chown=node:node apps/frontend/.next ./apps/frontend/.next
COPY --chown=node:node apps/frontend/app ./apps/frontend/app
COPY --chown=node:node apps/frontend/src ./apps/frontend/src
COPY --chown=node:node apps/frontend/public ./apps/frontend/public
COPY --chown=node:node apps/frontend/next.config.ts apps/frontend/tsconfig.json \
  apps/frontend/next-env.d.ts apps/frontend/proxy.ts ./apps/frontend/
# The stylesheet entry point and the PostCSS config that runs Tailwind over
# it — without both, the built CSS has no utilities in it.
COPY --chown=node:node apps/frontend/frontend.css apps/frontend/postcss.config.mjs ./apps/frontend/

USER node
EXPOSE 3000
# Any HTTP response from the server on :3000 counts as healthy — what matters
# is that it answers at all.
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD node -e "fetch('http://localhost:3000/').then(()=>process.exit(0)).catch(()=>process.exit(1))"
# The app lives in its workspace directory inside the image; `next start` reads
# `.next`, `next.config.ts` and `package.json` relative to the cwd.
WORKDIR /app/apps/frontend
CMD ["../../node_modules/.bin/next", "start"]
