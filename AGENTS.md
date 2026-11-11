# AGENTS.md

Guidance for AI coding agents (and human contributors) working in this repository. Read this
before making changes — it documents the stack, conventions, known issues, and guardrails that
are not always obvious from the code alone.

## Project Overview

Personal website + blog + resume builder for [daniel.heene.io](https://daniel.heene.io), built on:

- **Next.js 16** (App Router, React 19) — `app/` contains both the public frontend
  (`app/(frontend)`) and the Payload admin panel (`app/(payload)`).
- **Payload CMS 3.x** — configured in `payload.config.ts`, content modeled in `src/collections/`,
  `src/globals/`, `src/blocks/`, `src/fields/`.
- **MongoDB** (via `@payloadcms/db-mongodb`) as the primary database.
- **Redis** — used as Payload's own KV store (`@payloadcms/kv-redis`, no TTL support — see
  `src/lib/redirects/redirectCache.ts` for the caching pattern to use instead when you need
  expiry) and via `src/lib/RedisHandler.ts`, a thin wrapper around the `redis` package that
  provides app-level `get`/`set`/`invalidate` (with real TTL) plus the pub/sub layer that powers
  Server-Sent Events (`app/(frontend)/api/sse/route.ts`).
- **S3-compatible storage** (`@payloadcms/storage-s3`, RustFS locally via Docker) for media.
- **Tailwind CSS 4** for styling, **Storybook** for component development.
- **Oxlint** + **Oxfmt** (the Oxc toolchain) for linting/formatting (not ESLint/Prettier/Biome).
- **Bun** as the package manager and script runner; Node.js still runs Next, Payload, the scripts
  and the tests.

See `README.md` for setup/run instructions; this file focuses on conventions and pitfalls.

## Build, Lint, and Test Commands

```bash
bun install              # install deps (Bun only — see packageManager in package.json)
bun run dev              # Next.js dev server via scripts/dev.mjs (--tunnel opens the Cloudflare Tunnel)
bun run dev:app          # plain `next dev`, without the tunnel wrapper
bun run dev:storybook    # Storybook on :6006 (not started by `bun run dev`)
bun run generate         # regenerate Next route types, Payload types + import map
bun run build            # production build (`next build --webpack`)
bun run typecheck        # tsc --noEmit
bun run analyze          # compile-only build + bundle analyzer reports + bundle budget check
bun run lint             # oxlint + oxfmt --check (does NOT auto-fix)
bun run lint:fix         # oxlint --fix + oxfmt (auto-fixes what it can)
bun run format           # oxfmt (formatting and import order only)
bun run test             # unit tests (Vitest)
bun run deps:lint        # syncpack: dependency version groups
bun run test:e2e         # Playwright E2E (needs docker compose up -d)
```

Environment variables come from **Doppler**, but no script wraps `doppler run`. `bun run load-env`
writes the active Doppler config to `.env.local`, which Next loads on its own, so every script
works unwrapped. Re-run it after changing anything in Doppler or switching configs — nothing
detects drift automatically, and `bun run load-env --check` reports it without writing. On the
deployment server Dokploy supplies the environment directly.

Always run `bun run generate` after adding/renaming a collection, global, field, or block — many
files import generated types from `src/types/payload.ts` and `@/types/collections`.

`bun run lint` fails only on errors; it prints pre-existing warnings (see "Known Issues" below).
Don't let those block your task, but do not introduce new lint errors or warnings, and prefer
fixing warnings in files you already touch.

`syncpack.config.mjs` pins `playwright` and `@playwright/*` to one version with `pinVersion`; to
upgrade Playwright, change that value and run `bun run deps:fix`. `scripts/e2e-docker.sh` derives
its image tag from the installed `@playwright/test`. The `sameRange` groups in that file (Payload,
Storybook, Vitest, React) do not catch mismatches between different packages in this
single-package repo: syncpack only compares one dependency across packages.

Always spell scripts `bun run <script>`: bare `bun test` and `bun build` run Bun's own test runner
and bundler, not the package scripts.

Commits go through Lefthook (`lefthook.yml`): `pre-commit` runs `oxfmt` then `oxlint --fix` on
staged files (re-staging the fixes) and, when `package.json` is staged, `syncpack format` + `fix`
followed by `bun install` (re-staging `bun.lock`); `commit-msg` enforces Conventional
Commits. Use the existing types (`feat`, `fix`, `chore`, `refactor`, `docs`,
`test`, `build`, `ci`, `perf`, `style`, `revert`); scopes are unrestricted.

## Code Style (enforced by `oxfmt.config.ts` / `oxlint.config.ts` / `.editorconfig`)

- 2-space indentation, LF line endings, 100-char line width.
- Single quotes for JS/TS, double quotes in JSX attributes.
- **No semicolons** (`semi: false`, ASI style) — do not add trailing semicolons.
- Trailing commas everywhere (`trailingComma: "all"`).
- Import order is sorted by oxfmt's `sortImports`, in this group order:
  1. Node/Bun builtins
  2. `react*` / `next*` / `payload*` / `@payloadcms/**`
  3. other npm packages
  4. `@/**` path-alias imports
  5. relative imports
  6. style imports
  Run `bun run format` (or your editor's Oxc integration) instead of manually sorting imports.
- `tsconfig.json` has `"strict": false` — do not rely on the compiler to catch null/undefined
  bugs; be explicit and defensive, especially in Payload hooks and access-control functions.
- `import type` vs. value imports is **not** enforced (`typescript/consistent-type-imports` is off) — either style is
  accepted, but prefer `import type` for type-only imports for clarity when touching a file.

### Conventions to follow (not currently enforced by tooling — please don't add new inconsistencies)

- **Enum-like access**: prefer dot notation (`CollectionSlug.Pages`) over bracket notation
  (`CollectionSlug['Pages']`). Bracket notation is widespread in older code; don't add more of it.
- **Exports**: prefer named exports (`export const X = ...`) over default exports for components;
  this is the dominant pattern in `src/components/`.
- **Barrel files**: existing `index.ts`/`index.tsx` files use either `export * from './X'` or
  `export { X } from './X'` — match whichever pattern already exists in the folder you're editing.
- **Hooks vs. utils naming**: everything lives under `src/lib/` now (see Architecture Notes), but
  the two hook flavors stay visually distinct — React hooks in `src/lib/hooks/` are camelCase named
  after the hook (`useIsMobile.ts`), Payload lifecycle hooks in `src/lib/payloadHooks/` are
  camelCase named after what they do (`generateChecksum.ts`). Plain utils use camelCase
  (`generateSlug.ts`). `src/components/hooks/` is an older second home for React hooks (one of
  them kebab-case, `use-server-sent-events.ts`); put new hooks in `src/lib/hooks/`.
- **Fields**: folder name has no suffix (`src/fields/Slug/`), but the exported factory function
  has an `XField` suffix (`SlugField`, `TitleField`). Keep this pattern for new fields.
- **Globals**: naming is currently inconsistent (`SiteSettings`, `SettingsGlobalUser`,
  `PDFGeneratorSettings`). When adding a new global, prefer the `XSettings` suffix pattern.
- Avoid leftover `console.log` debug statements and large commented-out code blocks — several
  exist in the codebase (see Known Issues) but should not be added to.
- Avoid `any`; if you must use it, add an `// oxlint-disable-next-line typescript/no-explicit-any -- <reason>` comment with a real
  justification (see
  `src/lib/resolveRelation.ts` for a good example), not a placeholder like `<TODO>`.
- **Comment style**: a single non-obvious fact anchored to one specific line stays a plain `//`
  right above that line — don't promote it to JSDoc just because it's explanatory. Reserve a
  leading `/** ... */` block for when the explanation genuinely spans multiple lines or applies to
  the whole function/conditional block, not a single statement. Either way, keep it short and
  precise: state the fact (the why/constraint/mechanism) and stop — no restating what the code
  already says, no narrative padding.

## Architecture Notes

- **Access control** (`src/lib/access/`): small, composable `Access` functions (`anyone`,
  `authenticated`, `authenticatedOrPublished`, `forbidden`). There is **no role/permission system**
  — `authenticated` only checks "is any Payload user logged in". Treat every Payload user as
  fully trusted (single-admin trust model) unless you introduce roles explicitly.
  Read access follows the drafts setting: every schema with `versions.drafts` uses
  `authenticatedOrPublished`, and nothing without drafts may (there is no `_status` to filter on).
  `src/lib/access/schemaAccess.test.ts` enforces this. Local-API reads default to
  `overrideAccess: true`, so fetchers that skip access must filter `_status: 'published'` themselves.
- **`src/lib/` layout**: domain subfolders group related code — `access/` (Payload `Access`
  functions), `hooks/` (React hooks), `payloadHooks/` (Payload collection/global lifecycle hooks —
  distinct from `hooks/`, don't conflate the two), `anthropic/` and `mapbox/` (external API
  clients, same shape as `unsplash/`), plus `actions/`, `fetchers/`, `date/`, `i18n/`, `jsonLd/`,
  `blog/`, `lexical/`, `migrations/`, `redirects/`, `references/`, `seed/`, `shiki/`, `sse/`,
  `umami/`, `unsplash/`. A new external API client or hook goes in the matching subfolder; a
  handful of genuinely standalone utilities stay flat at the top of `src/lib/`.
- **Collections/Blocks/Fields/Globals** are factory-function based — most fields (e.g.
  `TitleField()`, `SlugField()`) accept an `overrides` object rather than being edited in place.
  Reuse existing field factories instead of inlining raw Payload field configs when one exists.
- **Redis** (`src/lib/RedisHandler.ts`) exposes `get`/`set`/`invalidate` (cache) and
  `publish`/`subscribe` (pub/sub, used by the SSE route). Keys/channels are plain strings — no
  namespacing helper exists yet; be consistent with existing key formats when adding new ones.
- **Revalidation**: Payload collection hooks call `revalidate*` helpers (e.g.
  `src/collections/Pages/hooks/revalidatePage.ts`) to invalidate Next.js cache tags after content
  changes — follow this pattern for any new collection that's rendered on the frontend.
- **Blog listings** (`/blog`, `/blog/<topic>`) paginate and sort via `?page=` / `?sort=`, read
  only inside the grid's Suspense boundary so the shell still prerenders. `src/lib/blog/listing.ts`
  owns the params (sort options, parsing, href building); `proxy.ts` uses it to redirect
  non-canonical forms (legacy `/page/<n>` segments, `page=1`, unknown sorts) and to mark non-default
  sorts `noindex`. The RSS feed (`/blog/feed.xml`) and `app/(frontend)/sitemap.ts` cache under the `posts` tag,
  which `revalidateBlogPost` invalidates.
- **Dashboard widgets** (`src/widgets/`): async server components registered in `payload.config.ts`
  under `admin.dashboard.widgets`. Each widget has a `slug`, `Component` path, and optional
  `minWidth`/`maxWidth`. Run `bun run generate` after adding a new widget so its slug is included in
  the inferred `defaultLayout` union type. Client-side widget parts live alongside as
  `*.client.tsx` files and call server actions from `src/lib/actions/` for mutations.
- **Server actions** (`src/lib/actions/`): `'use server'` functions for admin mutations (job
  rescheduling, cancellation, etc.). Use `useTransition` on the client side when calling them.
- **Claude calls** (`src/lib/anthropic/`): every fetcher goes through `generateAnthropicText()`,
  which owns the model IDs (`ANTHROPIC_MODEL`, Haiku 5.5; `ANTHROPIC_TRANSLATION_MODEL`, Sonnet
  5.5, for résumé translation only), effort, timeout and output limit, and throws when
  the answer was cut off or declined rather than returning partial text. Give the model the
  content itself (wrapped in tags), never a URL: it cannot fetch. These modules are plain server
  modules, not `'use server'` files, and the worker imports them too, so `server-only` (which
  throws outside Next) is not an option. Callers that run inside a save (`generateAlt`) catch the
  error so a Claude outage never blocks the write.
- **Plugins** (`src/plugins/`): `redirects` and `references` are local Payload plugins that add the
  `Redirects` and `References` collections; `bun run refs:backfill` rebuilds the reference index.
- **Stories** live in `.storybook/components/*.stories.tsx`, not next to the components; the
  design-foundation and shader docs are MDX under `.storybook/foundations/` and
  `.storybook/shaders/`.
- **`app/global-error.tsx`, `app/robots.ts` and `app/manifest.ts`** have to stay at the root of
  `app/`: inside a route group Next silently ignores all three (no error, the URL just 404s).
  `sitemap.ts` is the exception and works from `app/(frontend)/`. `global-error.tsx` replaces the
  root layout, so it imports the stylesheet and fonts itself.
- **Bundle budget**: `scripts/check-bundle-size.mjs` reports the gzipped first-load JavaScript of
  every public route and fails above the limit set in its `BUDGETS`. It is a local check, not a
  CI job: `bun run analyze` builds, runs it and writes the `@next/bundle-analyzer` reports to
  `.next/analyze/`. The 170 kB target is a warning; lower the enforced limit when
  routes shrink, and give a reason in the commit when raising it.
- **Two `llms.txt`**: the root `llms.txt` describes this repository for coding agents and is
  maintained by hand; `app/llms.txt/route.ts` serves the site's public `/llms.txt` from published
  content.

## Environment-specific values

Each push to `main` or `develop` runs its own `next build` against that environment's real secrets
(see `build-and-deploy.yml`) and ships straight into that environment's container — there is no
single compile deployed to several environments. Values the browser needs (site URL, status page,
Umami, the Iconify API) are therefore ordinary `NEXT_PUBLIC_*` environment variables, read via a
plain `process.env.NEXT_PUBLIC_*` reference; server-only values (e.g. `SERVER_URL`) are read the
same way without the prefix. `src/types/environment.ts` is the schema for the full set.

## Job handlers (`src/jobs-queue/`)

Task and workflow **configs** (`tasks/`, `workflows/`) are part of the Payload config and therefore of
the Next.js bundle; their **handlers** are not. Each handler lives in `handlers/<name>.ts` and the
config points at it with `handler: handlerPath('<name>.ts')` (Payload loads string handlers at run
time). A handler module must use `req.payload` instead of `getPayload({ config })`. The web process
only enqueues jobs (never `runByID`); the worker
(`scripts/start-worker.mjs`, polling every 5 seconds) runs them. The app process runs jobs itself
only when `PAYLOAD_JOBS_ENABLE_APP_WORKERS=true` (default `false`).

## Security Guardrails (found during review — respect these when touching related code)

- **SSE / Redis channels** (`app/(frontend)/api/sse/route.ts`): the `channel` query param is
  matched against an allowlist (`src/lib/sse/channels.ts`) before `subscribe()` ever sees it, and
  per-job channels (`bilingual-translate:`, `seed-task:`, `scheduled-job:`, `resume-generate:`)
  additionally require a signed-in `payload.auth()` session. The public channels in `SSE_CHANNELS`
  (e.g. `service-status`) stay unauthenticated by design. If you add a new channel that carries non-public data, add it to the
  authenticated branch rather than `SSE_CHANNELS` — see the route's own comments for the exact
  split.
- **Raw SVG rendering**: `src/collections/ResumeCustomers` stores raw SVG markup rendered via
  `dangerouslySetInnerHTML` in `src/components/LogoCarousel/LogoCarousel.tsx`. It is sanitized
  server-side on write by a `beforeChange` hook (`src/lib/sanitizeSvg.ts`, DOMPurify with an
  explicit tag/attribute deny-list) — the admin UI's client-side `svgo` pass is a bypassable
  optimizer, not the security boundary. Route any other raw-HTML/SVG field through the same
  `sanitizeSvg` helper (or an equivalent real, server-side sanitizer) before it's ever rendered
  unescaped.
- **`CRON_SECRET`** is declared in `src/types/environment.ts` but not enforced anywhere — there
  is no cron route yet. If you add one, validate this secret explicitly (ideally with
  `crypto.timingSafeEqual`, not `!==`).
- Never commit real secrets. Configuration lives in Doppler, selected per clone with
  `doppler setup` and written to a gitignored `.env.local` by `bun run load-env`;
  `src/types/environment.ts` declares the schema and is the only place the full set of
  variables is enumerated. The one committed env file is `.env.test`, which holds dummy,
  format-valid values for E2E runs.
- **Semgrep** runs on every PR (`lint-and-test.yml`, rulesets `nodejs`, `typescript`, `react`,
  `secrets`) and fails the check on any finding. A reviewed, accepted finding is marked on its own
  line with `// nosemgrep: <rule> -- <reason>` (see `src/components/LogoCarousel/LogoCarousel.tsx`).
- New authenticated API routes and server actions need a real `payload.auth()` session check, as
  in the SSE route's per-job branch and `src/lib/actions/enqueueBilingualTranslation.ts` — a Server
  Action is its own reachable endpoint, whichever page renders the button. Inline `'use server'`
  functions in admin field components call `requireSession()` (`src/lib/actions/requireSession.ts`)
  first. A server-side fetch of an uploaded file goes through `resolveOwnMediaUrl()`
  (`src/lib/resolveOwnMediaUrl.ts`), which rejects any other origin. Compare shared secrets
  with `crypto.timingSafeEqual` and accept only same-site relative redirect targets, as
  `app/(frontend)/api/preview/route.ts` does (that route checks `PREVIEW_SECRET` only, no session).
- **Production detection**: `NODE_ENV` cannot tell environments apart (every deployed image runs
  `production`). Use `isProductionHost()` (`src/lib/isProductionHost.ts`), which compares
  `SERVER_HOST` with `PRODUCTION_HOST` and reads an unset value as "not production". Outside
  production `app/robots.ts` disallows all crawlers and `src/pdf/index.tsx` stamps
  PDFs as DRAFT.

## Known Issues / Tech Debt (baseline, not blocking, but don't add more)

- `bun run lint` passes but reports pre-existing warnings, mostly `no-explicit-any`, `no-unused-vars`,
  `no-img-element`, the React Compiler rules (`set-state-in-effect`, `purity`, `refs`), and the
  backlog of the `tailwindcss/*` and vendored `anti-slop/*` rules (`tools/oxlint/anti-slop/`), which
  `oxlint.config.ts` keeps at `warn` until they are cleaned up.
- A leftover debug `console.log` (`src/components/VideoMedia/VideoMedia.tsx`) and commented-out dead
  code (e.g. `src/collections/ResumeSkills/index.ts`,
  `src/components/ResumeRenderer/sections/Hero/Hero.tsx`) exist and should be cleaned up
  opportunistically.
- `package.json` `overrides` pins `pdfjs-dist` to `5.4.296` because `patches/pdfjs-dist@5.4.296.patch`
  targets that exact version (it gives the fake-worker import a default `workerSrc`, see
  vercel/next.js#65406). Bumping `pdfjs-dist` means regenerating the patch.
- The E2E job in `lint-and-test.yml` is commented out, so Playwright only runs locally.
- No app-level rate limiting exists on public API routes.
- No shared logging abstraction — error logging is ad hoc `console.error` calls.

## Testing

- Unit tests run via **Vitest** (`bun run test`), E2E tests via **Playwright** (`bun run test:e2e`) —
  see `README.md` for prerequisites. Co-locate unit tests as `*.test.ts` next to the code under
  test; E2E specs live in `e2e/*.spec.ts` (never `*.spec.ts` under `src/`).
- Shared mocks live in `vitest.setup.ts`: `payload` (`getPayload` stubbed via `importOriginal`
  spread — never replace the whole module, value imports from it are used at runtime),
  `next/cache`, `server-only` and `redis`. `tailwind-merge`, `date-fns`, `slugify`, `pupa` and
  `neotraverse` are intentionally NOT mocked — their real behavior is the contract under test.
- `TZ=UTC` is forced in `vitest.setup.ts` and date tests depend on it. Anything touching
  `Interval.setToX()` or `getLocalISOString` needs `vi.useFakeTimers()` + `vi.setSystemTime()`.
  Use `vi.stubEnv()` for env-dependent code (`SERVER_URL`, `SERVER_HOST`, `PRODUCTION_HOST`, `PREVIEW_SECRET`).
- There is no CI-enforced coverage threshold; when fixing a bug, add a regression test near
  existing tests for that module if a suitable test file already exists.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
