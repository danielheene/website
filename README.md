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

Copy the example environment file and fill in the required secrets:

```bash
cp .env.example .env.local
```

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

The project uses several environment variables for configuration. See `.env.example` for a complete list of required variables.

- `DATABASE_URL`: MongoDB connection string.
- `PAYLOAD_SECRET`: Secret used to encrypt Payload JWT tokens.
- `PREVIEW_SECRET`: Secret used for Next.js/Payload draft previews.
- `CRON_SECRET`: Reserved for triggering cron tasks. Declared in the schema but not yet enforced by any route (see `AGENTS.md`).
- `SERVER_URL`: The public URL of the server.
- `REDIS_URL`: Redis connection URL.
- `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`: S3-compatible storage configuration.
- `USESEND_API_KEY`, `USESEND_URL`, `USESEND_DEFAULT_FROM_ADDRESS`, `USESEND_DEFAULT_FROM_NAME` (optional): Email provider configuration.
- `NEXT_PUBLIC_UMAMI_URL`, `UMAMI_WEBSITE_ID` (optional): Analytics rewrite and site ID.

## Available Scripts

- `pnpm dev`: Starts the Next.js development server (and Storybook, in parallel).
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm generate`: Runs `generate:types` and `generate:importmap` in parallel.
- `pnpm payload`: Wrapper for Payload CLI.
- `pnpm payload migrate`: Runs database migrations.
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

- CI entrypoint: `pnpm ci` runs `payload migrate` then `next build`.
- TODO: Document hosting provider and production environment configuration (e.g., Docker, Vercel, Fly.io).

## Code Quality & Security Notes

- Linting/formatting is enforced by [Biome](https://biomejs.dev/) (`biome.json`), not ESLint/Prettier — see `AGENTS.md` for the full style conventions.
- `pnpm lint` does not currently pass cleanly on `main` (pre-existing formatting and lint diagnostics); avoid introducing new issues when touching a file.
- See [`AGENTS.md`](./AGENTS.md) for a summary of known security guardrails (open `queryPresets` access, unauthenticated SSE channel subscription, unsanitized raw SVG rendering, unused `CRON_SECRET`) to keep in mind when working in related areas.

---

#### Legacy Code

The following code of my previous websites is no longer maintained, but a dump of their code bases can still be found under the following tags: [website-v2](https://github.com/danielheene/website/tree/homepage-v2) | [website-v1](https://github.com/danielheene/website/tree/homepage-v1).
