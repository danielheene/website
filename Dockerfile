# syntax=docker/dockerfile:1

# Produces three images from one build context:
#   - target `app`       — the Next.js server (`pnpm run start`)
#   - target `worker`     — the Payload job runner (`pnpm run start:job-runner`)
#   - target `storybook`  — the built Storybook, served statically
#
# `app` and `worker` share the same `builder` stage: `pnpm run build` (via
# next.config.ts / generateStaticParams) reaches the database over Tailscale
# during static generation, so the CI job building this image must run with
# Tailscale connectivity and the full application env — see
# .github/workflows/ci.yml. The worker never re-runs the build; it reuses the
# same .next output and just boots a different process against it.
#
# There is deliberately no `output: 'standalone'` in next.config.ts, so the
# runtime stages carry the full pnpm-installed node_modules rather than a
# traced subset — bigger image, but avoids known standalone-tracing gaps with
# the Payload/Next combination this app uses.

FROM node:26-slim AS base
RUN corepack enable
WORKDIR /app

# ---- deps: install once, reused by every stage below ----------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# ---- builder: pnpm run ci = migrate && build (needs DB over Tailscale) ----
FROM deps AS builder
COPY . .
# Build-time env (DATABASE_URL, REDIS_URL, S3_*, PAYLOAD_SECRET, etc.) arrives
# as a single BuildKit secret file — see .github/workflows/ci.yml's
# `secret-files` input — rather than as ARG/ENV, so none of these values are
# cached into an image layer or visible via `docker history`. `pnpm run ci`
# runs `payload migrate && next build`, matching what Dokploy ran directly on
# the deployment server before this build moved into CI — every PR build
# (including against develop) migrates that environment's real database, not
# just the eventual deploy.
RUN --mount=type=secret,id=build_env,required=true \
    set -a && . /run/secrets/build_env && set +a && pnpm run ci

# ---- app: Next.js server ----------------------------------------------------
FROM base AS app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["pnpm", "run", "start"]

# ---- worker: Payload job runner, same build output as app -----------------
FROM base AS worker
ENV NODE_ENV=production
COPY --from=builder /app ./
CMD ["pnpm", "run", "start:job-runner"]

# ---- storybook-builder: independent build, no DB/Tailscale needed ---------
FROM deps AS storybook-builder
COPY . .
RUN pnpm run build:storybook

# ---- storybook: static output served via `serve` ---------------------------
FROM base AS storybook
ENV NODE_ENV=production
RUN pnpm add -g serve
COPY --from=storybook-builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
