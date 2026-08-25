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
#
# The Doppler CLI is fetched as a pinned release tarball and checksum-
# verified rather than via Doppler's own install.sh: that script depends on
# a `gpg` binary it could not detect on this base image even once gnupg was
# installed, and separately failed outright before ca-certificates was
# added (curl had no CA bundle to verify TLS with). A direct, checksummed
# binary download has none of the installer's environment assumptions.
FROM node:26-slim AS base
ARG TARGETARCH
ARG DOPPLER_VERSION=3.76.5
RUN npm install -g pnpm@11.18.0 \
    && apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && arch="$(case ${TARGETARCH} in amd64) echo amd64 ;; arm64) echo arm64 ;; *) echo unsupported ;; esac)" \
    && cd /tmp \
    && curl -fsSLO "https://github.com/DopplerHQ/cli/releases/download/${DOPPLER_VERSION}/doppler_${DOPPLER_VERSION}_linux_${arch}.tar.gz" \
    && curl -fsSLO "https://github.com/DopplerHQ/cli/releases/download/${DOPPLER_VERSION}/checksums.txt" \
    && grep " doppler_${DOPPLER_VERSION}_linux_${arch}.tar.gz\$" checksums.txt | sha256sum -c - \
    && tar -xzf "doppler_${DOPPLER_VERSION}_linux_${arch}.tar.gz" doppler \
    && install -m 0755 doppler /usr/local/bin/doppler \
    && rm -f doppler "doppler_${DOPPLER_VERSION}_linux_${arch}.tar.gz" checksums.txt
WORKDIR /app

# ---- deps: install once, reused by every stage below ----------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
# pnpm-workspace.yaml's patchedDependencies points at this directory —
# without it, `pnpm install` fails outright looking for the patch file.
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# ---- builder: pnpm run ci = migrate && build (needs DB over Tailscale) ----
FROM deps AS builder
COPY . .
ENV NODE_ENV=production
# Build-time env (DATABASE_URL, REDIS_URL, S3_*, PAYLOAD_SECRET, etc.) is
# fetched live from Doppler rather than passed in as GitHub-Environment-
# synced secrets/vars — see .github/workflows/ci.yml, which mounts only a
# single DOPPLER_TOKEN as a BuildKit secret. `doppler run` injects Doppler's
# resolved env as real child-process environment variables (not written to
# any file), so this sidesteps both the ARG/ENV image-layer-caching problem
# and the shell-vs-dotenv parsing problem a prior version of this Dockerfile
# hit (a value containing a space — USESEND_DEFAULT_FROM_NAME being "Mail
# Agent [daniel.heene.dev]" — broke a naive `. file` shell-source).
#
# `pnpm run ci` runs `payload migrate && next build`, matching what Dokploy
# ran directly on the deployment server before this build moved into CI —
# every PR build (including against develop) migrates that environment's
# real database, not just the eventual deploy.
RUN --mount=type=secret,id=doppler_token,required=true \
    DOPPLER_TOKEN="$(cat /run/secrets/doppler_token)"; \
    doppler run --token="$DOPPLER_TOKEN" -- pnpm run ci

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
