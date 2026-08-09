# Personal Website - Daniel Heene

This repository contains the source code for my personal website: [daniel.heene.io](https://daniel.heene.io).

> **For AI coding agents**: see [`AGENTS.md`](./AGENTS.md) for coding conventions, architecture
> notes, and known security/style guardrails before making changes.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **CMS**: [Payload CMS 3.x](https://payloadcms.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Cache/KV**: [Redis](https://redis.io/)
- **Storage**: S3-compatible storage (local Minio in development)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Analytics**: [Umami](https://umami.is/) (Optional)
- **Email**: [UseSend](https://usesend.com/) (Optional)

## Requirements

- **Node.js**: `^26.0.0`
- **pnpm**: `^11.0.0`
- **Docker**: For running local database, cache, and storage services.

## Setup & Local Development

### 1. Environment Configuration

Configuration and secrets are managed in [Doppler](https://doppler.com). Install the CLI,
link this directory to the project, then write the config out to `.env.local`:

```bash
brew install dopplerhq/cli/doppler   # see docs.doppler.com/docs/install-cli for other platforms
doppler login
doppler setup --project website --config <your-config>
pnpm load-env                        # writes .env.local from the active config
```

`doppler setup` stores the project and config against this directory in `~/.doppler`, so
it is a one-time step per clone. There is no checked-in default: configs differ per
developer (`development_personal` and the like), and pinning one in the repo made it easy
to build against the wrong database without noticing. `doppler configure` shows what the
current directory resolves to.

`pnpm load-env` is the only thing that talks to Doppler. Next loads `.env.local`
automatically, so no package script wraps `doppler run` — `pnpm dev`, `pnpm payload` and
the rest just work. **Re-run it after changing anything in Doppler, or after switching
configs** with `doppler setup --config <name>`; nothing detects drift on its own.

- `pnpm load-env --check` reports whether `.env.local` is current and exits non-zero if
  not, without writing.
- The file is gitignored and written owner-only (`0600`) — it holds every secret the
  project uses. It is never generated as a side effect of another script.
- To inspect what will be written without touching the filesystem, run `doppler secrets`.

### 2. Start Services

Launch the infrastructure (MongoDB, Redis, and Minio) using Docker Compose:

```bash
docker compose up -d
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Generate Payload Artifacts

Payload requires generated TypeScript types and an import map for the admin panel:

```bash
pnpm generate
```

### 5. Run the Application

Start the development server:

```bash
pnpm dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

## Environment Variables

`apps/web/src/types/environment.ts` is the source of truth: it declares a Zod schema that
`next.config.ts` validates at load time, so the process exits immediately if anything
required is missing or malformed. Doppler stores the values; the list below explains them.

Everything is **required** unless marked optional.

### Core

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string. |
| `REDIS_URL` | Redis connection URL (KV adapter and cache handler). |
| `SERVER_URL` | Public URL of the server. Inlined into the client bundle. |
| `SERVER_HOST` | Host/port used for server-side URL construction. |
| `PAYLOAD_SECRET` | Encrypts Payload JWT tokens. |
| `PREVIEW_SECRET` | Authenticates Next.js/Payload draft previews. |
| `CRON_SECRET` | Reserved for cron tasks. Declared but not yet enforced by any route (see `AGENTS.md`). |

### Status page

| Variable | Purpose |
| --- | --- |
| `STATUS_PAGE_URL` | Status page link. Inlined into the client bundle. |
| `STATUS_PAGE_HEARTBEAT_URL` | Heartbeat endpoint pinged server-side. |

### Storage (Minio in local dev)

`S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.

### Analytics, email, and third-party APIs

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_UMAMI_URL`, `NEXT_PUBLIC_UMAMI_SITE_ID` | Umami rewrite target and site ID (a UUID). |
| `UMAMI_USERNAME`, `UMAMI_PASSWORD` | Credentials for the server-side Umami stats query. |
| `USESEND_URL`, `USESEND_API_KEY`, `USESEND_DEFAULT_FROM_ADDRESS`, `USESEND_DEFAULT_FROM_NAME` | UseSend email provider. |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | Generated alt text and meta descriptions. |
| `MAPBOX_API_KEY` | Address and coordinate lookups. |

### Sentry (all optional)

With no DSN the SDK is never initialised and the app runs unchanged. `SENTRY_DSN` is public
by design and is inlined into the client bundle. `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` and
`SENTRY_TRACES_SAMPLE_RATE` tune reporting; `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and
`SENTRY_PROJECT` are only needed to upload source maps during a build;
`NEXT_PUBLIC_SENTRY_REPLAY_RATE` and `NEXT_PUBLIC_SENTRY_REPLAY_ERROR_RATE` control replay
sampling.

### Cloudflare tunnel (all optional)

`CLOUDFLARE_TUNNEL_HOST`, `CLOUDFLARE_TUNNEL_URL` and `CLOUDFLARE_TUNNEL_TOKEN` are only
read when starting the dev server with `--tunnel`.

> **Fixed at build time.** `SERVER_URL`, `STATUS_PAGE_URL` and `SENTRY_DSN` are listed in
> `next.config.ts`'s `env:` block, which inlines them into the compiled bundle. On top of
> that, `cacheComponents: true` gives nearly every route a shell rendered at build time,
> so a server-side `process.env` read is captured into that shell and served from cache —
> moving the read further up the tree does not change this. All three must therefore be
> correct when the app is built, which makes a build specific to one environment. All
> three are public values, so nothing secret is baked in.
>
> Everything else — every secret and all server-only config — is read from the container
> environment at boot. See `buildTimeEnvKeys` in `src/types/environment.ts` for the exact
> set the build requires.

## Production Build

Dokploy builds the app from source on the deployment server; there is no image to
build or push. The build needs a reachable database because `generateStaticParams()`
calls `payload.find()`, and a Redis URL because the KV adapter is constructed while
`payload.config.ts` loads. The exact set is `buildTimeEnvKeys` in
`src/types/environment.ts`.

To reproduce a production build locally:

```bash
pnpm build
pnpm start
```

Notes:

- **Three values are inlined at build time.** `SERVER_URL`, `STATUS_PAGE_URL` and
  `SENTRY_DSN` are baked into the client bundle and captured in the prerendered shell
  (`cacheComponents: true` gives nearly every route a build-time shell), so passing them
  at run time only satisfies the schema check — it does not change what is served. Build
  with the config you intend to run. Every secret and all server-only config *is*
  runtime, so a deployment can be repointed at a different database, cache, bucket or
  mail provider without rebuilding.
- **A production build validates only the build-time subset** of the schema; the full
  schema is validated at boot, so a missing runtime variable still fails fast — at the
  point where it can be supplied.
- **Private hosts need Tailscale.** The `development` config points `DATABASE_URL` and
  `REDIS_URL` at hosts on the tailnet, so the build only resolves them from a machine
  already on the tailnet.
- **`docker compose up -d` is only the local infrastructure** (Mongo, Redis, rustfs).
  The app is not a compose service — it runs via `pnpm dev`.

## Available Scripts

No script wraps `doppler run`. Locally the environment comes from `.env.local`, which
Next loads on its own — see [Environment Configuration](#1-environment-configuration) for
how to generate it. On the deployment server Dokploy supplies the environment directly.
The one script that does talk to Doppler is `pnpm load-env`, which writes that file.

- `pnpm load-env`: Writes `.env.local` from the active Doppler config (`--check` to
  report drift without writing).
- `pnpm dev`: Starts the Next.js development server (and Storybook, in parallel).
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm generate`: Runs `generate:types` and `generate:importmap` in parallel.
- `pnpm payload`: Wrapper for Payload CLI.
- `pnpm migrate`: Runs database migrations.
- `pnpm ci`: Sequence for CI/CD (migration + build).
- `pnpm lint`: Runs `biome check` (lint + format check) for code quality.
- `pnpm format`: Runs `biome format --write` to auto-fix formatting.
- `pnpm storybook` / `pnpm dev:storybook`: Runs Storybook for isolated component development.

## Project Structure

```text
.
├── app/                  # Next.js App Router
│   ├── (frontend)/       # Public site routes, incl. api/ (preview, sse, heartbeat, service-status)
│   └── (payload)/        # Payload admin panel routes
├── src/                  # Application Source
│   ├── access/           # Payload Access Control functions
│   ├── blocks/           # Reusable Payload Blocks (resume sections, content blocks)
│   ├── collections/      # Payload Collections (Media, Pages, BlogPosts, Resume*, Users, etc.)
│   ├── components/       # React Components
│   ├── contexts/         # React Context providers
│   ├── fields/           # Custom/reusable Payload Field factories
│   ├── globals/          # Payload Globals (SiteSettings, PDFGeneratorSettings, etc.)
│   ├── hooks/            # React hooks
│   ├── jobs-queue/       # Payload Jobs Queue tasks/workflows
│   ├── lib/              # Framework-agnostic utilities (Redis handler, caching, etc.)
│   ├── pdf/              # PDF generation (resume export)
│   ├── styles/           # CSS and Tailwind styles
│   ├── types/            # Shared/generated TypeScript types (incl. generated payload.ts)
│   └── widgets/          # Payload admin dashboard widgets
├── public/               # Static Assets
├── scripts/              # Standalone Node scripts (e.g. dev tunnel)
├── payload.config.ts     # Payload CMS configuration (root-level, not under src/)
├── docker-compose.yml    # Local Infrastructure
└── next.config.ts        # Next.js Configuration
```

## Entrypoints

- Next.js App Router under `app/` (served via `pnpm dev` / `pnpm start`).
- Payload CMS is configured in `payload.config.ts` (repo root) and integrated via `withPayload` in `next.config.ts`.
- File uploads are handled by Payload collections with the S3 storage plugin configured in `payload.config.ts`.

## Testing

Unit tests run with **Vitest**, end-to-end tests with **Playwright** (Chromium).

- **Unit tests**: `pnpm test` (watch mode: `pnpm test:watch`, coverage: `pnpm test:coverage`)
- **E2E tests**: `pnpm test:e2e` (interactive UI: `pnpm test:e2e:ui`)
- **E2E in Docker Chromium**: `pnpm test:e2e:docker`

Conventions:

- Unit tests are co-located as `*.test.ts` next to the code under test (config: `vitest.config.ts`,
  shared mocks and `TZ=UTC` in `vitest.setup.ts`).
- E2E specs live in `e2e/*.spec.ts` (config: `playwright.config.ts`). They are smoke tests only —
  the site is CMS-driven, so they assert structural health, not content.

E2E prerequisites:

- `docker compose up -d` (MongoDB, Redis and S3 storage must be reachable).
- `.env.test` is committed with dummy, format-valid values so the app can boot. Flows backed by
  real external services do **not** work with it: AI generation (OpenAI/Anthropic), Mapbox
  geocoding, email (UseSend), Umami analytics and the status-page heartbeat.
- `pnpm test:e2e` starts (or reuses) the dev server automatically. The Docker flow
  (`scripts/e2e-docker.sh`) expects the dev server already running on the host and uses the
  `mcr.microsoft.com/playwright` image — its tag must always match the `@playwright/test` version
  in `package.json`; bump them together.

## Commits & Git Hooks

Hooks are installed by Husky via the `prepare` script, so `pnpm install` sets
them up automatically.

| Hook | Runs |
| --- | --- |
| `pre-commit` | `lint-staged` → `biome check --write` on staged files only |
| `commit-msg` | `commitlint` against Conventional Commits |

Formatting fixes are re-staged automatically, so a commit that only needed
formatting still goes through. Only staged files are touched — pre-existing
issues elsewhere never block an unrelated commit.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org):

```text
feat(admin): add Iconify icon picker field
fix: repair the Docker build for the flat repo layout
chore!: drop Node 20 support        # `!` marks a breaking change
```

Scopes are deliberately unrestricted — see `commitlint.config.mjs`.

Both hooks can be skipped with `git commit --no-verify` for genuine
emergencies; the same commitlint check runs on pull requests in CI, so a
bypassed message still has to be fixed before merge.

## Error Tracking (Sentry)

Sentry is wired for errors, Web Vitals, logs and traces, but stays **completely
inert until `SENTRY_DSN` is set** — no DSN means `Sentry.init` is never called,
so local development is unaffected.

| Variable | Purpose |
| --- | --- |
| `SENTRY_DSN` | Enables the SDK. Everything below is ignored without it. |
| `SENTRY_TRACES_SAMPLE_RATE` | Trace sampling, `0`–`1`. Defaults to `1` in dev, `0.1` in production. |
| `SENTRY_ENVIRONMENT` / `SENTRY_RELEASE` | Override the reported environment and release. |
| `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT` | Source-map upload during build. All three required; skipped otherwise. |
| `NEXT_PUBLIC_SENTRY_REPLAY_RATE` / `..._ERROR_RATE` | Session replay, off by default. |

Notes:

- `/api/sse` and `/api/heartbeat` are excluded from tracing — they are polled or
  long-lived and would dominate the quota.
- Sentry requests are proxied through `/monitoring` so ad blockers cannot drop them.
- Source maps are deleted after upload, so they are never served publicly.

## Features

- **Media Optimization**: Images are stored in S3 and automatically generate `alt` text and `blurDataURL` on upload using `sharp`.
- **SVG Optimization**: Optimize SVGs for logos using `svgo` in the admin UI. Note: this is a client-side editor convenience only, not a server-side sanitization boundary — see `AGENTS.md` for the related security note.
- **Localization**: Full support for English (`en`) and German (`de`) with localized admin panel and content.
- **Modern Styling**: Powered by Tailwind CSS v4.
- **Live Preview & Server-Sent Events**: Draft/live preview via `app/(frontend)/api/preview`, and a Redis pub/sub-backed SSE endpoint (`app/(frontend)/api/sse`) for real-time status updates.

### Data Seeding

Seed blog topics and posts for local testing (idempotent, matched by slug):

```bash
pnpm seed:blog          # create 6 topics + 30 posts (with downloaded images)
pnpm seed:blog:clean    # remove them again
```

Article structure and prose are randomized per post title with a seeded PRNG, so
reruns produce identical output while each post differs. Images are downloaded
from `picsum.photos` (keyless) and uploaded into the images collection; the AI
alt-text hook is skipped during seeding.

Note: `payload run` only forwards CLI arguments after a `--` separator — see the
`seed:blog:clean` script.
- TODO: If seeding is needed, add a dedicated script or route and document usage here.

## CI / Deployment

Tests and the build run in different places because they need different things.

- **GitHub Actions runs the tests** (`.github/workflows/test.yml`, plus commitlint in
  `commitlint.yml`). The suite mocks `payload` and stubs its own environment in
  `vitest.setup.ts`, so it needs no database, no tailnet and no secrets — a clean runner
  is the right place for it, and keeping it there proves it stays self-contained. Running
  on pull requests also catches a failure before merge.
- **Dokploy runs the build** on the deployment server, via `pnpm ci`
  (`payload migrate && next build`). The build cannot move to CI cheaply:
  `generateStaticParams()` calls `payload.find()` in six routes, so it needs a reachable
  database over the tailnet, which Dokploy already has.
- Dokploy watches the repository and builds from source. CI publishes no artifact and
  triggers nothing — there is no image registry in the loop.
- Secrets and non-secret config reach both CI and the server from Doppler: the Doppler
  GitHub App syncs into GitHub environments (`Production` for `main`, `Development`
  otherwise), and Dokploy injects the environment at build and boot.

## Code Quality & Security Notes

- Linting/formatting is enforced by [Biome](https://biomejs.dev/) (`biome.json`), not ESLint/Prettier — see `AGENTS.md` for the full style conventions.
- `pnpm lint` does not currently pass cleanly on `main` (pre-existing formatting and lint diagnostics); avoid introducing new issues when touching a file.
- See [`AGENTS.md`](./AGENTS.md) for a summary of known security guardrails (open `queryPresets` access, unauthenticated SSE channel subscription, unsanitized raw SVG rendering, unused `CRON_SECRET`) to keep in mind when working in related areas.

---

#### Legacy Code

The following code of my previous websites is no longer maintained, but a dump of their code bases can still be found under the following tags: [website-v2](https://github.com/danielheene/website/tree/homepage-v2) | [website-v1](https://github.com/danielheene/website/tree/homepage-v1).
