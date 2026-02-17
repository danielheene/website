### Project Development Guidelines

This document captures project-specific knowledge to accelerate local setup, testing, and ongoing development for this Next.js + Payload CMS codebase.

---

### Build and Configuration

- Tooling versions
  - Node: 22.x (enforced via `package.json#engines`)
  - pnpm: 10.x
  - TypeScript: 5.9
  - Next.js: 15
  - React: 19
  - Payload CMS: 3.x
  - Tailwind CSS: 4

- Environment variables
  - A minimal local setup requires copying `.env.example` to `.env.local` and filling secrets. In addition to entries shown in `.env.example`, the codebase references the following variables in `src/payload.config.ts` and `next.config.ts`:
    - `NEXT_PUBLIC_SERVER_URL` — Used for Payload CORS/CSRF and image remotePatterns.
    - `UMAMI_HOST_URL`, `UMAMI_WEBSITE_ID` — Optional analytics rewrite and public ID.
    - Email (UseSend): `USESEND_API_KEY`, `USESEND_URL`, `USESEND_DEFAULT_FROM_ADDRESS`, `USESEND_DEFAULT_FROM_NAME`.
    - Redis KV: `REDIS_URL`.
    - S3-compatible storage (local or cloud): `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` (default local fallback in code is `http://localhost:9000`).
    - Database: `DATABASE_URL` — MongoDB connection string (the app uses `@payloadcms/db-mongodb` via `mongooseAdapter`).
  - Note: The historical README mentions Postgres; the current config uses MongoDB.

- Local services via Docker
  - `docker-compose.yml` provisions:
    - MongoDB on `localhost:27017`
    - Redis on `localhost:6379`
    - An S3-compatible storage service on `localhost:9000` with a companion job to create the bucket via `minio/mc`. Requires `S3_*` variables in `.env.local`.
  - Typical bootstrap:
    - `cp .env.example .env.local` and set all secrets, including the above additional ones if you run all services locally.
    - `docker compose up -d` to start Mongo, Redis, and S3-compatible storage.
    - Optional: If you change collections/globals, run `pnpm payload migrate` to apply Payload migrations.

- Install, generate, build, run
  - Install: `pnpm install`
  - Generate artifacts:
    - `pnpm generate:types` to emit `src/payload-types.ts`
    - `pnpm generate:importmap` to enable admin import aliases
    - Or run both with `pnpm generate` (parallel)
  - Dev server: `pnpm dev` (alias of `next dev`)
  - Production build: `pnpm build`; start with `pnpm start`
  - CI script (reference): `pnpm ci` runs `payload migrate` then `next build`

- Image handling and storage
  - Images/videos/documents use the Payload S3 storage plugin. For local development the S3 endpoint defaults to `http://localhost:9000` if `S3_ENDPOINT` is not provided. Ensure the `create-bucket` job in `docker-compose.yml` can authenticate with your `S3_ACCESS_KEY`/`S3_SECRET_KEY` and create `S3_BUCKET`.

---

### Testing

This repo does not ship a preconfigured test framework like Jest/Vitest. The fastest zero-dependency path is the built-in Node test runner (Node ≥ 20, we use 22).

- One-off test run (verified)
  - We validated a passing run with Node’s test runner:
    - Created `tests/math.js` and `tests/math.test.js` with ESM modules.
    - Executed `node --test tests/math.test.js` and observed all tests passing.
  - Example test (ESM, Node runner):
    ```js
    // tests/math.js
    export function sum(a, b) { return a + b }
    export function average(arr) {
      if (!Array.isArray(arr) || arr.length === 0) throw new Error('arr must be a non-empty array')
      return arr.reduce((acc, n) => acc + n, 0) / arr.length
    }

    // tests/math.test.js
    import test from 'node:test'
    import assert from 'node:assert/strict'
    import { sum, average } from './math.js'

    test('sum adds positive integers', () => {
      assert.equal(sum(1, 2), 3)
    })

    test('average validation and value', () => {
      assert.equal(average([2, 4, 6]), 4)
      assert.throws(() => average([]))
    })
    ```
  - Run all tests:
    - `node --test` will discover `**/*.test.{js,mjs,cjs}` under the cwd (ESM supported because `"type": "module"`).
    - To target a specific file: `node --test path/to/file.test.js`

- Adding more tests
  - Place ESM test files under `tests/` or co-locate next to source files. Prefer `.test.js` suffix for discovery.
  - Tests can import JS/ESM directly. Importing TS requires a transpile step or a runner that understands TS.

- Testing TypeScript project code
  - Options if you need to import `.ts` directly in tests:
    - Add `tsx` (fast TS runner): `pnpm add -D tsx` and run `tsx --test`.
    - Or adopt Vitest/Jest and configure TS via `esbuild`, `ts-jest`, or `babel-jest`.
  - Keep CI lightweight if you only need a few unit tests: prefer Node runner with small ESM wrappers in `tests/` that import compiled JS or thin re-exports.

- E2E testing (optional)
  - The repo includes `playwright` runtime, but not `@playwright/test`. If you want Playwright Test:
    - `pnpm add -D @playwright/test`
    - `pnpm exec playwright install` (to fetch browsers)
    - Create `playwright.config.ts` and `e2e/*.spec.ts`, then run `pnpm exec playwright test`

---

### Additional Development Notes

- Payload CMS integration
  - Config at `src/payload.config.ts` wires blocks, collections, globals, the Mongo DB adapter, Redis KV, and the S3 storage plugin. Image processing uses `sharp`.
  - Admin import map is generated from `src/` and relies on path aliases like `@/components/...`; run `pnpm generate:importmap` after adding admin-facing components.
  - Localization has `en` and `de` with fallback, and admin time zone defaults to `Europe/Berlin`.

- Next.js configuration
  - `next.config.ts` wraps with `withPayload`. Images are locked to WebP output, SVGs are allowed inline (CSP is restricted). Rewrites proxy `/stats/*` to `UMAMI_HOST_URL` when set.
  - `serverExternalPackages` lists libraries that should stay external at server build time.

- Code style and linting
  - ESLint uses Next + Payload configs; Prettier is present. Keep import aliases consistent with tsconfig paths and Payload’s import map.
  - Tailwind v4 is enabled via PostCSS (`@tailwindcss/postcss`) with CSS co-located under `src/styles`. Prefer utility classes and existing CSS partials over adding new global styles.

- Migrations and types
  - After changing collections/globals, run `pnpm payload migrate` and re-generate types with `pnpm generate:types` to update `src/payload-types.ts`.

- Local S3 development tips
  - When using the local S3 service from `docker-compose.yml`, set:
    - `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
    - Optional: `S3_ENDPOINT=http://localhost:9000`, `S3_REGION=us-east-1`
  - The `create-bucket` service auto-creates the bucket and sets a public read policy.

---

### Verified commands (as of this note)

- Node test runner: `node --test tests/math.test.js` — passed (Node v22.14.0).
- General: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm payload migrate`, `pnpm generate`.

Note: Temporary demonstration test files used for verification were removed after documenting these steps to keep the repo clean.
