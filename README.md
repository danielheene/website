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
bun run dev:app          # Next.js dev server only (http://localhost:3000)
bun run dev:storybook    # Storybook only (http://localhost:6006)
bun run dev:email        # React Email preview server (http://localhost:3005)
```

#### Application Endpoints

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Storybook**: [http://localhost:6006](http://localhost:6006)
- **React Email Previews**: [http://localhost:3005](http://localhost:3005)

---

## Entry Points

- **Next.js App Router**:
  - `app/(frontend)/`: Public website pages, layouts, and API routes (`/api/preview`, `/api/sse`, `/api/heartbeat`, `/api/health/*`, etc.). Dynamic pages are under `[slug]/`.
  - `app/(payload)/`: Payload CMS admin panel routes (`/admin`).
- **Payload Configuration**: `payload.config.ts` in the project root, integrated into Next.js via `withPayload` in `next.config.ts`.
- **Jobs Queue & Worker**: `src/jobs-queue/` and standalone background worker entrypoint `scripts/start-worker.mjs` with `scripts/health-server.ts`.
- **Dev Runner**: `scripts/dev.mjs` (handles `--tunnel` Cloudflare tunnel argument and orchestrates dev processes).
- **Environment Loader**: `scripts/load-env.mjs` (fetches active Doppler secrets into `.env.local`).

---

## Available Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Starts Next.js dev server and Storybook in parallel (supports `--tunnel`). |
| `bun run dev:app` | Starts Next.js development server only (`localhost:3000`). |
| `bun run dev:storybook` | Starts Storybook development server (`localhost:6006`). |
| `bun run build` | Production build (compiles Next.js bundle with Sentry release tagging). |
| `bun run build:storybook` | Builds static Storybook documentation into `dist/`. |
| `bun run start:storybook` | Serves the static Storybook build on port 3020. |
| `bun run start:app` | Starts the production Next.js application server. |
| `bun run start:worker` | Runs standalone background jobs worker and health monitoring server. |
| `bun run load-env` | Writes `.env.local` from active Doppler config (`--check` validates drift). |
| `bun run generate` | Runs `generate:types` and `generate:importmap` in parallel. |
| `bun run generate:types` | Generates TypeScript types for Payload collections and globals (`src/types/payload.ts`). |
| `bun run generate:importmap` | Regenerates Payload admin component import map. |
| `bun run _payload` | Wrapper to execute Payload CLI commands (used by `migrate`, `generate` and the other scripts). |
| `bun run migrate` | Runs database migrations via Payload CLI. |
| `bun run ci` | Local convenience: runs database migrations and a full production build (CI itself runs the steps separately). |
| `bun run lint` | Runs `oxlint` and `oxfmt --check` (linting and format checks). |
| `bun run lint:fix` | Runs `oxlint --fix` and `oxfmt` to auto-fix what they can. |
| `bun run format` | Runs `oxfmt` to fix formatting and import order. |
| `bun run typecheck` | Runs TypeScript typechecker (`tsc --noEmit`). |
| `bun run deps:lint` | Runs Syncpack to check dependency version consistency across packages. |
| `bun run deps:fix` | Runs Syncpack to automatically align dependency versions. |
| `bun run deps:update` | Updates dependency versions using Syncpack. |
| `bun run chore:format` | Formats `package.json` field order using Syncpack. |
| `bun run chore:reinstall` | Cleans `node_modules` and `bun.lock`, then runs fresh `bun install`. |
| `bun run dev:email` | Starts React Email development server on port 3005 (`src/emails`). |
| `bun run seed:topics` | Seeds fixture blog topics (`--clean` to remove). |
| `bun run seed:posts` | Seeds fixture blog posts and media (`--clean` to remove, `--count <n>` to set quantity). |
| `bun run seed:pages` | Seeds fixture pages (`--clean` to remove, `--count <n>` to set quantity). |
| `bun run seed:resume-documents` | Seeds an older and a newer fixture resume document without PDFs (`--clean` to remove). |
| `bun run links:migrate` | Runs database migration for link field naming. |
| `bun run refs:backfill` | Rebuilds content reference index table. |
| `bun run test` | Runs unit tests once via Vitest. |
| `bun run test:watch` | Runs Vitest in interactive watch mode. |
| `bun run test:coverage` | Runs Vitest with v8 code coverage reporting. |
| `bun run test:e2e` | Runs Playwright E2E tests against `.env.test`. |
| `bun run test:e2e:ui` | Runs Playwright E2E tests with interactive UI. |
| `bun run test:e2e:docker` | Runs Playwright E2E tests inside Docker Chromium container. |
| `bun run release` | Runs semantic-release to calculate version, tag, and publish changelog. |
| `bun run release:dry-run` | Runs semantic-release in dry-run mode. |

---

## Environment Variables

The source of truth is declared as a Zod schema in `src/types/environment.ts`. It is validated by `next.config.ts` during startup, failing fast if required variables are missing or malformed.

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
├── app/                          # Next.js App Router
│   ├── (frontend)/               # Public website routes, layouts, and API routes
│   │   ├── [slug]/               # Dynamic page routes
│   │   ├── api/                  # API endpoints (preview, sse, health, heartbeat, icons, etc.)
│   │   └── layout.tsx            # Frontend root layout
│   └── (payload)/                # Payload CMS admin routes
│       ├── admin/                # Payload admin UI routes
│       ├── api/                  # Payload REST & GraphQL API endpoints
│       └── layout.tsx            # Payload admin layout
├── src/                          # Application source code
│   ├── access/                   # Payload access control policies (anyone, authenticated, etc.)
│   ├── blocks/                   # Reusable Payload blocks (Hero, Content, Resume, Media, etc.)
│   ├── collections/              # Payload collections (Media, Pages, Posts, Resume*, Users, etc.)
│   ├── components/               # React UI components & Storybook stories
│   ├── contexts/                 # React context providers (theme, locale, etc.)
│   ├── emails/                   # React Email templates
│   ├── fields/                   # Reusable Payload field factories (Slug, HeroSlides, Link, etc.)
│   ├── fonts/                    # Custom font definitions
│   ├── globals/                  # Payload globals (SiteSettings, PDFGeneratorSettings, etc.)
│   ├── hooks/                    # Custom React hooks
│   ├── jobs-queue/               # Payload background jobs, tasks, workflows, and health checks
│   ├── lib/                      # Utilities (RedisHandler, SSE, image optimization, seeding, etc.)
│   ├── migrations/               # Database migration scripts
│   ├── pdf/                      # PDF resume generator components (@react-pdf/renderer)
│   ├── plugins/                  # Custom Payload plugins
│   ├── stories/                  # Global Storybook configurations & documentation
│   ├── styles/                   # CSS and Tailwind 4 stylesheets
│   ├── types/                    # TypeScript declarations, environment schema, generated types
│   └── widgets/                  # Custom Payload dashboard widgets
├── public/                       # Static public assets (favicons, icons, robots.txt)
├── scripts/                      # Utility scripts (dev runner, worker, seeders, environment loader)
├── docs/                         # Specifications, architecture notes, and design plans
├── e2e/                          # Playwright end-to-end test specs
├── docker-compose.yml            # Local development infrastructure (MongoDB, Redis, RustFS)
├── next.config.ts                # Next.js configuration & Payload integration
├── payload.config.ts             # Payload CMS master configuration
├── oxlint.config.ts              # Oxlint rules
├── oxfmt.config.ts               # Oxfmt formatting and import order
├── lefthook.yml                  # Git hooks
├── bunfig.toml                   # Bun install settings
├── playwright.config.ts          # Playwright E2E configuration
├── vitest.config.ts              # Vitest unit test configuration
├── vitest.setup.ts               # Vitest environment setup and mocks
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
3. `bun run test:e2e` automatically starts or reuses the local dev server. For Docker tests (`bun run test:e2e:docker`), start the dev server beforehand with `bun run dev:app`.

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

Everything is built in CI; Docker images only `COPY` finished output (no package manager, installs or builds inside an image). The checks live in `.github/workflows/ci.yml` and are reused by pull requests (`lint-and-test.yml`) and pushes (`build-and-deploy.yml`).

- **`ci.yml`** (pull requests and pushes):
  1. **Lint**: `commitlint` (PRs), `oxlint` + `oxfmt --check`, `syncpack`, a check that the committed generated files match `bun run generate`, and `actionlint`.
  2. **Unit Tests**: `vitest run --coverage`.
  3. **Compile**: `next build --experimental-build-mode=compile` with `.env.test` values. It needs no database and must not inline any environment-specific value; `scripts/check-env-leak.mjs` fails the job if a `.env.test` value ends up in `.next`.
  4. **E2E** (environment `Testing`): resets the shared Testing services (Mongo and Redis rebuilt through Dokploy, S3 bucket emptied; `scripts/reset-test-services.mjs`), migrates, seeds, runs `next build --experimental-build-mode=generate` (prerender/PPR), assembles `out/web` and runs Playwright against `node out/web/server.js`. Forks and dependabot cannot read the Testing secrets and use local containers (`docker compose`) instead.
- **Pushes to `develop` / `main`** (`build-and-deploy.yml`):
  1. **Semantic Versioning**: semver bump and tag/changelog via `semantic-release`. `main` cuts releases (`vX.Y.Z`, images also tagged `latest`), `develop` cuts release candidates (`vX.Y.Z-rc.N`, images also tagged `edge`). After a `main` release, `develop` is fast-forwarded to `main` when it has no commits of its own; otherwise it has to be brought up to date by hand, since `develop` only cuts release candidates while it contains every `main` release.
  2. **CI**: the jobs above.
  3. **Deploy** (environment `Production` on `main`, `Development` on `develop`): downloads the tested compile, runs `bun run migrate` against the target database, runs `--experimental-build-mode=generate` with that environment's values, assembles `out/{web,worker,storybook}` (`scripts/assemble-images.mjs`), builds the COPY-only images (`app`, `worker`, `storybook` in `Dockerfile`) for `linux/amd64`, pushes them to `ghcr.io/danielheene/website/*` and triggers the Dokploy redeploy webhooks.

Environment-specific values the browser needs (site URL, status page, Umami, Sentry DSN/environment) are read at runtime through `src/lib/runtimeConfig`, never through static `process.env.NEXT_PUBLIC_*` references or `next.config.ts` `env`, so one compile can be deployed to any environment.

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
