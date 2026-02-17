# Personal Website - Daniel Heene

This repository contains the source code for my personal website: [daniel.heene.io](https://daniel.heene.io).

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **CMS**: [Payload CMS 3.x](https://payloadcms.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Cache/KV**: [Redis](https://redis.io/)
- **Storage**: S3-compatible storage (local Minio in development)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Analytics**: [Umami](https://umami.is/) (Optional)
- **Email**: [UseSend](https://usesend.com/) (Optional)

## Requirements

- **Node.js**: `^22.0.0`
- **pnpm**: `^10.0.0`
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
- `CRON_SECRET`: Secret for triggering cron tasks.
- `NEXT_PUBLIC_SERVER_URL`: The public URL of the server.
- `REDIS_URL`: Redis connection URL.
- `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`: S3-compatible storage configuration.
- `USESEND_API_KEY`, `USESEND_URL`, `USESEND_DEFAULT_FROM_ADDRESS`, `USESEND_DEFAULT_FROM_NAME` (optional): Email provider configuration.
- `UMAMI_HOST_URL`, `UMAMI_WEBSITE_ID` (optional): Analytics rewrite and site ID.

## Available Scripts

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm generate`: Runs `generate:types` and `generate:importmap` in parallel.
- `pnpm payload`: Wrapper for Payload CLI.
- `pnpm payload migrate`: Runs database migrations.
- `pnpm ci`: Sequence for CI/CD (migration + build).
- `pnpm lint`: Runs ESLint for code quality.

## Project Structure

```text
.
├── app/                  # Next.js App Router (Frontend and Payload routes)
├── src/                  # Application Source
│   ├── access/           # Payload Access Control
│   ├── blocks/           # Reusable Payload Blocks
│   ├── collections/      # Payload Collections (Media, Pages, Posts, etc.)
│   ├── components/       # React Components
│   ├── fields/           # Custom Payload Fields
│   ├── globals/          # Payload Globals (Settings, Navigation, etc.)
│   ├── migrations/       # Database Migrations
│   ├── styles/           # CSS and Tailwind Styles
│   └── utilities/        # Shared Utilities
├── public/               # Static Assets
├── tests/                # Unit and Integration Tests
├── docker-compose.yml    # Local Infrastructure
└── next.config.ts        # Next.js Configuration
```

## Entrypoints

- Next.js App Router under `app/` (served via `pnpm dev` / `pnpm start`).
- Payload CMS is configured in `src/payload.config.ts` and integrated via `withPayload` in `next.config.ts`.
- File uploads are handled by Payload collections with the S3 storage plugin configured in `src/payload.config.ts`.

## Testing

The project uses the built-in Node.js test runner.

- **Run all tests**: `node --test`
- **Target specific test**: `node --test path/to/file.test.js`

Tests are typically located in the `tests/` directory or co-located with source files using the `.test.js` extension.

## Features

- **Media Optimization**: Images are stored in S3 and automatically generate `alt` text and `blurDataURL` on upload using `sharp`.
- **SVG Optimization**: Optimize SVGs for logos using `svgo` in the admin UI. TODO: Confirm if any server-side sanitization endpoint is used.
- **Localization**: Full support for English (`en`) and German (`de`) with localized admin panel and content.
- **Modern Styling**: Powered by Tailwind CSS v4.

### Data Seeding (TODO)

- Previous docs referenced a `/api/seed` route, but it is not present in the current codebase.
- TODO: If seeding is needed, add a dedicated script or route and document usage here.

## CI / Deployment

- CI entrypoint: `pnpm ci` runs `payload migrate` then `next build`.
- TODO: Document hosting provider and production environment configuration (e.g., Docker, Vercel, Fly.io).

---

#### Legacy Code

The following code of my previous websites is no longer maintained, but a dump of their code bases can still be found under the following tags: [website-v2](https://github.com/danielheene/website/tree/homepage-v2) | [website-v1](https://github.com/danielheene/website/tree/homepage-v1).
