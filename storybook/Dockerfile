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
# Storybook's build (webpack via @storybook/nextjs) compiles web/src components directly
# (staticDirs, tsconfig path aliases, story sources) rather than importing `web` as a
# declared workspace dependency, so `--filter storybook...` alone won't install web's
# node_modules (e.g. @iconify-icon/react used by web/src/components/Icon). Installing
# both packages explicitly covers the actual module graph the build touches.
RUN pnpm install --filter storybook... --filter web... --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/storybook/node_modules ./storybook/node_modules
COPY --from=deps /repo/web/node_modules ./web/node_modules
COPY . .
RUN pnpm --filter storybook run build

FROM nginx:1-alpine AS runner
COPY --from=builder /repo/storybook/dist /usr/share/nginx/html
EXPOSE 80
