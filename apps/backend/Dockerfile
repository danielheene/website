# syntax=docker/dockerfile:1

# The Payload backend app — the admin panel, the REST API and the job worker.
#
# Each app in this monorepo has its own Dockerfile. The image is assembled
# from the repo root's build context, so the paths below are repo-root
# relative.
#
# Targets:
#   - `app`       the Next.js server (plain `next start`, not `output: 'standalone'`
#                  — standalone's dependency trace repeatedly conflicted with
#                  Turbopack's content-hashed module ids under Sentry's
#                  require-patching integrations, crashing the server on boot)
#   - `worker`    the Payload job runner
#
# Dependencies are installed inside the image rather than copied in from the
# host: native modules (esbuild, sharp, the SWC binaries) are platform
# specific, and an install done on macOS would not run on the Linux image.

ARG NODE_VERSION=26

# ---- bun ---------------------------------------------------------------------
# Bun is not in the base image; it is the package manager this repo uses.
FROM oven/bun:1 AS bun
# The `bun` binary lives in /usr/local/bin inside the oven image.


# ---- app ---------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS app
ARG VERSION=""
ARG REVISION=""
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
LABEL org.opencontainers.image.title="website-backend-app" \
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
COPY --chown=node:node apps/backend/.next ./apps/backend/.next
COPY --chown=node:node apps/backend/app ./apps/backend/app
COPY --chown=node:node apps/backend/src ./apps/backend/src
COPY --chown=node:node apps/backend/public ./apps/backend/public
COPY --chown=node:node apps/backend/next.config.ts apps/backend/payload.config.ts \
  apps/backend/tsconfig.json apps/backend/next-env.d.ts ./apps/backend/
# The stylesheet entry point and the PostCSS config that runs Tailwind over
# it — without both, the built CSS has no utilities in it.
COPY --chown=node:node apps/backend/backend.css apps/backend/postcss.config.mjs ./apps/backend/

USER node
EXPOSE 3000
# Any HTTP response from the server on :3000 counts as healthy. The backend
# has no root route (the Payload REST API lives under /api and the admin
# panel under /admin), so a 404 still proves the server is up and serving —
# what matters is that it answers at all.
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD node -e "fetch('http://localhost:3000/').then(()=>process.exit(0)).catch(()=>process.exit(1))"
# The app lives in its workspace directory inside the image; `next start` reads
# `.next`, `next.config.ts` and `package.json` relative to the cwd.
WORKDIR /app/apps/backend
CMD ["../../node_modules/.bin/next", "start"]

# ---- worker ------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS worker
ARG VERSION=""
ARG REVISION=""
ENV NODE_ENV=production
LABEL org.opencontainers.image.title="website-backend-worker" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="https://github.com/danielheene/website"

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app
COPY --chown=node:node package.json bun.lock bunfig.toml ./
COPY --chown=node:node patches ./patches
COPY --chown=node:node packages ./packages
COPY --chown=node:node apps/backend/package.json ./apps/backend/
COPY --chown=node:node apps/frontend/package.json ./apps/frontend/
COPY --chown=node:node apps/storybook/package.json ./apps/storybook/
RUN bun install --frozen-lockfile --ignore-scripts

# Everything the Payload job runner needs to load the config, and nothing for
# the web app (no .next, no app/, no admin UI build output).
COPY --chown=node:node apps/backend/src ./apps/backend/src
COPY --chown=node:node apps/backend/scripts ./apps/backend/scripts
COPY --chown=node:node apps/backend/payload.config.ts apps/backend/tsconfig.json \
  apps/backend/next-env.d.ts ./apps/backend/

USER node
EXPOSE 3000
# The worker serves its health endpoint on the same port every container's
# healthcheck probes.
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD node -e "fetch('http://localhost:3000/health').then(()=>process.exit(0)).catch(()=>process.exit(1))"
# The worker resolves `scripts/health-server.ts` and the Payload config relative
# to its cwd, so it runs from the app's workspace directory inside the image.
WORKDIR /app/apps/backend
CMD ["node", "scripts/start-worker.mjs"]
