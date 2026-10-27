# Personal Website - Daniel Heene

This repository contains the source code for the personal website, blog, and resume builder: [daniel.heene.io](https://daniel.heene.io).

> **For AI coding agents and contributors**: See [`AGENTS.md`](./AGENTS.md) for coding conventions, architecture notes, and known security/style guardrails before making changes.

---

## Tech Stack

- **Language & Runtime**: [TypeScript](https://www.typescriptlang.org/) / [Node.js](https://nodejs.org/) (`^26.0.0`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **CMS**: [Payload CMS 3.x](https://payloadcms.com/)
- **Database**: [MongoDB 8](https://www.mongodb.com/) (via `@payloadcms/db-mongodb`)
- **Cache & Pub/Sub**: [Redis 8](https://redis.io/) (`@payloadcms/kv-redis`, `@trieb.work/nextjs-turbo-redis-cache`, and custom SSE pub/sub handler)
- **Storage**: S3-compatible storage ([RustFS](https://rustfs.com) in local dev via Docker, AWS S3 / Cloudflare R2 in production via `@payloadcms/storage-s3`)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), PostCSS, Tailwind Variants
- **Component Development**: [Storybook 10](https://storybook.js.org/)
- **Linting & Formatting**: [Oxlint](https://oxc.rs/docs/guide/usage/linter) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) (no ESLint/Prettier)
- **Package Manager**: [Bun](https://bun.sh/) (`^1.4.0`, pinned `bun@1.4.2`); Node.js still runs Next, Payload and the scripts
- **Testing**: [Vitest](https://vitest.dev/) (Unit), [Playwright](https://playwright.dev/) (E2E)
- **Integrations & Services**:
  - **Analytics**: [Umami](https://umami.is/) (Optional)
  - **Transactional Email**: [UseSend](https://usesend.com/) / [React Email](https://react.email/) (Optional)
  - **Error Tracking & Tracing**: [Sentry](https://sentry.io/) (Optional)
  - **AI Metadata & Alt-Text**: OpenAI / Anthropic (Optional)
  - **Address & Geocoding**: Mapbox (Optional)
  - **Stock Photos**: Unsplash API (Optional)
  - **Icons**: Self-hosted Iconify API (`https://icons.heene.io`)
  - **Dev Tunnel**: Cloudflare Tunnel (Optional)

---

## Requirements

- **Node.js**: `^26.0.0`
- **Bun**: `^1.4.0` (v1.4.2 recommended)
- **Docker & Docker Compose**: For running local database (MongoDB), cache (Redis), and object storage (RustFS).
- **Doppler CLI**: For environment configuration and secret management.

---

## Setup & Local Development

### 1. Environment Configuration

Configuration and secrets are managed in [Doppler](https://doppler.com). Install the CLI, link this directory to the project, then write the config out to `.env.local`:

```bash
brew install dopplerhq/cli/doppler   # See docs.doppler.com/docs/install-cli for other platforms
doppler login
doppler setup --project website --config <your-config>
bun run load-env                     # Writes .env.local from active Doppler config
```

- `doppler setup` stores the project and config against this directory in `~/.doppler` (one-time step per clone).
- `bun run load-env` is the only command that talks to Doppler. Next.js loads `.env.local` automatically, so standard commands (`bun run dev`, `bun run build`) work without wrapping `doppler run`.
- **Re-run `bun run load-env` after changing variables in Doppler or switching configs** with `doppler setup --config <name>`.
- `bun run load-env --check` reports whether `.env.local` is in sync with Doppler and exits non-zero if drift is detected (without writing).
- `.env.local` is gitignored and written with owner-only permissions (`0600`).
- To inspect secrets without writing to disk, run `doppler secrets`.

### 2. Start Local Services

Launch the infrastructure services (MongoDB 8, Redis 8, and RustFS storage with automatic bucket creation) using Docker Compose:

```bash
docker compose up -d
```

### 3. Install Dependencies

```bash
bun install
```

> Git hooks (Lefthook, commitlint) are installed automatically during `bun install`.
>
> The root `package.json` only carries the repo-wide tooling (linters, test runner,
> release/commit tooling, Turborepo). Every runtime dependency is declared by the
> workspace that imports it, so `apps/frontend`, `apps/backend` and each
> `packages/*` entry carry their own `package.json`.

### 4. Generate Payload Types & Import Map

Payload requires generated TypeScript types and an import map for the admin panel:

```bash
bun run generate
```

> Always run `bun run generate` after adding or changing collections, globals, blocks, or fields.

### 5. Run the Application

Start the development server (runs Next.js dev server and Storybook in parallel):

```bash
bun run dev
```

Or run services independently:

```bash
bun run dev:backend      # Payload backend only (http://localhost:3100)
bun run dev:frontend     # Public frontend only (http://localhost:3000)
bun run dev:storybook    # Storybook only (http://localhost:6006)
bun run dev:tunnel       # Cloudflare tunnel + every dev server
```

#### Application Endpoints

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Storybook**: [http://localhost:6006](http://localhost:6006)

---

## Entry Points

- **Backend app** (`apps/backend`) — the Payload CMS 3.x app:
  - `app/(payload)/`: Payload CMS admin panel routes (`/admin`) and the REST API (`/api`).
  - `app/(frontend)/`: the contact-form and admin B2B API routes.
  - `payload.config.ts`, integrated into Next.js via `withPayload` in `next.config.ts`.
  - `src/jobs-queue/`, plus the standalone background worker entrypoint
    `scripts/start-worker.mjs` with `scripts/health-server.ts`.
- **Frontend app** (`apps/frontend`) — the public site:
  - `app/(frontend)/`: public pages, layouts and API routes (`/api/preview`, `/api/sse`,
    `/api/revalidate`, `/api/health/*`, …). Dynamic pages are under `[slug]/`.
  - `src/lib/payloadClient.ts`: the authenticated HTTP client the frontend uses to read
    the backend's REST API. The frontend never imports backend modules directly.
- **Shared packages** (`packages/`): `types` (generated Payload types + hand-written shared
  types), `styles` (CSS partials — the Tailwind theme and the Payload admin overrides),
  `components` (framework-agnostic components), `lib` (framework-level
  utilities both apps need — dates, i18n, JSON-LD, shiki, RSS, Redis, Umami) and
  `app-components` (the site-level React components both apps render).
  Each app owns its own stylesheet entry point (`apps/frontend/frontend.css`,
  `apps/backend/backend.css`) and imports the shared theme from `packages/styles`.
- **Task Runner**: Turborepo (`turbo.json`) — `turbo run <task>` executes the task in every app that defines it, in parallel.
- **Cloudflare Tunnel**: `scripts/tunnel.mjs` (starts `wrangler tunnel run`; `bun run dev:tunnel` runs it alongside the dev servers).
- **Environment Loader**: `scripts/load-env.mjs` (fetches active Doppler secrets into `.env.local`).

---

## Available Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Starts every app's dev server in Turborepo's TUI. |
|  `bun run dev:backend` | Starts the Payload backend development server only (`localhost:3100`). |
|  `bun run dev:frontend` | Starts the public frontend development server only (`localhost:3000`). |
|  `bun run dev:storybook` | Starts the Storybook development server (`localhost:6006`). |
|  `bun run dev:tunnel` | Starts the Cloudflare tunnel alongside every dev server. |
|  `bun run tunnel` | Starts the Cloudflare tunnel only. |
| `bun run build` | Production build of every app, in parallel, via Turborepo. |
| `bun run build:storybook` | Builds static Storybook documentation into `dist/`. |
| `bun run start:storybook` | Serves the static Storybook build on port 3020. |
| `bun run start:app` | Starts the production Next.js application server. |
| `bun run start:worker` | Runs standalone background jobs worker and health monitoring server. |
| `bun run load-env` | Writes `.env.local` from active Doppler config (`--check` validates drift). |
| `bun run generate` | Runs `generate:types` and `generate:importmap` in parallel. |
| `bun run generate:types` | Generates TypeScript types for Payload collections and globals (`packages/types/src/payload.ts`). |
| `bun run generate:importmap` | Regenerates Payload admin component import map. |
| `bun run _payload` | Wrapper to execute Payload CLI commands (used by `migrate`, `generate` and the other scripts). |
| `bun run migrate` | Runs database migrations via Payload CLI. |
| `bun run ci` | Local convenience: runs database migrations and a full production build (CI itself runs the steps separately). |
| `bun run lint` | Runs `oxlint` and `oxfmt --check` in every app, via Turborepo. |
| `bun run lint:fix` | Runs `oxlint --fix` and `oxfmt` in every app, via Turborepo. |
| `bun run format` | Runs `oxfmt` in every app, via Turborepo. |
| `bun run typecheck` | Runs the TypeScript typechecker (`tsc --noEmit`) in every app, via Turborepo. |
| `bun run deps:lint` | Runs Syncpack to check dependency version consistency across packages. |
| `bun run deps:fix` | Runs Syncpack to automatically align dependency versions. |
| `bun run deps:update` | Updates dependency versions using Syncpack. |
| `bun run chore:format` | Formats `package.json` field order using Syncpack. |
| `bun run chore:reinstall` | Cleans `node_modules` and `bun.lock`, then runs fresh `bun install`. |
| `bun run seed:topics` | Seeds fixture blog topics (`--clean` to remove). |
| `bun run seed:posts` | Seeds fixture blog posts and media (`--clean` to remove, `--count <n>` to set quantity). |
| `bun run seed:pages` | Seeds fixture pages (`--clean` to remove, `--count <n>` to set quantity). |
| `bun run seed:resume-documents` | Seeds an older and a newer fixture resume document without PDFs (`--clean` to remove). |
| `bun run links:migrate` | Runs database migration for link field naming. |
| `bun run refs:backfill` | Rebuilds content reference index table. |
| `bun run test` | Runs the unit tests once via Vitest, in every app that has them, via Turborepo. |
| `bun run test:watch` | Runs Vitest in interactive watch mode. |
| `bun run test:coverage` | Runs Vitest with v8 code coverage reporting in every app, via Turborepo. |
| `bun run test:e2e` | Runs Playwright E2E tests against `.env.test`. |
| `bun run test:e2e:ui` | Runs Playwright E2E tests with interactive UI. |
| `bun run test:e2e:docker` | Runs Playwright E2E tests inside Docker Chromium container. |
| `bun run release` | Runs semantic-release to calculate version, tag, and publish changelog. |
| `bun run release:dry-run` | Runs semantic-release in dry-run mode. |

---

## Environment Variables

The source of truth is declared as a Zod schema in `apps/backend/src/types/environment.ts`. It is validated by `apps/backend/next.config.ts` during startup, failing fast if required variables are missing or malformed.

### Core & Server

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Optional (`development` \| `production` \| `test`) | Runtime environment (defaults to `development`). |
| `SERVER_HOST` | **Required** | Host/port used for server-side URL construction. |
| `SERVER_URL` | **Required** (URL) | Public URL of the server (inlined into client bundle at build time). |
| `PAYLOAD_SECRET` | **Required** | Secret key used to encrypt Payload JWT tokens. |
| `PREVIEW_SECRET` | **Required** | Shared secret for draft/preview authentication. |
| `CRON_SECRET` | **Required** | Secret token reserved for securing cron/scheduled tasks. |

### Database & Cache

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | **Required** | MongoDB connection string (e.g. `mongodb://127.0.0.1:27017/productiondb`). |
| `REDIS_URL` | **Required** | Redis connection string (used for KV adapter, cache handler, and SSE pub/sub). |

### Storage (S3 / RustFS / Minio)

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `S3_BUCKET` | **Required** | S3 bucket name. |
| `S3_ENDPOINT` | **Required** | S3 API endpoint URL (e.g. `http://127.0.0.1:9000` locally). |
| `S3_REGION` | **Required** | S3 region identifier (`us-east-1` for local RustFS). |
| `S3_ACCESS_KEY` | **Required** | S3 access key ID. |
| `S3_SECRET_KEY` | **Required** | S3 secret access key. |

### Jobs Queue & Worker

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `PAYLOAD_JOBS_ENABLE_APP_WORKERS` | Optional (`true` \| `false`) | Enables embedded job workers in the main Next.js app process (defaults to `false`). |

### Status Page

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `STATUS_PAGE_URL` | **Required** (URL) | Public status page URL (inlined into client bundle). |
| `STATUS_PAGE_HEARTBEAT_URL` | **Required** (URL) | Heartbeat monitoring URL pinged server-side. |

### Analytics & Email (Optional)

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_UMAMI_URL` | **Required** | Umami analytics script URL / rewrite target. |
| `NEXT_PUBLIC_UMAMI_SITE_ID` | **Required** (UUID) | Umami tracking site UUID. |
| `UMAMI_USERNAME` | **Required** | Umami account username for server-side stats queries. |
| `UMAMI_PASSWORD` | **Required** | Umami account password for server-side stats queries. |
| `USESEND_URL` | **Required** (URL) | UseSend transactional email endpoint. |
| `USESEND_API_KEY` | **Required** | UseSend API authorization key. |
| `USESEND_DEFAULT_FROM_ADDRESS` | **Required** (Email) | Default sender email address. |
| `USESEND_DEFAULT_FROM_NAME` | **Required** | Default sender display name. |

### Third-Party APIs

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ICONIFY_API` | Optional (URL) | Self-hosted Iconify API (defaults to `https://icons.heene.io`). |
| `OPENAI_API_KEY` | **Required** | API key for OpenAI (used for automated alt-text and meta descriptions). |
| `ANTHROPIC_API_KEY` | **Required** | API key for Anthropic Claude (alternative AI generation provider). |
| `MAPBOX_API_KEY` | **Required** | Mapbox access token for address and coordinate lookups. |
| `UNSPLASH_ACCESS_KEY` | Optional | Unsplash API access key for stock photo search & direct media import. |

### Error Tracking (Sentry, Optional)

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | Optional (URL) | Enables Sentry SDK if provided (inlined at build time). |
| `SENTRY_ENVIRONMENT` | Optional | Custom environment name reported to Sentry. |
| `SENTRY_RELEASE` | Optional | Release tag reported to Sentry. |
| `SENTRY_TRACES_SAMPLE_RATE` | Optional | Performance trace sample rate (`0` to `1`). |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry authentication token for source map upload during build. |
| `SENTRY_ORG` | Optional | Sentry organization slug for source map upload. |
| `SENTRY_PROJECT` | Optional | Sentry project name for source map upload. |

### Cloudflare Tunnel (Optional)

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_TUNNEL_HOST` | Optional | Hostname for local dev tunnel. |
| `CLOUDFLARE_TUNNEL_URL` | Optional (URL) | Target URL for Cloudflare tunnel. |
| `CLOUDFLARE_TUNNEL_TOKEN` | Optional | Cloudflare tunnel authentication token. |

> **Build-Time Inlining Notice**: `SERVER_URL`, `STATUS_PAGE_URL`, and `SENTRY_DSN` are inlined into the client bundle at build time by `next.config.ts`. Additionally, route shells rendered at build time with `cacheComponents: true` capture server-side values. Ensure correct values are present during `bun run build`.

---

## Project Structure

```text
.
├── apps/
│   ├── backend/                  # Payload CMS 3.x app (admin panel, REST API, job worker, PDF)
│   │   ├── app/
│   │   │   ├── (frontend)/       # Contact-form and admin B2B API routes
│   │   │   └── (payload)/        # Payload admin UI routes + REST/GraphQL API
│   │   ├── public/               # Payload admin block thumbnails/icons
│   │   ├── scripts/              # Seeders, worker entrypoint, health server
│   │   ├── src/
│   │   │   ├── access/           # Payload access control policies (anyone, authenticated, etc.)
│   │   │   ├── blocks/           # Reusable Payload blocks (Hero, Content, Resume, Media, etc.)
│   │   │   ├── collections/      # Payload collections (Media, Pages, Posts, Resume*, Users, etc.)
│   │   │   ├── components/       # Admin-only React components (AdminPanel, etc.)
│   │   │   ├── emails/           # React Email templates
│   │   │   ├── fields/           # Reusable Payload field factories (Slug, HeroSlides, Link, etc.)
│   │   │   ├── fonts/            # Custom font definitions
│   │   │   ├── globals/          # Payload globals (SiteSettings, PDFGeneratorSettings, etc.)
│   │   │   ├── jobs-queue/       # Payload background jobs, tasks, workflows, and health checks
│   │   │   ├── lib/              # Utilities (RedisHandler, access, fetchers, seeding, etc.)
│   │   │   ├── migrations/       # Database migration scripts
│   │   │   ├── pdf/              # PDF resume generator components (@react-pdf/renderer)
│   │   │   ├── plugins/          # Custom Payload plugins
│   │   │   ├── types/            # TypeScript declarations, environment schema, re-exported types
│   │   │   └── widgets/          # Custom Payload dashboard widgets
│   │   ├── next.config.ts        # Next.js configuration & Payload integration
│   │   ├── payload.config.ts     # Payload CMS master configuration
│   │   └── vitest.config.ts      # Vitest configuration for this app
│   ├── frontend/                 # Public site
│   │   ├── app/(frontend)/       # Public pages, layouts and API routes (preview, sse, revalidate)
│   │   ├── public/               # Static public assets (favicons, og-image, etc.)
│   │   ├── src/
│   │   │   ├── blocks/           # Block renderers used by the public site
│   │   │   ├── components/       # Public React components
│   │   │   ├── fields/           # Field components used by the public site
│   │   │   ├── lib/              # payloadClient, fetchers, i18n, jsonLd, redirects, ...
│   │   │   ├── types/            # TypeScript declarations, re-exported shared types
│   │   │   └── widgets/          # Public dashboard widgets
│   │   ├── Dockerfile            # Container image for this app
│   │   ├── proxy.ts              # Next.js middleware (redirects, canonicalisation, noindex)
│   │   └── vitest.config.ts      # Vitest configuration for this app
│   └── storybook/                # Component workbench
│       ├── components/           # Component stories
│       ├── foundations/          # Foundations docs (typography, colors, motion, ...)
│       ├── shaders/              # Shader stories
│       ├── main.ts               # Storybook config (--config-dir .)
│       ├── preview.tsx           # Storybook preview
│       ├── next.config.ts        # Minimal Next config for the Storybook
│       ├── Dockerfile            # Container image for this app
│       └── package.json
├── packages/
│   ├── app-components/            # Site-level React components both apps render
│   ├── components/                # Framework-agnostic shared components
│   ├── font-pp-frama/             # One package per font family: /next, /css, /pdf, /assets
│   ├── font-pp-frama-text/        #   "
│   ├── font-pp-supply-mono/       #   "
│   ├── font-pp-supply-sans/       #   "
│   ├── lib/                       # Framework-level utilities both apps need
│   ├── styles/                    # CSS partials: the Tailwind theme + Payload admin overrides
│   └── types/                     # Generated Payload types + hand-written shared types
├── scripts/                      # Repo-wide utility scripts (image assembly, env loader, e2e helpers)
├── e2e/                          # Playwright end-to-end test specs
├── docker-compose.yml            # Local development infrastructure (MongoDB, Redis, RustFS)
├── oxlint.config.ts              # Oxlint rules
├── oxfmt.config.ts               # Oxfmt formatting and import order
├── lefthook.yml                  # Git hooks
├── bunfig.toml                   # Bun install settings
├── playwright.config.ts          # Playwright E2E configuration
├── vitest.setup.ts               # Shared Vitest environment setup and mocks
└── package.json                  # Dependencies, scripts, and engine requirements
```

---

## Testing

### Unit Tests (Vitest)

Unit tests are co-located next to the code under test as `*.test.ts` / `*.test.tsx`.

```bash
bun run test             # Run all unit tests once
bun run test:watch       # Run unit tests in interactive watch mode
bun run test:coverage    # Generate test coverage report
```

- Configuration: `vitest.config.ts`.
- Mocks & environment: `vitest.setup.ts` forces `TZ=UTC` and mocks `payload`, `next/cache`, and `redis`. Real implementations of `tailwind-merge`, `date-fns`, `slugify`, `pupa`, and `neotraverse` are tested directly.

### End-to-End Tests (Playwright)

E2E tests live in `e2e/*.spec.ts` and test structural health and smoke flows.

```bash
bun run test:e2e         # Run Playwright tests headlessly
bun run test:e2e:ui      # Open Playwright interactive UI test runner
bun run test:e2e:docker  # Run tests in Playwright Docker Chromium container
```

**E2E Prerequisites**:
1. Run `docker compose up -d` so MongoDB, Redis, and RustFS storage are active.
2. E2E tests execute using `.env.test` with dummy valid credentials.
3. `bun run test:e2e` automatically starts or reuses the local dev servers. For Docker tests (`bun run test:e2e:docker`), start them beforehand with `bun run dev`.

---

## Data Seeding

Seed fixture content into local MongoDB for development and testing:

```bash
# Seed Topics (categories)
bun run seed:topics          # Creates fixture blog topics
bun run seed:topics:clean    # Removes seeded blog topics

# Seed Blog Posts (with images)
bun run seed:posts           # Creates blog topics & 30 posts with downloaded images
bun run seed:posts:clean     # Removes seeded posts and associated media
# Pass custom count via: bun run seed:posts -- --count 10

# Seed Pages
bun run seed:pages           # Creates standard fixture pages
bun run seed:pages:clean     # Removes seeded pages
# Pass custom count via: bun run seed:pages -- --count 5
```

- Seeders are idempotent and match by slug.
- Article prose and layouts are deterministic per title using a seeded pseudo-random generator.
- Images are downloaded from `picsum.photos` and uploaded into Payload media.

---

## CI / CD & Deployment

Everything is built in CI; Docker images only `COPY` finished output (no package manager, installs or builds inside an image). The checks live in `.github/workflows/lint-and-test.yml`; branch protection on `main`/`develop` requires them to pass before a PR can merge, so pushes (`build-and-deploy.yml`) do not re-run them.

- **`lint-and-test.yml`** (pull requests only):
  1. **Lint**: `commitlint` (PRs), `oxlint` + `oxfmt --check`, `syncpack`, a check that the committed generated files match `bun run generate`, and `actionlint`.
  2. **Semgrep**: static security analysis (Node.js sinks, TypeScript/React patterns, hardcoded secrets).
  3. **Unit Tests**: `vitest run --coverage`.
  4. **E2E** (environment `Testing`): resets the shared Testing services (Mongo and Redis rebuilt through Dokploy, S3 bucket emptied; `scripts/reset-test-services.mjs`), migrates, seeds, builds both apps against `.env.test`, builds the real container images from each app's own Dockerfile and runs Playwright against those containers. Forks and dependabot cannot read the Testing secrets and use local containers (`docker compose`) instead.
- **Pushes to `develop` / `main`** (`build-and-deploy.yml`):
  1. **Semantic Versioning**: semver bump and tag/changelog via `semantic-release`. `main` cuts releases (`vX.Y.Z`, images also tagged `latest`), `develop` cuts release candidates (`vX.Y.Z-rc.N`, images also tagged `edge`). After a `main` release, `develop` is fast-forwarded to `main` when it has no commits of its own; otherwise it has to be brought up to date by hand, since `develop` only cuts release candidates while it contains every `main` release.
  2. **Deploy** (environment `Production` on `main`, `Development` on `develop`): runs `bun run migrate` against the target database, builds the backend with that environment's real values, then builds one image per app from its own Dockerfile (`apps/backend/Dockerfile` with the `app` and `worker` targets, `apps/frontend/Dockerfile`, `apps/storybook/Dockerfile`) for `linux/amd64` without pushing. Each image is started as a real container and polled on its health endpoint, then the verified images are pushed to `ghcr.io/danielheene/website/*` and the Dokploy redeploy webhooks are triggered. A failed boot-check stops the job before anything reaches the registry.

The push-triggered deploy build also uploads source maps to the self-hosted Rustrak Sentry backend via a standalone `sentry-cli` step; the PR-time build does not, since it never ships and there'd be no deployed release to attach them to. See AGENTS.md's "Observability" note for why this isn't done through `withSentryConfig`.

---

## Git Hooks & Conventions

Lefthook (`lefthook.yml`) manages Git hooks, installed automatically during `bun install`:

- `pre-commit`: Runs `oxfmt` and `oxlint --fix` on staged files, and syncpack when `package.json` changes.
- `commit-msg`: Enforces [Conventional Commits](https://www.conventionalcommits.org/) format using `commitlint`.

Example valid commit messages:
```text
feat(admin): add Iconify icon picker field
fix(media): sanitize SVG uploads before rendering
chore: update dependencies
```

---

## License

This project is licensed under the [MIT License](LICENSE).
