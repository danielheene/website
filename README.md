# Personal Website - Daniel Heene

This repository contains the source code for the personal website, blog, and resume builder: [daniel.heene.io](https://daniel.heene.io).

> **For AI coding agents and contributors**: See [`AGENTS.md`](./AGENTS.md) for coding conventions, architecture notes, and known security/style guardrails before making changes.

---

## Tech Stack

- **Language & Runtime**: [TypeScript](https://www.typescriptlang.org/) / [Node.js](https://nodejs.org/) (`^26.0.0`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **CMS**: [Payload CMS 3.x](https://payloadcms.com/)
- **Database**: [MongoDB 8](https://www.mongodb.com/) (via `@payloadcms/db-mongodb`)
- **Cache & Pub/Sub**: [Redis 8](https://redis.io/) (`@payloadcms/kv-redis` for Payload's KV store, plus `src/lib/RedisHandler.ts` for app-level caching and the SSE pub/sub layer)
- **Storage**: S3-compatible storage ([RustFS](https://rustfs.com) in local dev via Docker, AWS S3 / Cloudflare R2 in production via `@payloadcms/storage-s3`)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), PostCSS, Tailwind Variants
- **Component Development**: [Storybook 10](https://storybook.js.org/)
- **Linting & Formatting**: [Oxlint](https://oxc.rs/docs/guide/usage/linter) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) (no ESLint/Prettier), with `oxlint-tailwindcss` and a vendored `anti-slop` rule plugin (`tools/oxlint/anti-slop/`)
- **Package Manager**: [Bun](https://bun.sh/) (`^1.4.0`, pinned `bun@1.4.2`); Node.js still runs Next, Payload and the scripts
- **Testing**: [Vitest](https://vitest.dev/) (Unit), [Playwright](https://playwright.dev/) (E2E)
- **Integrations & Services**:
  - **Analytics**: [Umami](https://umami.is/) (Optional)
  - **Transactional Email**: [UseSend](https://usesend.com/) / [React Email](https://react.email/)
  - **AI Metadata, Alt-Text, Excerpts & Translation**: Anthropic Claude via the [AI SDK](https://ai-sdk.dev/) (`src/lib/anthropic/`)
  - **Address & Geocoding**: Mapbox
  - **Stock Photos**: Unsplash API (Optional)
  - **Icons**: Self-hosted Iconify API (`https://icons.heene.io`)
  - **Dev Tunnel**: Cloudflare Tunnel (Optional, `bun run dev --tunnel`)

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

Payload requires generated TypeScript types and an import map for the admin panel (this also runs `next typegen` for the route types):

```bash
bun run generate
```

> Always run `bun run generate` after adding or changing collections, globals, blocks, or fields.

### 5. Run the Application

Start the Next.js development server:

```bash
bun run dev              # http://localhost:3000
bun run dev --tunnel     # same, also exposed through the Cloudflare Tunnel (needs CLOUDFLARE_TUNNEL_*)
```

Storybook and the email previews run as separate processes:

```bash
bun run dev:app          # Plain `next dev`, without the --tunnel wrapper
bun run dev:storybook    # Storybook (http://localhost:6006)
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
  - `app/(frontend)/`: Public website pages, layouts, and route handlers: `/api/preview`, `/api/sse`, `/api/health`, `/api/icons/collection`, `/blog/feed.xml` and `/download/resume.pdf`. CMS pages are under `[slug]/`, the blog under `blog/`, resume documents under `resume/[slug]/`.
  - `app/(payload)/`: Payload CMS admin panel (`/admin`) and Payload's REST API (`/api/*`; GraphQL is disabled).
  - `app/llms.txt/`: The site's public `/llms.txt`, generated from published pages, posts and topics (unrelated to the repository's own `llms.txt` in the project root).
  - `app/robots.ts`, `app/manifest.ts`, `app/global-error.tsx`: Crawler rules, the web app manifest and the root error boundary. These three have to stay at the root of `app/`; Next.js does not pick them up inside a route group. `robots.txt` disallows everything unless `SERVER_HOST` equals `PRODUCTION_HOST`.
  - `app/(frontend)/sitemap.ts`: The sitemap.
- **Request Proxy**: `proxy.ts` (Next.js 16's replacement for `middleware.ts`) canonicalizes blog listing URLs and marks non-default sorts `noindex`.
- **Payload Configuration**: `payload.config.ts` in the project root, integrated into Next.js via `withPayload` in `next.config.ts`.
- **Jobs Queue & Worker**: `src/jobs-queue/` and standalone background worker entrypoint `scripts/start-worker.mjs` with `scripts/health-server.ts`. The web process only enqueues jobs; the worker runs them.
- **Dev Runner**: `scripts/dev.mjs` (a `next dev` wrapper that owns the `--tunnel` flag).
- **Environment Loader**: `scripts/load-env.mjs` (fetches active Doppler secrets into `.env.local`).

---

## Available Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Starts the Next.js dev server through `scripts/dev.mjs` (`localhost:3000`, supports `--tunnel`). |
| `bun run dev:app` | Starts the Next.js dev server directly, without the tunnel wrapper. |
| `bun run dev:storybook` | Starts Storybook development server (`localhost:6006`). |
| `bun run build` | Production build (`next build --webpack`). |
| `bun run analyze` | Compile-only build with `@next/bundle-analyzer` reports in `.next/analyze/`, followed by `bundle:check`. |
| `bun run bundle:check` | Checks the first-load JavaScript of each public route in an existing build against its budget (`scripts/check-bundle-size.mjs`). |
| `bun run build:storybook` | Builds static Storybook documentation into `dist/`. |
| `bun run start:storybook` | Serves the static Storybook build on port 3020. |
| `bun run start:app` | Starts the production Next.js application server. |
| `bun run start:worker` | Runs standalone background jobs worker and health monitoring server. |
| `bun run load-env` | Writes `.env.local` from active Doppler config (`--check` validates drift). |
| `bun run generate` | Runs `generate:next-types`, `generate:payload-types` and `generate:importmap` in sequence. |
| `bun run generate:next-types` | Generates Next.js route types (`next typegen`). |
| `bun run generate:payload-types` | Generates TypeScript types for Payload collections and globals (`src/types/payload.ts`). |
| `bun run generate:importmap` | Regenerates Payload admin component import map (`app/(payload)/admin/importMap.js`). |
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
| `bun run seed:topics` | Seeds fixture blog topics (`-- --count <n>`, default 6; `seed:topics:clean` removes them). |
| `bun run seed:posts` | Seeds fixture blog posts and media (`-- --count <n>`, default 10; `seed:posts:clean` removes them). |
| `bun run seed:pages` | Seeds fixture pages (`-- --count <n>`, default 10; `seed:pages:clean` removes them). |
| `bun run seed:resume-documents` | Seeds an older and a newer fixture resume document without PDFs (`seed:resume-documents:clean` removes them). |
| `bun run links:migrate` | Runs database migration for link field naming. |
| `bun run refs:backfill` | Rebuilds content reference index table. |
| `bun run test` | Runs unit tests once via Vitest. |
| `bun run test:watch` | Runs Vitest in interactive watch mode. |
| `bun run test:coverage` | Runs Vitest with v8 code coverage reporting. |
| `bun run test:e2e` | Runs Playwright E2E tests against `.env.test`. |
| `bun run test:e2e:ui` | Runs Playwright E2E tests with interactive UI. |
| `bun run test:e2e:docker` | Runs Playwright E2E tests inside Docker Chromium container, against a dev server on the host. |
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
| `PRODUCTION_HOST` | **Required** | Host of the production site. An environment counts as production when `SERVER_HOST` equals it; everywhere else `robots.txt` disallows all crawlers and generated PDFs carry a DRAFT watermark. |
| `SERVER_URL` | **Required** (URL) | Public URL of the site, read server-side. |
| `NEXT_PUBLIC_SERVER_URL` | **Required** (URL) | Same value as `SERVER_URL`, exposed to the browser for the live-preview listener. |
| `RESUME_REDIRECT_URL_BASE` | **Required** (URL) | Base URL for the redirect target of `/download/resume.pdf` and localized resume jobs. |
| `PAYLOAD_SECRET` | **Required** | Secret key used to encrypt Payload JWT tokens. |
| `PREVIEW_SECRET` | **Required** | Shared secret for draft/preview authentication. |
| `CRON_SECRET` | **Required** | Reserved for securing cron/scheduled routes; declared but not read anywhere yet. |

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
| `PAYLOAD_JOBS_ENABLE_APP_WORKERS` | Optional (`true` \| `false`) | Enables embedded job workers in the main Next.js app process (defaults to `false`; the standalone worker normally runs the jobs). |

### Status Page

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_STATUS_PAGE_URL` | **Required** (URL) | Public status page URL, read in the browser. |
| `STATUS_PAGE_HEARTBEAT_URL` | **Required** (URL) | Status page heartbeat endpoint the server fetches (Redis-cached) for the service-status indicator. |
| `STATUS_PAGE_WORKER_HEARTBEAT_PUSH_URL` | Optional (URL) | Push monitor URL the worker's `heartbeatPing` job calls every minute; without it the job only logs. |

### Analytics & Email

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
| `ANTHROPIC_API_KEY` | **Required** | API key for Anthropic Claude (alt-text, meta descriptions, blog excerpts, resume translation). |
| `MAPBOX_API_KEY` | **Required** | Mapbox access token for address and coordinate lookups. |
| `UNSPLASH_ACCESS_KEY` | Optional | Unsplash API access key for stock photo search & direct media import. |

### Cloudflare Tunnel (Optional)

| Variable | Type / Requirement | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_TUNNEL_HOST` | Optional | Hostname for local dev tunnel. |
| `CLOUDFLARE_TUNNEL_URL` | Optional (URL) | Target URL for Cloudflare tunnel. |
| `CLOUDFLARE_TUNNEL_TOKEN` | Optional | Cloudflare tunnel authentication token. |

> **Build-Time Inlining Notice**: `NEXT_PUBLIC_*` values are inlined into the client bundle, and route shells prerendered with `cacheComponents: true` capture server-side values. Ensure correct values are present during `bun run build`.

---

## Project Structure

```text
.
├── app/                          # Next.js App Router
│   ├── (frontend)/               # Public website routes, layouts, and API routes
│   │   ├── [slug]/               # CMS-driven pages
│   │   ├── api/                  # Route handlers (preview, sse, health, icons/collection)
│   │   ├── blog/                 # Blog listing, topics, posts, and the RSS feed (feed.xml)
│   │   ├── download/             # /download/resume.pdf redirect
│   │   ├── resume/               # Resume documents by slug
│   │   ├── sitemap.ts            # Sitemap
│   │   └── layout.tsx            # Frontend root layout
│   ├── (payload)/                # Payload CMS admin routes
│   │   ├── admin/                # Payload admin UI routes (and the generated import map)
│   │   ├── api/                  # Payload REST API endpoints
│   │   └── layout.tsx            # Payload admin layout
│   ├── llms.txt/                 # Public /llms.txt route
│   ├── robots.ts                 # Crawler rules           ┐
│   ├── manifest.ts               # Web app manifest        ├ must stay at the app root
│   └── global-error.tsx          # Root error boundary     ┘
├── src/                          # Application source code
│   ├── blocks/                   # Payload blocks (rich text, code, feature cards, resume sections, etc.)
│   ├── collections/              # Payload collections (Media*, Pages, BlogPosts, BlogTopics, Resume*, Redirects, References, Users)
│   ├── components/               # React UI components
│   ├── emails/                   # React Email templates
│   ├── fields/                   # Reusable Payload field factories (Slug, HeroSlides, Link, etc.)
│   ├── fonts/                    # Custom font definitions
│   ├── globals/                  # Payload globals (SiteSettings, SettingsGlobalUser, PDFGeneratorSettings)
│   ├── jobs-queue/               # Payload job tasks, workflows, their handlers, and health checks
│   ├── lib/                      # Utilities, grouped by domain: access/, hooks/, payloadHooks/, actions/,
│   │                             #   fetchers/, sse/, seed/, redirects/, references/, anthropic/, etc.
│   ├── migrations/               # Database migration scripts
│   ├── pdf/                      # PDF resume generator components (@react-pdf/renderer)
│   ├── plugins/                  # Custom Payload plugins (redirects, references)
│   ├── styles/                   # CSS and Tailwind 4 stylesheets
│   ├── types/                    # TypeScript declarations, environment schema, generated types
│   └── widgets/                  # Custom Payload dashboard widgets
├── .storybook/                   # Storybook config, component stories, and foundations/shaders docs (MDX)
├── .github/                      # Workflows (lint-and-test, build-and-deploy), setup action, Dependabot
├── public/                       # Static public assets (favicons, OG image, Payload admin assets)
├── scripts/                      # Utility scripts (dev runner, worker, seeders, environment loader, image assembly)
├── tools/oxlint/anti-slop/       # Vendored Oxlint rule plugin
├── patches/                      # Bun dependency patches (pdfjs-dist)
├── e2e/                          # Playwright end-to-end test specs
├── Dockerfile                    # COPY-only images: app, worker, storybook
├── docker-compose.yml            # Local development infrastructure (MongoDB, Redis, RustFS)
├── next.config.ts                # Next.js configuration, env validation & Payload integration
├── payload.config.ts             # Payload CMS master configuration
├── proxy.ts                      # Next.js request proxy (blog URL canonicalization)
├── instrumentation.ts            # Next.js server instrumentation hook
├── instrumentation-client.ts     # First-pageview Umami tracking
├── llms.txt                      # Entry points of this repository for AI coding agents
├── oxlint.config.ts              # Oxlint rules
├── oxfmt.config.ts               # Oxfmt formatting and import order
├── lefthook.yml                  # Git hooks
├── commitlint.config.mjs         # Conventional Commits rules
├── release.config.mjs            # semantic-release configuration
├── syncpack.config.mjs           # Dependency version groups
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
- Mocks & environment: `vitest.setup.ts` forces `TZ=UTC` and mocks `payload`, `next/cache`, `server-only`, and `redis`. Real implementations of `tailwind-merge`, `date-fns`, `slugify`, `pupa`, and `neotraverse` are tested directly.

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
4. `E2E_BASE_URL`, `E2E_SERVER_COMMAND` and `E2E_NO_SERVER` override the target URL, the server command, and whether Playwright starts a server at all (see `playwright.config.ts`).

> The E2E job in CI is currently disabled (commented out in `lint-and-test.yml`); run the suite locally.

---

## Data Seeding

Seed fixture content into local MongoDB for development and testing:

```bash
# Seed Topics (categories)
bun run seed:topics          # Creates 6 fixture blog topics
bun run seed:topics:clean    # Removes seeded blog topics

# Seed Blog Posts (with images)
bun run seed:posts           # Creates blog topics & 10 posts with downloaded images
bun run seed:posts:clean     # Removes seeded posts and associated media
# Pass custom count via: bun run seed:posts -- --count 25

# Seed Pages
bun run seed:pages           # Creates 10 fixture pages
bun run seed:pages:clean     # Removes seeded pages
# Pass custom count via: bun run seed:pages -- --count 5

# Seed Resume Documents
bun run seed:resume-documents        # Creates an older and a newer resume document (no PDFs)
bun run seed:resume-documents:clean  # Removes them
```

The same seed/clean logic (`src/lib/seed/`) is also available from the admin panel, where it runs as a queued job.

- Seeders are idempotent and match by slug.
- Article prose and layouts are deterministic per title using a seeded pseudo-random generator.
- Images are downloaded from `picsum.photos` and uploaded into Payload media.

---

## CI / CD & Deployment

Everything is built in CI; Docker images only `COPY` finished output (no package manager, installs or builds inside an image). Pull requests are gated by `lint-and-test.yml`, pushes are built and deployed by `build-and-deploy.yml`. Both use the composite action `.github/actions/setup` (Bun, Node.js 26, `bun install --frozen-lockfile`).

- **Pull requests to `main` / `develop`** (`lint-and-test.yml`, required by branch protection):
  1. **Lint**: `commitlint` over the PR's commits, `oxlint` + `oxfmt --check`, `syncpack`, a check that the committed generated files (`src/types/payload.ts`, the admin import map) match `bun run generate`, and `actionlint`.
  2. **Semgrep**: static security analysis with the `nodejs`, `typescript`, `react` and `secrets` rulesets. Accepted findings are marked in place with `// nosemgrep: <rule>` and a reason.
  3. **Unit Tests**: `vitest run --coverage`, with the coverage report uploaded as an artifact.
  4. **Build & Bundle Size**: `next build --webpack --experimental-build-mode=compile` with `.env.test` (no database needed), then `bun run bundle:check`. The per-route table goes into the job summary and the `@next/bundle-analyzer` reports are uploaded as the `bundle-analysis` artifact.
  5. **E2E**: currently disabled (the job is commented out in the workflow).
- **Pushes to `develop` / `main`** (`build-and-deploy.yml`, also runnable through `workflow_dispatch` on those two branches):
  1. **Bump version**: semver bump, tag and changelog via `semantic-release` (`release.config.mjs`), committed as a GitHub App so the push passes `main`'s ruleset. `main` cuts releases (`vX.Y.Z`, images also tagged `latest`), `develop` cuts release candidates (`vX.Y.Z-rc.N`, images also tagged `edge`). After a `main` release, `develop` is fast-forwarded to `main` when it has no commits of its own; otherwise it has to be brought up to date by hand, since `develop` only cuts release candidates while it contains every `main` release.
  2. **Deploy** (environment `Production` on `main`, `Development` on `develop`): connects to the tailnet, runs `bun run migrate` against the target database, runs one `next build --webpack` with that environment's values, builds Storybook, assembles `out/{web,worker,storybook}` (`scripts/assemble-images.mjs`), builds the COPY-only images (`app`, `worker`, `storybook` in `Dockerfile`) for `linux/amd64`, boot-checks each one as a real container (`/api/health` on 3000, `/health` on 3010, Storybook on 3020), pushes them to `ghcr.io/danielheene/website/*` and triggers the Dokploy redeploy webhooks. The lint and test jobs are not re-run here; the merged commit already passed them as PR checks.

Each push to `main`/`develop` builds and deploys against that environment's real secrets, so environment-specific values the browser needs (site URL, status page, Umami, the Iconify API) are ordinary `NEXT_PUBLIC_*` environment variables read via `process.env.NEXT_PUBLIC_*`.

---

## Git Hooks & Conventions

Lefthook (`lefthook.yml`) manages Git hooks, installed automatically during `bun install`:

- `pre-commit`: Runs `oxfmt` and `oxlint --fix` on staged files. When `package.json` is staged it also runs syncpack (`format` + `fix`) and `bun install`, re-staging `bun.lock`.
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
