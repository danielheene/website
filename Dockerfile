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

# node:26-slim does not bundle corepack (dropped from the base image as of
# Node 26), so pnpm is installed directly via npm instead — pinned to match
# package.json's packageManager field.
FROM node:26-slim AS base
RUN npm install -g pnpm@11.18.0
WORKDIR /app

# ---- deps: install once, reused by every stage below ----------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
# pnpm-workspace.yaml's patchedDependencies points at this directory —
# without it, `pnpm install` fails outright looking for the patch file.
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# ---- builder: next build only (needs DB over Tailscale) -------------------
FROM deps AS builder
COPY . .
ENV NODE_ENV=production
# Build-time env (DATABASE_URL, REDIS_URL, S3_*, PAYLOAD_SECRET, etc.) arrives
# as a single BuildKit secret file in dotenv format — see
# .github/workflows/ci.yml's `secret-files` input — rather than as ARG/ENV,
# so none of these values are cached into an image layer or visible via
# `docker history`.
#
# It is copied to .env.production and read by @next/env's loadEnvConfig
# (which `next build` calls) rather than shell-sourced: a value containing
# spaces or shell metacharacters — e.g. USESEND_DEFAULT_FROM_NAME being
# "Mail Agent [daniel.heene.dev]" — breaks a `. file` source under dash,
# which parses each line as a shell command rather than a plain KEY=value
# assignment. dotenv's own parser has no such restriction, which is the
# whole point of using the format Payload/Next already expect instead of
# fighting it via shell semantics. The file is removed immediately after use
# so its contents never land in a layer.
#
# TEMPORARY: `payload migrate` is skipped here (plain `pnpm run build`
# instead of `pnpm run ci`) to isolate whether `next build` itself works
# cleanly in this container from whatever payload migrate's own CLI does
# differently. Restore `pnpm run ci` (migrate && build) once this is
# confirmed, so real future migrations actually run as part of the image
# build again.
RUN --mount=type=secret,id=build_env,required=true \
    cp /run/secrets/build_env .env.production && \
    pnpm run build; \
    status=$?; \
    rm -f .env.production; \
    exit $status

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
# npm rather than `pnpm add -g`: pnpm's global bin dir isn't on PATH by
# default in this image, and configuring it is unnecessary for one package.
RUN npm install -g serve
COPY --from=storybook-builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
