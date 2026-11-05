# syntax=docker/dockerfile:1

# Nothing is built or installed in here. CI produces the exact contents of each
# image with `node scripts/assemble-images.mjs <web|worker|storybook>` (into
# `out/<target>`) and every stage below only COPYs that directory onto a base
# image. Targets:
#   - `app`       the Next.js server (standalone output)
#   - `worker`    the Payload job runner
#   - `storybook` the built Storybook, served statically

ARG NODE_VERSION=26

# ---- app ---------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS app
ARG VERSION=""
ARG REVISION=""
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
LABEL org.opencontainers.image.title="website-app" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="https://github.com/danielheene/website"
WORKDIR /app
COPY --chown=node:node out/web ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD node -e "fetch('http://localhost:3000/api/health/app').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

# ---- worker ------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS worker
ARG VERSION=""
ARG REVISION=""
ENV NODE_ENV=production
LABEL org.opencontainers.image.title="website-worker" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="https://github.com/danielheene/website"
WORKDIR /app
COPY --chown=node:node out/worker ./
USER node
EXPOSE 3010
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD node -e "fetch('http://localhost:3010/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "scripts/start-worker.mjs"]

# ---- storybook ---------------------------------------------------------------
FROM caddy:2-alpine AS storybook
ARG VERSION=""
ARG REVISION=""
LABEL org.opencontainers.image.title="website-storybook" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="https://github.com/danielheene/website"
COPY out/storybook /srv
EXPOSE 3020
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD wget -q -O /dev/null http://localhost:3020 || exit 1
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":3020"]
