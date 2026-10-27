# syntax=docker/dockerfile:1

# The Storybook app — the component workbench, built as a static site and
# served by Caddy.
#
# The image is assembled from the repo root's build context, so the paths below
# are repo-root relative.
#
# Unlike the two Next.js apps, this one builds inside the image: Storybook
# bundles the stories with Vite and needs the full dependency tree, including
# the workspace packages the stories import from.

ARG NODE_VERSION=26
ARG CADDY_VERSION=2

# ---- bun ---------------------------------------------------------------------
# Bun is not in the base image; it is the package manager this repo uses.
FROM oven/bun:1 AS bun

# ---- build -------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS build
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY --chown=node:node package.json bun.lock bunfig.toml ./
COPY --chown=node:node patches ./patches
COPY --chown=node:node packages ./packages
COPY --chown=node:node apps ./apps
RUN bun install --frozen-lockfile --ignore-scripts
WORKDIR /app/apps/storybook
RUN bun run build

# ---- storybook ---------------------------------------------------------------
FROM caddy:${CADDY_VERSION}-alpine AS storybook
ARG VERSION=""
ARG REVISION=""
ENV NODE_ENV=production
LABEL org.opencontainers.image.title="website-storybook" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="https://github.com/danielheene/website"
COPY --from=build --chown=65532:65532 /app/apps/storybook/dist /srv
USER 65532
EXPOSE 3020
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD wget -q -O /dev/null http://localhost:3020 || exit 1
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":3020"]
