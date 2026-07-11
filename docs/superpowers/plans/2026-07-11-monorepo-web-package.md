# Monorepo `web/` Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Next.js + Payload CMS application from the workspace root into a new `web/` pnpm workspace package, with environment variables centralized at the repo root and loaded explicitly via `@next/env`.

**Architecture:** Pure relocation of existing app code (`app/`, `src/`, `public/`, and the app's config files) into `web/`, plus a new `web/package.json` carrying the app-specific dependencies split out of the root `package.json`. Root `package.json` becomes a thin tooling/orchestration shell that delegates `dev`/`build` to Turborepo (already configured in `turbo.json`) and other scripts to `pnpm --filter web`. No application code changes beyond `next.config.ts`/`payload.config.ts` env-loading wiring and two small cleanups (removing dead tunnel-spawning code and noisy debug logging).

**Tech Stack:** pnpm workspaces, Turborepo, Next.js 16.2.10, Payload CMS 3.85.2, `@next/env`.

## Global Constraints

- Extracting shared code into `packages/*` is explicitly out of scope for this pass — the app moves as a single unit.
- `tests/`, `patches/`, and `scripts/` stay at the repository root (deferred, not part of this move).
- `.env`, `.env.local`, `.env.example` stay at the repository root as the single source of truth; the app must load them explicitly rather than relying on Next.js's implicit per-project `.env` discovery.
- `dev`/`build` at the root must route through Turborepo (`turbo run dev` / `turbo run build`), using the `build`/`dev`/`check-types` tasks already defined in `turbo.json`.
- Do not touch the Storybook workspace package (`storybook/`) beyond it continuing to work unmodified as a sibling workspace member.
- Do not attempt to fix the pre-existing, unrelated `typescript@^7.0.2` / Next.js dependency-detection issue investigated earlier in this session — it is out of scope for this plan and was explicitly not to be silently reintroduced. Preserve `"typescript": "^7.0.2"` exactly as it currently appears when moving it into `web/package.json`.
- The repository currently has unrelated uncommitted work in progress (a `src/tasks` → `src/jobs-queue` rename/refactor, and Storybook scaffolding under `storybook/`). This plan's file moves must carry that in-progress work along unchanged — do not stash, discard, or "clean up" it as part of this migration.

---

### Task 1: Relocate app code into `web/`

**Files:**
- Move: `app/` → `web/app/`
- Move: `src/` → `web/src/`
- Move: `public/` → `web/public/`
- Move: `payload.config.ts` → `web/payload.config.ts`
- Move: `next.config.ts` → `web/next.config.ts`
- Move: `next-env.d.ts` → `web/next-env.d.ts`
- Move: `global.d.ts` → `web/global.d.ts`
- Move: `tsconfig.json` → `web/tsconfig.json`
- Move: `postcss.config.js` → `web/postcss.config.js`

**Interfaces:**
- Consumes: nothing (first task in the plan).
- Produces: the directory `web/` containing all app source, ready for Tasks 2–6 to add a `package.json` and wire env loading. All relative imports/paths inside these files are unaffected because the whole subtree moves together.

- [ ] **Step 1: Check working tree state before touching anything**

Run: `cd /Users/daniel/Code/danielheene/website && git status --short`

Expected: the same pre-existing uncommitted changes noted in Global Constraints (modified `package.json`, `next.config.ts`, `payload.config.ts`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, several `src/*` files; deleted `src/tasks/*`/`src/types/queue.ts`; untracked `src/jobs-queue/`, `storybook/.storybook/`, `storybook/stories/`). This is expected — do not stash or discard it.

- [ ] **Step 2: Move the app directories and files with `git mv`**

Run:
```bash
cd /Users/daniel/Code/danielheene/website
mkdir -p web
git mv app web/app
git mv src web/src
git mv public web/public
git mv payload.config.ts web/payload.config.ts
git mv next.config.ts web/next.config.ts
git mv next-env.d.ts web/next-env.d.ts
git mv global.d.ts web/global.d.ts
git mv tsconfig.json web/tsconfig.json
git mv postcss.config.js web/postcss.config.js
```

Expected: no errors. If `git mv` refuses any path because of the pre-existing uncommitted/untracked state noted in Step 1, fall back to plain `mv src web/src` for that path followed by `git add -A -- web <old-path-parent>` to let git detect the rename.

- [ ] **Step 3: Verify the move**

Run: `find web -maxdepth 1 -type d -o -maxdepth 1 -type f | sort`

Expected output includes: `web`, `web/app`, `web/global.d.ts`, `web/next-env.d.ts`, `web/next.config.ts`, `web/payload.config.ts`, `web/postcss.config.js`, `web/public`, `web/src`, `web/tsconfig.json`. Confirm nothing was left behind at root: `find . -maxdepth 1 -name "app" -o -maxdepth 1 -name "src" -o -maxdepth 1 -name "public"` (excluding `web/`) should print nothing.

- [ ] **Step 4: Commit**

```bash
git add -A -- app src public payload.config.ts next.config.ts next-env.d.ts global.d.ts tsconfig.json postcss.config.js web
git commit -m "chore: move app into web/ workspace package"
```

---

### Task 2: Create `web/package.json`

**Files:**
- Create: `web/package.json`

**Interfaces:**
- Consumes: the file tree produced by Task 1 (`web/app`, `web/src`, etc. must already exist so `pnpm install` in Task 7 can resolve them as the `web` package's contents).
- Produces: the `web` pnpm workspace package definition — package name `"web"`, with scripts `build`, `next`, `dev`, `generate`, `generate:importmap`, `generate:types`, `migrate`, `payload`, `start` that Task 3's root scripts and Task 4's workspace registration depend on by name (`pnpm --filter web run <script>`).

- [ ] **Step 1: Write `web/package.json`**

```json
{
  "name": "web",
  "version": "1.0.0",
  "private": "true",
  "description": "",
  "license": "MIT",
  "type": "module",
  "imports": {
    "#payload.css": "./src/styles/payload.css",
    "#frontend.css": "./src/styles/frontend.css"
  },
  "scripts": {
    "build": "pnpm run next build",
    "next": "NODE_OPTIONS=\"--trace-deprecation --disable-warning=DeprecationWarning\" next",
    "dev": "pnpm run next dev",
    "generate": "pnpm run --silent --parallel /^generate:.*/",
    "generate:importmap": "pnpm run --silent payload generate:importmap",
    "generate:types": "pnpm run --silent payload generate:types",
    "migrate": "pnpm run payload migrate",
    "payload": "NODE_OPTIONS=\"--trace-deprecation --disable-warning=DeprecationWarning\" payload",
    "start": "pnpm run next start"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^4.0.11",
    "@headlessui/react": "^2.2.10",
    "@iconify-icon/react": "^3.0.3",
    "@next/bundle-analyzer": "^16.2.10",
    "@next/env": "^16.2.10",
    "@payloadcms/db-mongodb": "^3.85.2",
    "@payloadcms/kv-redis": "^3.85.2",
    "@payloadcms/live-preview-react": "^3.85.2",
    "@payloadcms/next": "^3.85.2",
    "@payloadcms/plugin-import-export": "^3.85.2",
    "@payloadcms/plugin-nested-docs": "^3.85.2",
    "@payloadcms/plugin-sentry": "^3.85.2",
    "@payloadcms/richtext-lexical": "^3.85.2",
    "@payloadcms/storage-s3": "^3.85.2",
    "@payloadcms/translations": "^3.85.2",
    "@payloadcms/ui": "^3.85.2",
    "@radix-ui/react-collapsible": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.18",
    "@radix-ui/react-slot": "^1.3.0",
    "@radix-ui/react-switch": "^1.3.1",
    "@radix-ui/react-tooltip": "^1.2.10",
    "@react-pdf/renderer": "^4.5.1",
    "@react-pdf/types": "^2.11.1",
    "@sentry/nextjs": "^10.65.0",
    "@sindresorhus/slugify": "^3.0.0",
    "@tailwindcss/typography": "^0.5.20",
    "ai": "^7.0.20",
    "date-fns": "^4.4.0",
    "dedent": "^1.7.2",
    "embla-carousel-autoplay": "^8.6.0",
    "embla-carousel-react": "^8.6.0",
    "graphql": "^17.0.1",
    "hash-wasm": "^4.12.0",
    "hyphen": "^1.14.1",
    "ioredis": "^5.11.0",
    "jsdom": "^29.1.1",
    "jsonwebtoken": "^9.0.3",
    "libphonenumber-js": "^1.13.4",
    "lodash-es": "^4.18.1",
    "nanoid": "^5.1.11",
    "neotraverse": "^1.0.1",
    "next": "^16.2.10",
    "next-themes": "^0.4.6",
    "ogl": "^1.0.11",
    "payload": "^3.85.2",
    "pdf-parse": "^2.4.5",
    "playwright": "^1.59.1",
    "pretty-bytes": "^7.1.0",
    "pretty-ms": "^9.3.0",
    "prism-react-renderer": "^2.4.1",
    "pupa": "^3.3.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-markdown": "^10.1.0",
    "react-select": "^5.10.2",
    "recharts": "^3.8.1",
    "schema-dts": "^2.0.0",
    "sharp": "^0.35.3",
    "svgo": "^4.0.1",
    "timestring": "^7.0.0",
    "type-fest": "^5.7.0",
    "usehooks-ts": "^3.1.1",
    "wrangler": "^4.110.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.4",
    "@types/hyphen": "^1.14.0",
    "@types/jsdom": "^28.0.1",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/lodash-es": "^4.17.12",
    "@types/node": "^26.1.0",
    "@types/react": "^19.2.16",
    "@types/react-dom": "^19.2.3",
    "@types/timestring": "^7.0.0",
    "autoprefixer": "^10.5.0",
    "cssnano": "^8.0.1",
    "postcss": "^8.5.13",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^4.3.0",
    "typescript": "^7.0.2",
    "zod": "^4.4.2"
  }
}
```

- [ ] **Step 2: Verify it's valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('web/package.json', 'utf8')); console.log('OK')"`

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add web/package.json
git commit -m "chore: add web/package.json with app dependencies and scripts"
```

---

### Task 3: Pare down root `package.json`

**Files:**
- Modify: `package.json` (full replace of the file)

**Interfaces:**
- Consumes: script names produced by Task 2 (`web` package's `start`, `migrate`, `generate` scripts, referenced via `pnpm --filter web run <name>`), and the `dev`/`build` task names already defined in `turbo.json`.
- Produces: the pared-down root `package.json` that Task 4 (workspace registration) and Task 7 (install/verify) depend on.

- [ ] **Step 1: Replace `package.json` with the pared-down version**

```json
{
  "name": "website",
  "version": "1.0.0",
  "private": "true",
  "description": "",
  "license": "MIT",
  "scripts": {
    "build": "turbo run build",
    "chore:reinstall": "pnpm --shell-mode exec rm -rf node_modules && pnpm --shell-mode exec rm pnpm-lock.yaml && pnpm --ignore-workspace install",
    "chore:sort": "sort-package-json",
    "ci": "pnpm run migrate && pnpm run build",
    "ci:publish": "pnpm publish -r",
    "dev": "turbo run dev",
    "format": "biome format --write",
    "generate": "pnpm --filter web run generate",
    "lint": "biome check",
    "migrate": "pnpm --filter web run migrate",
    "start": "pnpm --filter web run start"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.16",
    "sort-package-json": "^4.0.0",
    "syncpack": "^15.3.2",
    "turbo": "^2.9.18"
  },
  "engines": {
    "node": "^26.0.0",
    "pnpm": "^11.0.0"
  },
  "resolutions": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "pdfjs-dist": "^5.4.296"
  },
  "patchedDependencies": {
    "pdfjs-dist@5.4.296": "patches/pdfjs-dist@5.4.296.patch"
  },
  "packageManager": "pnpm@11.9.0"
}
```

- [ ] **Step 2: Verify it's valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('OK')"`

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: pare root package.json down to workspace tooling"
```

---

### Task 4: Register `web` in `pnpm-workspace.yaml`

**Files:**
- Modify: `pnpm-workspace.yaml:1-3`

**Interfaces:**
- Consumes: nothing new.
- Produces: pnpm/Turborepo now discover `web/package.json` (from Task 2) as a workspace member, which Task 7's `pnpm install` depends on.

- [ ] **Step 1: Add `web` to the `packages` list**

Change:
```yaml
packages:
  - storybook
  - packages/*
```
To:
```yaml
packages:
  - web
  - storybook
  - packages/*
```

- [ ] **Step 2: Verify**

Run: `grep -A3 "^packages:" pnpm-workspace.yaml`

Expected:
```
packages:
  - web
  - storybook
  - packages/*
```

- [ ] **Step 3: Commit**

```bash
git add pnpm-workspace.yaml
git commit -m "chore: register web as a pnpm workspace package"
```

---

### Task 5: Centralize env loading and clean up `web/next.config.ts` / `web/payload.config.ts`

**Files:**
- Create: `web/env.ts`
- Modify: `web/next.config.ts` (full replace)
- Modify: `web/payload.config.ts:1-27` (insert env loading, no other changes)

**Interfaces:**
- Consumes: nothing new (operates on files produced by Task 1).
- Produces: `loadRootEnv(dir: string): void`, exported from `web/env.ts`, consumed by both `web/next.config.ts` and `web/payload.config.ts`. This is the mechanism Task 7's verification (env vars visible to `pnpm dev`/`pnpm --filter web run migrate`) depends on.

- [ ] **Step 1: Create `web/env.ts`**

```ts
import { loadEnvConfig } from '@next/env'
import path from 'node:path'

export function loadRootEnv(dir: string) {
  loadEnvConfig(path.resolve(dir, '..'))
}
```

This resolves one directory above `web/` (i.e. the repository root, where `.env`/`.env.local`/`.env.example` live) and loads it via `@next/env`'s `loadEnvConfig`, the same loader Next.js uses internally — so `.env.local` still takes precedence over `.env`, matching prior behavior.

- [ ] **Step 2: Rewrite `web/next.config.ts`**

Replace the entire file with:

```ts
import { env } from '@/types/environment'
import { withPayload } from '@payloadcms/next/withPayload'
import { NextConfig } from 'next'
import { z } from 'zod'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadRootEnv } from './env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default async (phase, { defaultConfig }) => {
  loadRootEnv(dirname)

  const parsedEnv = env.safeParse(process.env)
  if (!parsedEnv.success) {
    console.error('\n' + z.prettifyError(parsedEnv.error) + '\n')
    process.exit(1)
  }

  const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,

    serverExternalPackages: ['@react-pdf/renderer', 'svgo', 'pdf-parse'],
    turbopack: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.wasm', '.json', '.css', '.scss', '.svg'],
    },
    images: {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      remotePatterns: [
        new URL(`${process.env.SERVER_URL}/**`),
        new URL('https://daniel.heene.io/**'),
        new URL('https://daniel.heene.dev/**'),
        new URL('https://daniel.heene.review/**'),
        new URL('https://daniel.heene.nexus/**'),
        new URL('https://daniel.heene.local/**'),
        new URL('https://cdn.pixabay.com/**'),
        new URL('https://images.unsplash.com/**'),
      ],
      localPatterns: [{ pathname: '**' }],
      contentDispositionType: 'inline',
      contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;',
      dangerouslyAllowSVG: true,
    },
    allowedDevOrigins: [
      'daniel.heene.nexus',
      '*.daniel.heene.nexus',
      'daniel.heene.local',
      '*.daniel.heene.local',
    ],

    env: {
      SERVER_HOST: process.env.SERVER_HOST,
      SERVER_URL: process.env.SERVER_URL,
      STATUS_PAGE_URL: process.env.STATUS_PAGE_URL,
      STATUS_PAGE_HEARTBEAT_URL: process.env.STATUS_PAGE_HEARTBEAT_URL,
      SENTRY_DSN: process.env.SENTRY_DSN,
    },

    webpack: (config, context) => {
      const nextConfig = { ...config }
      nextConfig.resolve = {
        ...config.resolve,
        extensionAlias: {
          '.cjs': ['.cts', '.cjs'],
          '.js': ['.ts', '.tsx', '.js', '.jsx'],
          '.mjs': ['.mts', '.mjs'],
        },
        alias: {
          ...config.resolve.alias,
          '@': path.resolve(__dirname, 'src'),

          '@access': path.resolve(dirname, './src/access/'),
          '@blocks': path.resolve(dirname, './src/blocks'),
          '@collections': path.resolve(dirname, './src/collections'),
          '@components': path.resolve(dirname, './src/components'),
          '@fields': path.resolve(dirname, './src/fields'),
          '@fonts': path.resolve(dirname, './src/fonts'),
          '@globals': path.resolve(dirname, './src/globals'),
          '@lib': path.resolve(dirname, './src/lib'),
          '@pdf': path.resolve(dirname, './src/pdf'),
          '@styles': path.resolve(dirname, './src/styles'),
          '@jobs-queue': path.resolve(dirname, './src/jobs-queue'),
          '@types': path.resolve(dirname, './src/types'),
        },
      }

      return config
    },

    async rewrites() {
      const rewrites = []

      if (process.env['NEXT_PUBLIC_UMAMI_URL']) {
        rewrites.push({
          source: '/stats/:match*',
          destination: `${process.env['NEXT_PUBLIC_UMAMI_URL']}/:match*`,
        })
      }

      return rewrites
    },
  }

  return [
    [withBundleAnalyzer, undefined],
    [withPayload, { devBundleServerPackages: false }],
  ].reduce((acc, [plugin, options]) => plugin(acc, options), nextConfig)
}
```

Compared to the original: removed the `ChildProcess`/`spawn` import, the `PHASE_DEVELOPMENT_SERVER` import, the module-level `let server` and `createTunnel`, the `if (phase === PHASE_DEVELOPMENT_SERVER) { ... }` block, the commented-out webpack/Sentry blocks, and both `console.debug(process.env)` / `console.debug(parsedEnv.data)` calls. Added the `loadRootEnv(dirname)` call as the first line of the exported function.

- [ ] **Step 3: Insert env loading into `web/payload.config.ts`**

Find the top of the file (first 25 lines):
```ts
import path from 'node:path'
import * as process from 'node:process'
import { fileURLToPath } from 'node:url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { redisKVAdapter } from '@payloadcms/kv-redis'
import { lexicalEditor, } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { BLOCKS } from '@/blocks'
import { COLLECTIONS } from '@/collections'
import { GLOBALS } from '@/globals'
import generateDocumentThumbnail from '@/jobs-queue/tasks/generateDocumentThumbnail'
import { useSendAdapter } from '@/lib/useSendAdapter'
import { CollectionSlug } from '@/types/collections'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { SKILL_TYPE } from '@/types/select-options'
import { QueueSlug } from '@/types/jobs-queue'
import { generateResumeLocalizedData } from '@/jobs-queue/tasks/generateResumeLocalizedData'
import { TASKS } from '@/jobs-queue/tasks'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const config = buildConfig({
```

Replace it with (adds one import and one call, nothing else changes):
```ts
import path from 'node:path'
import * as process from 'node:process'
import { fileURLToPath } from 'node:url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { redisKVAdapter } from '@payloadcms/kv-redis'
import { lexicalEditor, } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { BLOCKS } from '@/blocks'
import { COLLECTIONS } from '@/collections'
import { GLOBALS } from '@/globals'
import generateDocumentThumbnail from '@/jobs-queue/tasks/generateDocumentThumbnail'
import { useSendAdapter } from '@/lib/useSendAdapter'
import { CollectionSlug } from '@/types/collections'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { SKILL_TYPE } from '@/types/select-options'
import { QueueSlug } from '@/types/jobs-queue'
import { generateResumeLocalizedData } from '@/jobs-queue/tasks/generateResumeLocalizedData'
import { TASKS } from '@/jobs-queue/tasks'

import { loadRootEnv } from './env'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

loadRootEnv(dirname)

export const config = buildConfig({
```

This is required because `payload migrate` and `payload generate:types` invoke `payload.config.ts` directly through the Payload CLI, outside of Next's request lifecycle — they need their own explicit env load, since `buildConfig({...})` below reads `process.env.*` synchronously as the module evaluates (e.g. `url: process.env.DATABASE_URL`, `secret: process.env.PAYLOAD_SECRET`).

- [ ] **Step 4: Confirm no leftover references to removed tunnel logic**

Run: `grep -n "createTunnel\|PHASE_DEVELOPMENT_SERVER\|ChildProcess\|console.debug" web/next.config.ts`

Expected: no output (empty).

- [ ] **Step 5: Commit**

```bash
git add web/env.ts web/next.config.ts web/payload.config.ts
git commit -m "refactor: centralize env loading via @next/env, drop dead tunnel/debug code from next.config.ts"
```

---

### Task 6: Update `biome.json` include paths

**Files:**
- Modify: `biome.json:9-18` (`files.includes`)
- Modify: `biome.json:34-50` (`formatter.includes`, one exclusion path)

**Interfaces:**
- Consumes: nothing new.
- Produces: `pnpm lint` / `pnpm format` continuing to cover `web/`'s source after the move — no other task depends on this, but Task 7's verification checks it.

- [ ] **Step 1: Update `files.includes`**

Change:
```json
    "includes": [
      "/*.js",
      "/*.jsx",
      "/*.ts",
      "/*.tsx",
      "/*.json",
      "src/**/*",
      "app/**",
      "public/**"
    ],
```
To:
```json
    "includes": [
      "/*.js",
      "/*.jsx",
      "/*.ts",
      "/*.tsx",
      "/*.json",
      "web/*.js",
      "web/*.jsx",
      "web/*.ts",
      "web/*.tsx",
      "web/*.json",
      "web/src/**/*",
      "web/app/**",
      "web/public/**"
    ],
```

- [ ] **Step 2: Update the `formatter.includes` exclusion**

Change:
```json
      "!./src/types/payload.ts",
```
To:
```json
      "!./web/src/types/payload.ts",
```

- [ ] **Step 3: Verify**

Run: `pnpm --filter website exec biome check web/next.config.ts 2>&1 | tail -20` (run from repo root; if `pnpm --filter website` doesn't resolve because the root package has no name-based filter target, run `pnpm exec biome check web/next.config.ts` instead)

Expected: Biome runs without an "unknown file" / "not included" error for `web/next.config.ts` (may still report or not report style findings — that's fine, we're only checking the include path resolves).

- [ ] **Step 4: Commit**

```bash
git add biome.json
git commit -m "chore: point biome includes at web/"
```

---

### Task 7: Install and full verification pass

**Files:**
- None (no file changes — this task runs the full verification suite from the design spec).

**Interfaces:**
- Consumes: everything produced by Tasks 1–6.
- Produces: a working `pnpm dev` / `pnpm build` at the repo root. Terminal task — nothing downstream depends on this.

- [ ] **Step 1: Install dependencies**

Run: `cd /Users/daniel/Code/danielheene/website && pnpm install`

Expected: pnpm resolves the new `web` workspace member (output should mention `Scope: all 3 workspace projects` or similar, now including `web`, `storybook`, and root) and completes without `ERR_PNPM_ADDING_TO_ROOT` or missing-workspace errors.

- [ ] **Step 2: Type-check the `web` package**

Run: `pnpm --filter web exec tsc --noEmit`

Expected: the same pre-existing, unrelated errors already known from before this migration (in `payload.config.ts` re: `generateResumeDocumentTask`, `src/jobs-queue/tasks/generateResumeDocument.tsx`, `src/components/Shaders/StaticMeshGradient.tsx`, `src/components/Toasty/Toasty.tsx` — all from the in-progress `jobs-queue` refactor, unrelated to this move). Confirm no *new* errors about unresolved `@/`, `@access`, `@jobs-queue`, etc. path aliases or missing `web/env.ts` — those would indicate the move broke path resolution.

- [ ] **Step 3: Start the dev server and confirm env + no tunnel/debug noise**

Run: `cd /Users/daniel/Code/danielheene/website && timeout 20 pnpm dev > /tmp/web-dev-verify.log 2>&1; cat /tmp/web-dev-verify.log`

Expected:
- `▲ Next.js 16.2.10 (Turbopack)` and `✓ Ready in ...ms` appear (both `web` and `storybook` dev scripts run, since `turbo run dev` runs the `dev` task in every package that defines one — this is expected Turborepo behavior with the current `turbo.json`).
- No `console.debug` env dump output (the full `process.env` / `parsedEnv.data` blocks removed in Task 5).
- No wrangler tunnel spawn attempt or `CLOUDFLARE_TUNNEL_*`-related output from `next.config.ts` (that logic was removed in Task 5; `scripts/dev-tunnel.mjs` remains the supported tunnel path, unchanged, and is not invoked by `pnpm dev`).
- No `It looks like you're trying to use TypeScript but do not have the required package(s) installed` error and no `ERR_PNPM_ADDING_TO_ROOT` — if either appears, it's the pre-existing `typescript@^7.0.2` issue (out of scope per Global Constraints), not a regression from this move; note it but do not attempt to fix it as part of this task.

- [ ] **Step 4: Confirm a production build succeeds**

Run: `cd /Users/daniel/Code/danielheene/website && pnpm build`

Expected: Turborepo runs the `build` task for both `web` and `storybook` (per `turbo.json`'s task graph) and both complete without error, producing `web/.next/` and `storybook/dist/`.

- [ ] **Step 5: Confirm Payload CLI commands see root env vars**

Run: `pnpm --filter web run generate:types`

Expected: completes without a Payload config error about a missing `DATABASE_URL`/`PAYLOAD_SECRET` (which would indicate `web/payload.config.ts`'s `loadRootEnv` call from Task 5 isn't working).

- [ ] **Step 6: Confirm Storybook still works standalone**

Run: `cd /Users/daniel/Code/danielheene/website && timeout 20 pnpm --filter storybook dev > /tmp/storybook-dev-verify.log 2>&1; cat /tmp/storybook-dev-verify.log`

Expected: Storybook dev server starts normally — confirms this migration didn't disturb the sibling workspace package.

- [ ] **Step 7: Final commit (lockfile)**

```bash
git add pnpm-lock.yaml
git commit -m "chore: update lockfile for web workspace package"
```
