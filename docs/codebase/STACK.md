# Technology Stack

## Core Sections (Required)

### 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | TypeScript (strict mode **off**) | `web/tsconfig.json:46` (`"strict": false`) |
| Runtime + version | Node.js `^26.0.0` | `package.json:235` (root `engines.node`) |
| Package manager | pnpm `^11.0.0`, pinned `pnpm@11.9.0` | `package.json:236,246` |
| Module/build system | pnpm workspaces + Turborepo (`turbo run build` / `turbo run dev`) | `pnpm-workspace.yaml:1-4`, `turbo.json`, `package.json:213-224` |

Note: `.junie/AGENTS.md` and `.junie/guidelines.md` (AI-agent memory files, not authoritative) still say Node `^22`/pnpm `^10`/TypeScript `5.9` — those predate the recent `web/` workspace split and Next.js 16 bump; the manifest values above are current.

### 2) Production Frameworks and Dependencies

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| `next` | `^16.2.10` | App framework (App Router), SSR/SSG, image/font optimization | `web/package.json:65` |
| `react` / `react-dom` | `^19.2.7` | UI runtime (pinned repo-wide via root `resolutions`) | `package.json:239-240` |
| `payload` | `^3.85.2` | Headless CMS — collections, globals, admin UI, jobs queue, access control | `web/package.json:68`, `web/payload.config.ts` |
| `@payloadcms/db-mongodb` | `^3.85.2` | Payload's MongoDB/Mongoose database adapter | `web/payload.config.ts:6,170-172` |
| `@payloadcms/kv-redis` | `^3.85.2` | Redis-backed KV adapter for Payload | `web/payload.config.ts:7,218-220` |
| `@payloadcms/storage-s3` | `^3.85.2` | S3-compatible storage plugin for media/documents | `web/payload.config.ts:10,246-276` |
| `@payloadcms/richtext-lexical` | `^3.85.2` | Rich text editor for Payload fields | `web/payload.config.ts:9,169` |
| `@payloadcms/plugin-import-export` | `^3.85.2` | Import/export collections in admin UI | `web/payload.config.ts:8,224-235` |
| `@payloadcms/plugin-sentry` (unused) | `^3.85.2` | Sentry plugin for Payload — imported but call-site commented out | `web/payload.config.ts:240-245` |
| `@react-pdf/renderer` | `^4.5.1` | Generates resume PDF documents server-side | `web/src/pdf/index.tsx` |
| `@ai-sdk/anthropic` / `ai` | `^4.0.11` / `^7.0.20` | Anthropic Claude calls (image alt-text, meta description generation) | `web/src/lib/fetchAnthropicImageAltText.ts`, `web/src/lib/fetchAnthropicMetaDescription.ts` |
| `@sentry/nextjs` (partially wired) | `^10.65.0` | Error monitoring — dependency present, `SENTRY_DSN` passed to client env, but `withSentryConfig` is not applied in `next.config.ts` | `web/next.config.ts:100` |
| `sharp` | `^0.35.3` | Image processing for Payload uploads | `web/payload.config.ts:12,280` |
| `ioredis` | `^5.11.0` | Redis client (backs the KV adapter / other Redis use) | `web/package.json:58` |
| `zod` | `^4.4.2` | Environment variable schema validation | `web/src/types/environment.ts` |
| `tailwindcss` | `^4.3.0` (via `@tailwindcss/postcss`) | Utility-first CSS | `web/postcss.config.js`, `web/src/styles/` |
| `wrangler` | `^4.110.0` | Cloudflare CLI (used by `scripts/dev-tunnel.mjs` for local tunneling) | `web/package.json:86`, `scripts/dev-tunnel.mjs` |

### 3) Development Toolchain

| Tool | Purpose | Evidence |
|------|---------|----------|
| Biome `^2.4.16` | Lint + format (replaces ESLint/Prettier) | `biome.json`, root `package.json:220-222` |
| Turborepo `^2.9.18` | Task orchestration/caching across workspace packages | `turbo.json` |
| Changesets `2.31.0` | Versioning/release automation | `.changeset/config.json`, `.github/workflows/changesets.yml` |
| syncpack `^15.3.2` | Cross-workspace dependency version consistency | root `package.json:231` |
| Node built-in test runner | Unit testing (`node --test`) | `README.md:117-124`, `.junie/guidelines.md` — see `docs/codebase/TESTING.md` |
| Storybook `^10.5.0` | Component/design-system documentation (separate `storybook/` workspace) | `storybook/package.json`, `storybook/.storybook/main.ts` |

### 4) Key Commands

```bash
pnpm install                 # install all workspace deps
pnpm dev                     # turbo run dev (starts web + storybook dev servers)
pnpm build                   # turbo run build
pnpm --filter web run generate   # payload generate:types + generate:importmap
pnpm --filter web run migrate    # payload migrate
pnpm lint                    # biome check
pnpm format                  # biome format --write
node --test                  # run Node test-runner tests (repo has none checked in yet)
```

### 5) Environment and Config

- Config sources: root `.env` / `.env.local` / `.env.example` (single source of truth, loaded explicitly — see `web/env.ts:14-29`), `web/payload.config.ts`, `web/next.config.ts`, `web/tsconfig.json`, `biome.json`, `turbo.json`, `pnpm-workspace.yaml`.
- Required env vars (per `web/src/types/environment.ts:3-52`, enforced via `zod` at boot — `loadEnv` calls `process.exit(1)` on failure, `web/env.ts:22-26`): `SERVER_HOST`, `SERVER_URL`, `STATUS_PAGE_URL`, `STATUS_PAGE_HEARTBEAT_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `CRON_SECRET`, `DATABASE_URL`, `REDIS_URL`, `S3_BUCKET`, `S3_SECRET_KEY`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_ENDPOINT`, `UMAMI_USERNAME`, `UMAMI_PASSWORD`, `NEXT_PUBLIC_UMAMI_URL`, `NEXT_PUBLIC_UMAMI_SITE_ID`, `USESEND_URL`, `USESEND_API_KEY`, `USESEND_DEFAULT_FROM_ADDRESS`, `USESEND_DEFAULT_FROM_NAME`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `MAPBOX_API_KEY` (optional: `CLOUDFLARE_TUNNEL_*`).
  - **[TODO]** `.env.example` (repo root, committed) only documents a subset of these (`DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `CRON_SECRET`, `SERVER_URL`, `REDIS_URL`, `S3_*`, `USESEND_*`, `NEXT_PUBLIC_UMAMI_URL`, `UMAMI_WEBSITE_ID`) — several vars required by the zod schema (`SERVER_HOST`, `STATUS_PAGE_URL`, `STATUS_PAGE_HEARTBEAT_URL`, `UMAMI_USERNAME`, `UMAMI_PASSWORD`, `NEXT_PUBLIC_UMAMI_SITE_ID`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `MAPBOX_API_KEY`) are missing from `.env.example`. New setups will fail `zod` validation until these are added manually.
- Deployment/runtime constraints: Docker Compose provisions local MongoDB 8, Redis 8, and an S3-compatible `rustfs` service for dev (`docker-compose.yml`). **[TODO]** Production hosting target is not documented anywhere in the repo (no Dockerfile, no `vercel.json`, no Fly/Railway config found).

### 6) Evidence

- `package.json` (root workspace tooling manifest)
- `web/package.json` (app manifest)
- `storybook/package.json` (Storybook workspace manifest)
- `pnpm-workspace.yaml`, `turbo.json`
- `web/payload.config.ts`, `web/next.config.ts`, `web/tsconfig.json`
- `biome.json`, `docker-compose.yml`, `.env.example`

## Extended Sections (Optional)

Not populated — repo complexity does not currently warrant a full dependency taxonomy beyond the table above.
