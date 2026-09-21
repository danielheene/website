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
- **Linting & Formatting**: [Biome](https://biomejs.dev/) (no ESLint/Prettier)
- **Package Manager**: [pnpm](https://pnpm.io/) (`^11.0.0`, pinned `pnpm@11.18.0`)
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
- **pnpm**: `^11.0.0` (v11.18.0 recommended)
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
pnpm load-env                        # Writes .env.local from active Doppler config
```

- `doppler setup` stores the project and config against this directory in `~/.doppler` (one-time step per clone).
- `pnpm load-env` is the only command that talks to Doppler. Next.js loads `.env.local` automatically, so standard commands (`pnpm dev`, `pnpm build`) work without wrapping `doppler run`.
- **Re-run `pnpm load-env` after changing variables in Doppler or switching configs** with `doppler setup --config <name>`.
- `pnpm load-env --check` reports whether `.env.local` is in sync with Doppler and exits non-zero if drift is detected (without writing).
- `.env.local` is gitignored and written with owner-only permissions (`0600`).
- To inspect secrets without writing to disk, run `doppler secrets`.

### 2. Start Local Services

Launch the infrastructure services (MongoDB 8, Redis 8, and RustFS storage with automatic bucket creation) using Docker Compose:

```bash
docker compose up -d
```

### 3. Install Dependencies

```bash
pnpm install
```

> Git hooks (Husky, lint-staged, commitlint) are installed automatically during `pnpm install`.

### 4. Generate Payload Types & Import Map

Payload requires generated TypeScript types and an import map for the admin panel:

```bash
pnpm generate
```

> Always run `pnpm generate` after adding or changing collections, globals, blocks, or fields.

### 5. Run the Application

Start the development server (runs Next.js dev server and Storybook in parallel):

```bash
pnpm dev
```

Or run services independently:

```bash
pnpm dev:app          # Next.js dev server only (http://localhost:3000)
pnpm dev:storybook    # Storybook only (http://localhost:6006)
pnpm email:dev        # React Email preview server (http://localhost:3005)
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
| `pnpm dev` | Starts Next.js dev server and Storybook in parallel (supports `--tunnel`). |
| `pnpm dev:app` | Starts Next.js development server only (`localhost:3000`). |
| `pnpm dev:storybook` | Starts Storybook development server (`localhost:6006`). |
| `pnpm build` | Production build (compiles Next.js bundle with Sentry release tagging). |
| `pnpm build:storybook` | Builds static Storybook documentation into `dist/`. |
| `pnpm start:storybook` | Serves the static Storybook build on port 3020. |
| `pnpm start` | Starts the production Next.js application server. |
| `pnpm start:worker` | Runs standalone background jobs worker and health monitoring server. |
| `pnpm load-env` | Writes `.env.local` from active Doppler config (`--check` validates drift). |
| `pnpm generate` | Runs `generate:types` and `generate:importmap` in parallel. |
| `pnpm generate:types` | Generates TypeScript types for Payload collections and globals (`src/types/payload.ts`). |
| `pnpm generate:importmap` | Regenerates Payload admin component import map. |
| `pnpm payload` | Wrapper to execute Payload CLI commands. |
| `pnpm migrate` | Runs database migrations via Payload CLI. |
| `pnpm ci` | CI sequence: runs database migrations and production build. |
| `pnpm lint` | Runs `biome check` (code quality, linting, and format checks). |
| `pnpm format` | Runs `biome format --write` to auto-fix code formatting. |
| `pnpm typecheck` | Runs TypeScript typechecker (`tsc --noEmit`). |
| `pnpm deps:lint` | Runs Syncpack to check dependency version consistency across packages. |
| `pnpm deps:fix` | Runs Syncpack to automatically align dependency versions. |
| `pnpm deps:update` | Updates dependency versions using Syncpack. |
| `pnpm chore:format` | Formats `package.json` field order using Syncpack. |
| `pnpm chore:reinstall` | Cleans `node_modules` and `pnpm-lock.yaml`, then runs fresh `pnpm install`. |
| `pnpm email:dev` | Starts React Email development server on port 3005 (`src/emails`). |
| `pnpm seed:topics` | Seeds fixture blog topics (`--clean` to remove). |
| `pnpm seed:posts` | Seeds fixture blog posts and media (`--clean` to remove, `--count <n>` to set quantity). |
| `pnpm seed:pages` | Seeds fixture pages (`--clean` to remove, `--count <n>` to set quantity). |
| `pnpm links:migrate` | Runs database migration for link field naming. |
| `pnpm refs:backfill` | Rebuilds content reference index table. |
| `pnpm test` | Runs unit tests once via Vitest. |
| `pnpm test:watch` | Runs Vitest in interactive watch mode. |
| `pnpm test:coverage` | Runs Vitest with v8 code coverage reporting. |
| `pnpm test:e2e` | Runs Playwright E2E tests against `.env.test`. |
| `pnpm test:e2e:ui` | Runs Playwright E2E tests with interactive UI. |
| `pnpm test:e2e:docker` | Runs Playwright E2E tests inside Docker Chromium container. |
| `pnpm release` | Runs semantic-release to calculate version, tag, and publish changelog. |
| `pnpm release:dry-run` | Runs semantic-release in dry-run mode. |

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

> **Build-Time Inlining Notice**: `SERVER_URL`, `STATUS_PAGE_URL`, and `SENTRY_DSN` are inlined into the client bundle at build time by `next.config.ts`. Additionally, route shells rendered at build time with `cacheComponents: true` capture server-side values. Ensure correct values are present during `pnpm build`.

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
├── biome.json                    # Biome linting and formatting configuration
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
pnpm test             # Run all unit tests once
pnpm test:watch       # Run unit tests in interactive watch mode
pnpm test:coverage    # Generate test coverage report
```

- Configuration: `vitest.config.ts`.
- Mocks & environment: `vitest.setup.ts` forces `TZ=UTC` and mocks `payload`, `next/cache`, and `redis`. Real implementations of `tailwind-merge`, `date-fns`, `slugify`, `pupa`, and `neotraverse` are tested directly.

### End-to-End Tests (Playwright)

E2E tests live in `e2e/*.spec.ts` and test structural health and smoke flows.

```bash
pnpm test:e2e         # Run Playwright tests headlessly
pnpm test:e2e:ui      # Open Playwright interactive UI test runner
pnpm test:e2e:docker  # Run tests in Playwright Docker Chromium container
```

**E2E Prerequisites**:
1. Run `docker compose up -d` so MongoDB, Redis, and RustFS storage are active.
2. E2E tests execute using `.env.test` with dummy valid credentials.
3. `pnpm test:e2e` automatically starts or reuses the local dev server. For Docker tests (`pnpm test:e2e:docker`), start the dev server beforehand with `pnpm dev:app`.

---

## Data Seeding

Seed fixture content into local MongoDB for development and testing:

```bash
# Seed Topics (categories)
pnpm seed:topics          # Creates fixture blog topics
pnpm seed:topics:clean    # Removes seeded blog topics

# Seed Blog Posts (with images)
pnpm seed:posts           # Creates blog topics & 30 posts with downloaded images
pnpm seed:posts:clean     # Removes seeded posts and associated media
# Pass custom count via: pnpm seed:posts -- --count 10

# Seed Pages
pnpm seed:pages           # Creates standard fixture pages
pnpm seed:pages:clean     # Removes seeded pages
# Pass custom count via: pnpm seed:pages -- --count 5
```

- Seeders are idempotent and match by slug.
- Article prose and layouts are deterministic per title using a seeded pseudo-random generator.
- Images are downloaded from `picsum.photos` and uploaded into Payload media.

---

## CI / CD & Deployment

The deployment pipeline is configured in `.github/workflows/ci-release.yml`:

- **Pull Requests** (against `main` or `develop`):
  1. **Lint Check**: Validates commit messages with `commitlint`, executes `biome check`, and runs `syncpack` (`deps:lint`).
  2. **Unit Tests**: Runs `vitest run --coverage`.
- **Pushes to `develop` / `main`**:
  1. **Semantic Versioning** (`main` only): Computes semver bump and generates tag/changelog via `semantic-release`.
  2. **Docker Builds**: Builds multi-target images (`app`, `worker`, `storybook` in `Dockerfile`) for `linux/amd64` and pushes them to GitHub Container Registry (`ghcr.io/danielheene/website/*`).
  3. **Dokploy Deployment**: Triggers automated deployment webhook on the production server.

---

## Git Hooks & Conventions

Husky manages Git hooks installed automatically during `pnpm install`:

- `pre-commit`: Runs `lint-staged` with `biome check --write` on staged files.
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
