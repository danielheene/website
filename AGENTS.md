# AGENTS.md

Guidance for AI coding agents (and human contributors) working in this repository. Read this
before making changes — it documents the stack, conventions, known issues, and guardrails that
are not always obvious from the code alone.

## Project Overview

Personal website + blog + resume builder for [daniel.heene.io](https://daniel.heene.io), built on:

- **Next.js 16** (App Router, React 19) — two apps in this monorepo:
  - `apps/backend` — the Payload CMS 3.x app. Hosts the admin panel
    (`app/(payload)`), the REST API (`app/(payload)/api`), the job worker and the
    PDF generation. Content is modeled in `apps/backend/src/collections/`, `apps/backend/src/globals/`,
    `apps/backend/src/blocks/`, `apps/backend/src/fields/`.
  - `apps/frontend` — the public site. Renders pages, blog and resume from the
    backend's REST API over HTTP (`apps/frontend/src/lib/payloadClient.ts`).
- **`apps/storybook`** — the component workbench, its own app with its own
  Dockerfile. Its config lives at the app root (`main.ts`, `preview.tsx`), so
  the Storybook commands pass `--config-dir .`. It renders the components from
  `packages/components`.
- **`packages/`** — shared code the apps import:
  - `packages/types` — generated Payload types plus hand-written shared types.
    Everything shared lives here (`@website/types/collections`, `/payload`,
    `/admin-panel`, …). The only type module that stays per-app is
    `src/types/environment.ts` — the backend and frontend validate different
    environment variable sets.
  - `packages/styles` — CSS partials only: the Tailwind theme
    (`theme/_*.css`) and the Payload admin overrides (`payload/_*.css`).
    The stylesheet *entry points* live with the apps that own them
    (`apps/frontend/frontend.css`, `apps/backend/backend.css`,
    `apps/storybook/storybook.css`) — each one imports the shared theme
    and adds its own `@source` roots. See "Tailwind CSS" below.
  - `packages/components` — framework-agnostic React components.
  - `packages/lib` — framework-level utilities shared by both apps
    (`@website/lib/…`): date/interval maths, i18n reduction, JSON-LD generators,
    blog listing/RSS helpers, shiki highlighting, SEO metadata, the Redis
    wrapper, the Umami tracker and the Payload-free link helpers. Modules that
    need app-specific behaviour (a `getPayload` call versus an HTTP client)
    stay per app under `src/lib/`.
  - `packages/app-components` — the site-level React components both apps
    render (`@website/app-components/…`): hero media, article sidebar,
    navigation, section containers, icons, media players and so on. Components
    that read app-local data (`Footer`, `Header`, `ResumeNewerVersionsChecker`)
    stay per app under `src/components/`.
  - `packages/font-pp-frama`, `packages/font-pp-frama-text`,
    `packages/font-pp-supply-mono`, `packages/font-pp-supply-sans` — one
    package per font family. Each ships the font files plus four entry points:
    `/next` (the `next/font/local` config), `/css` (plain `@font-face`
    stylesheet), `/pdf` (the `@react-pdf/renderer` registration) and `/assets`
    (the file manifest with resolved paths).
- **MongoDB** (via `@payloadcms/db-mongodb`) as the primary database.
- **Redis** — used as Payload's own KV store (`@payloadcms/kv-redis`, no TTL support — see
  `packages/lib/src/redirects/redirectCache.ts` for the caching pattern to use instead when you need
  expiry) and via `packages/lib/src/RedisHandler.ts`, a thin wrapper around the `redis` package that
  provides app-level `get`/`set`/`invalidate` (with real TTL) plus the pub/sub layer that powers
  Server-Sent Events (`apps/frontend/app/(frontend)/api/sse/route.ts`).
- **S3-compatible storage** (`@payloadcms/storage-s3`, RustFS locally via Docker) for media.
- **Tailwind CSS 4** for styling, **Storybook** for component development.
- **Oxlint** + **Oxfmt** (the Oxc toolchain) for linting/formatting (not ESLint/Prettier/Biome).
- **Bun** as the package manager and script runner; Node.js still runs Next, Payload, the scripts
  and the tests.

### The backend/frontend boundary

The frontend never imports the backend's modules and vice versa — the two apps
talk over HTTP only:

- **Frontend → backend**: `apps/frontend/src/lib/payloadClient.ts` issues
  authenticated REST calls (`users API-Key <key>`) against
  `PAYLOAD_API_URL`. Never import `payload`/`@payload-config` from frontend
  code, and never import a backend collection into a frontend component.
- **Backend → frontend**: the backend cannot call `revalidateTag()` on the
  frontend's cache, so `apps/backend/src/lib/payloadHooks/revalidate.ts`
  (`revalidateCollectionChange`) POSTs the affected cache tags to the
  frontend's `/api/revalidate` route, authenticated with `REVALIDATE_SECRET`.
  Collection hooks do both: local `next/cache` invalidation *and* the
  cross-app call.

Shared code belongs in `packages/`, not duplicated between the apps. When a
module needs app-specific behaviour (a `getPayload` call versus an HTTP
client), it is duplicated per app rather than abstracted behind an interface.

The two shared runtime packages are:

- **`packages/lib`** (`@website/lib/…`) — pure/framework-level modules both
  apps need. No Payload and no app-local imports: anything that has to reach
  for `getPayload`, the HTTP client or app-local components stays in the app's
  own `src/lib/`.
- **`packages/app-components`** (`@website/app-components/…`) — the site-level
  React components both apps render. A component that reads app-local data
  (site settings, resume documents) cannot live here and stays per app under
  `src/components/`.

Both packages expose subpath exports, so imports read
`@website/lib/blog/rss` and `@website/app-components/HeroMedia` rather than a
single barrel. Each app's tsconfig maps both prefixes onto the package's
`src/`, and each app's `vitest.config.ts` mirrors that mapping in Vite.

See `README.md` for setup/run instructions; this file focuses on conventions and pitfalls.

## Build, Lint, and Test Commands

```bash
bun install              # install deps (Bun only — see packageManager in package.json)
bun run dev              # every app's dev server, in Turborepo's TUI
bun run dev:backend      # Payload backend only (port 3100)
bun run dev:frontend     # public frontend only (port 3000)
bun run dev:tunnel       # Cloudflare tunnel + every dev server
bun run generate         # regenerate Payload types + import map (run after changing collections/fields)
bun run build            # production build of both apps
bun run build:backend    # backend only
bun run build:frontend   # frontend only
bun run lint             # oxlint + oxfmt --check in both apps (does NOT auto-fix)
bun run lint:fix         # oxlint --fix + oxfmt (auto-fixes what it can)
bun run format           # oxfmt (formatting and import order only)
bun run test             # unit tests (Vitest) in both apps
bun run typecheck        # tsc --noEmit in both apps
bun run deps:lint        # syncpack: dependency version groups
bun run test:e2e         # Playwright E2E (needs docker compose up -d)
```

**Turborepo** owns the cross-workspace scripts. `turbo.json` declares the
task graph; the root scripts only name the task and the real execution always
happens in the workspace that owns it:

- `bun run build` / `lint` / `typecheck` / `test` / `format` run the task in
  every app that defines it, in parallel, with a shared cache.
- `bun run build:backend` (and the `lint:frontend`, `test:backend`, … variants)
  are just `turbo run <task> --filter=@website/<app>` — the root has no
  per-app script of its own.
- `bun run dev` runs every app's dev server in Turborepo's TUI. The backend
  listens on `:3100` and the frontend on `:3000` (the frontend proxies `/api/*`
  to `PAYLOAD_API_URL`), so the two do not collide.
- The CMS commands (`migrate`, `generate`, `seed:*`, `links:migrate`,
  `refs:backfill`) belong to the backend and are forwarded to it — they have
  no cross-workspace form. Extra arguments forward through the delegation, so
  `bun run seed:posts -- --count 2` still reaches the seed script.

Environment variables come from **Doppler**, but no script wraps `doppler run`. `bun run load-env`
writes the active Doppler config to `.env.local`, which Next loads on its own, so every script
works unwrapped. Re-run it after changing anything in Doppler or switching configs — nothing
detects drift automatically, and `bun run load-env --check` reports it without writing. On the
deployment server Dokploy supplies the environment directly.

Standalone scripts (`scripts/*.ts` under `apps/backend`) do **not** load
`.env.local` — Next does that automatically for its own commands, but a script
run through `bun run` needs the environment exported first (`set -a && . ../../.env.local && set +a`).

Always run `bun run generate` after adding/renaming a collection, global, field, or block — many
files import generated types from `packages/types/src/payload.ts` and `@/types/collections`.

Each environment builds with a single `next build` against its own real values (no separate
compile/finalize split) — see "Environment variables" below. `lint-and-test.yml`'s `e2e` job runs
this build against `.env.test` as part of PR checks; `build-and-deploy.yml`'s `deploy` job runs it
again, separately, against that environment's real secrets, then containerizes, boot-checks, and
pushes the result. Each app has its own Dockerfile under `apps/<app>/` — `apps/backend` (targets
`app` and `worker`), `apps/frontend`, `apps/storybook`. Dependencies are
installed *inside* the image, not copied from the host: native modules
(esbuild, sharp, the SWC binaries) are platform specific, so an install done
on macOS would not run on the Linux image.

`bun run lint` fails only on errors; it prints pre-existing warnings (see "Known Issues" below).

### Where dependencies live

The root `package.json` holds only the **repo-wide tooling**: the linters and
formatters (`oxlint`, `oxfmt`, `oxlint-tailwindcss`), the test runner and its
helpers (`vitest`, `@testing-library/*`, `playwright`), the code-management
tooling (`lefthook`, `commitlint`, `semantic-release`, `syncpack`) and the
build orchestrator (`turbo`). Everything else is declared by the workspace that
actually imports it, so each app and package carries its own manifest and
`bun install` resolves them per workspace.

Two consequences worth knowing:

- **Adding an import means adding the dependency to that workspace's
  `package.json`**, not the root's. A dependency that only exists at the root
  still resolves at the top level under Bun's hoisting, so the mistake shows up
  as a broken Docker build (`bun install --frozen-lockfile` inside the image)
  rather than as a local failure.
- **The Dockerfiles copy an explicit file list.** A new root-level file in an
  app (a stylesheet entry point, a `postcss.config.mjs`) has to be added to that
  app's `COPY` lines, or it will be missing from the image.
Don't let those block your task, but do not introduce new lint errors or warnings, and prefer
fixing warnings in files you already touch.

Always spell scripts `bun run <script>`: bare `bun test` and `bun build` run Bun's own test runner
and bundler, not the package scripts.

### The Cloudflare tunnel

The tunnel is a root-level concern: `scripts/tunnel.mjs` starts
`wrangler tunnel run` and keeps it in the foreground. `bun run tunnel` runs
just the tunnel; `bun run dev:tunnel` runs it alongside every dev server (and
exports `SERVER_HOST`/`SERVER_URL` from the tunnel's own values, so Next's
banner, generated links and redirects point at the public URL).

Neither app's `next.config.ts` spawns a tunnel any more, and neither app's
`scripts/dev.mjs` knows about the `--tunnel` flag — both are plain
`next dev` wrappers now. `wrangler` is a root devDependency for that reason.

Commits go through Lefthook (`lefthook.yml`): `pre-commit` runs `oxfmt` then `oxlint --fix` on
staged files (re-staging the fixes), `commit-msg` enforces Conventional
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
  this is the dominant pattern in `apps/backend/src/components/`.
- **Barrel files**: existing `index.ts`/`index.tsx` files use either `export * from './X'` or
  `export { X } from './X'` — match whichever pattern already exists in the folder you're editing.
- **Hooks vs. utils naming**: everything lives under `apps/backend/src/lib/` now (see Architecture Notes), but
  the two hook flavors stay visually distinct — React hooks in `apps/backend/src/lib/hooks/` are camelCase named
  after the hook (`useIsMobile.ts`), Payload lifecycle hooks in `apps/backend/src/lib/payloadHooks/` are
  camelCase named after what they do (`generateChecksum.ts`). Plain utils use camelCase
  (`generateSlug.ts`).
- **Fields**: folder name has no suffix (`apps/backend/src/fields/Slug/`), but the exported factory function
  has an `XField` suffix (`SlugField`, `TitleField`). Keep this pattern for new fields.
- **Globals**: naming is currently inconsistent (`SiteSettings`, `SettingsGlobalUser`,
  `PDFGeneratorSettings`). When adding a new global, prefer the `XSettings` suffix pattern.
- Avoid leftover `console.log` debug statements and large commented-out code blocks — several
  exist in the codebase (see Known Issues) but should not be added to.
- Avoid `any`; if you must use it, add an `// oxlint-disable-next-line typescript/no-explicit-any -- <reason>` comment with a real
  justification (see
  `apps/backend/src/lib/resolveRelation.ts` for a good example), not a placeholder like `<TODO>`.
- **Comment style**: a single non-obvious fact anchored to one specific line stays a plain `//`
  right above that line — don't promote it to JSDoc just because it's explanatory. Reserve a
  leading `/** ... */` block for when the explanation genuinely spans multiple lines or applies to
  the whole function/conditional block, not a single statement. Either way, keep it short and
  precise: state the fact (the why/constraint/mechanism) and stop — no restating what the code
  already says, no narrative padding.

## Architecture Notes

- **Access control** (`apps/backend/src/lib/access/`): small, composable `Access` functions (`anyone`,
  `authenticated`, `authenticatedOrPublished`, `forbidden`). There is **no role/permission system**
  — `authenticated` only checks "is any Payload user logged in". Treat every Payload user as
  fully trusted (single-admin trust model) unless you introduce roles explicitly.
  Read access follows the drafts setting: every schema with `versions.drafts` uses
  `authenticatedOrPublished`, and nothing without drafts may (there is no `_status` to filter on).
  `apps/backend/src/lib/access/schemaAccess.test.ts` enforces this. Local-API reads default to
  `overrideAccess: true`, so fetchers that skip access must filter `_status: 'published'` themselves.
- **`apps/backend/src/lib/` layout**: domain subfolders group related code — `access/` (Payload `Access`
  functions), `hooks/` (React hooks), `payloadHooks/` (Payload collection/global lifecycle hooks —
  distinct from `hooks/`, don't conflate the two), `anthropic/` and `mapbox/` (external API
  clients, same shape as `unsplash/`), plus `actions/`, `fetchers/`, `date/`, `i18n/`, `jsonLd/`,
  `redirects/`, `references/`, `seed/`, `sentry/`, `shiki/`, `sse/`, `umami/`, `unsplash/`. A new
  external API client or hook goes in the matching subfolder; a handful of genuinely standalone
  utilities stay flat at the top of `apps/backend/src/lib/`.
- **Collections/Blocks/Fields/Globals** are factory-function based — most fields (e.g.
  `TitleField()`, `SlugField()`) accept an `overrides` object rather than being edited in place.
  Reuse existing field factories instead of inlining raw Payload field configs when one exists.
- **Redis** (`apps/backend/src/lib/RedisHandler.ts`) exposes `get`/`set`/`invalidate` (cache) and
  `publish`/`subscribe` (pub/sub, used by the SSE route). Keys/channels are plain strings — no
  namespacing helper exists yet; be consistent with existing key formats when adding new ones.
- **Revalidation**: Payload collection hooks call `revalidate*` helpers (e.g.
  `apps/backend/src/collections/Pages/hooks/revalidatePage.ts`) to invalidate Next.js cache tags after content
  changes — follow this pattern for any new collection that's rendered on the frontend.
- **Blog listings** (`/blog`, `/blog/<topic>`) paginate and sort via `?page=` / `?sort=`, read
  only inside the grid's Suspense boundary so the shell still prerenders. `apps/frontend/src/lib/blog/listing.ts`
  owns the params (sort options, parsing, href building); `apps/frontend/proxy.ts` uses it to redirect
  non-canonical forms (legacy `/page/<n>` segments, `page=1`, unknown sorts) and to mark non-default
  sorts `noindex`. The RSS feed (`/blog/feed.xml`) and `apps/frontend/app/sitemap.ts` cache under the `posts` tag,
  which `revalidateBlogPost` invalidates.
- **Dashboard widgets** (`apps/backend/src/widgets/`): async server components registered in `apps/backend/payload.config.ts`
  under `admin.dashboard.widgets`. Each widget has a `slug`, `Component` path, and optional
  `minWidth`/`maxWidth`. Run `bun run generate` after adding a new widget so its slug is included in
  the inferred `defaultLayout` union type. Client-side widget parts live alongside as
  `*.client.tsx` files and call server actions from `apps/backend/src/lib/actions/` for mutations.
- **Server actions** (`apps/backend/src/lib/actions/`): `'use server'` functions for admin mutations (job
  rescheduling, cancellation, etc.). Use `useTransition` on the client side when calling them.

### Tailwind CSS 4

Tailwind v4 is wired through PostCSS, and the setup has two traps that fail
*silently* — the CSS still compiles, it just contains no utilities.

- **The PostCSS plugin must be registered.** Next.js 16 has no built-in
  Tailwind detection: without a `postcss.config.mjs` naming
  `@tailwindcss/postcss`, the stylesheet passes through untouched and the
  emitted CSS contains a raw `@tailwind utilities` directive instead of any
  utilities. `apps/frontend/postcss.config.mjs` and
  `apps/backend/postcss.config.mjs` do this. Storybook goes through Vite
  instead, so it registers the plugin in `apps/storybook/main.ts` under
  `viteFinal` (`css.postcss.plugins` must be an *array* here, not an object
  map — Vite calls `.slice()` on it).
- **Source roots must be explicit.** Tailwind scans the app's own directory,
  so classes that only appear in `packages/*` are never generated. Each app's
  entry stylesheet declares `@source '../../packages/app-components/src'` and
  `@source '../../packages/components/src'` for that reason. The Storybook's
  entry declares its own story directories instead.

The stylesheet *entry points* live with the apps that own them
(`apps/frontend/frontend.css`, `apps/backend/backend.css`,
`apps/storybook/storybook.css`); `packages/styles` holds only the partials
(`theme/_*.css`, `payload/_*.css`) plus `theme.css`, which assembles the
theme for `@reference` use by shared CSS in `packages/*`.

`@reference` in a stylesheet resolves **relative to that stylesheet's own
path**, not as a bare package specifier — Turbopack does not resolve
`@reference '@website/styles/theme.css'` the way Node would. Use a relative
path (e.g. `@reference '../../../styles/theme.css'`).

## Environment variables

Each environment (local dev, PR/`Testing`, `develop`, `main`) runs exactly one `next build`
against its own real values — there is no single build redeployed across environments, so
`process.env.NEXT_PUBLIC_*` is read normally (statically inlined at build time, like any other
Next.js app) and `rewrites()`/`apps/backend/next.config.ts`'s `env` block may reference real values directly.
`apps/backend/src/types/environment.ts`'s `envSchema` is validated in `apps/backend/next.config.ts` on every build/dev
start, and is the only place the full set of variables is enumerated.

## Job handlers (`apps/backend/src/jobs-queue/`)

Task and workflow **configs** (`tasks/`, `workflows/`) are part of the Payload config and therefore of
the Next.js bundle; their **handlers** are not. Each handler lives in `handlers/<name>.ts` and the
config points at it with `handler: handlerPath('<name>.ts')` (Payload loads string handlers at run
time). A handler module exports `handler` directly (e.g. `export const handler = run`) and must use
`req.payload` instead of `getPayload({ config })`. There is currently no Sentry-specific wrapping
around job handlers — errors thrown from a handler surface through whatever `req.payload.logger`/job
retry behavior already exists, not through a dedicated observability wrapper; if you need one,
write it rather than assuming `wrapHandler`/`withJobObservability` already exists. The web process
only enqueues jobs (never `runByID`); the worker (`apps/backend/scripts/start-worker.mjs`, polling every 5
seconds) runs them.

## Security Guardrails (found during review — respect these when touching related code)

- **SSE / Redis channels** (`apps/frontend/app/(frontend)/api/sse/route.ts`): the `channel` query param is
  matched against an allowlist (`apps/backend/src/lib/sse/channels.ts`) before `subscribe()` ever sees it, and
  per-job channels (`bilingual-translate:`, `seed-task:`) additionally require a signed-in
  `payload.auth()` session. The public channels in `SSE_CHANNELS` (e.g. `service-status`) stay
  unauthenticated by design. If you add a new channel that carries non-public data, add it to the
  authenticated branch rather than `SSE_CHANNELS` — see the route's own comments for the exact
  split.
- **Raw SVG rendering**: `apps/backend/src/collections/ResumeCustomers` stores raw SVG markup rendered via
  `dangerouslySetInnerHTML` in `apps/backend/src/components/LogoCarousel/LogoCarousel.tsx`. It is sanitized
  server-side on write by a `beforeChange` hook (`apps/backend/src/lib/sanitizeSvg.ts`, DOMPurify with an
  explicit tag/attribute deny-list) — the admin UI's client-side `svgo` pass is a bypassable
  optimizer, not the security boundary. Route any other raw-HTML/SVG field through the same
  `sanitizeSvg` helper (or an equivalent real, server-side sanitizer) before it's ever rendered
  unescaped.
- **`CRON_SECRET`** is declared in `apps/backend/src/types/environment.ts` but not enforced anywhere — there
  is no cron route yet. If you add one, validate this secret explicitly (ideally with
  `crypto.timingSafeEqual`, not `!==`).
- Never commit real secrets. Configuration lives in Doppler, selected per clone with
  `doppler setup` and written to a gitignored `.env.local` by `bun run load-env`;
  `apps/backend/src/types/environment.ts` declares the schema and is the only place the full set of
  variables is enumerated. The one committed env file is `.env.test`, which holds dummy,
  format-valid values for E2E runs.
- New authenticated API routes should mirror `apps/frontend/app/(frontend)/api/preview/route.ts`'s pattern of
  pairing a shared-secret check with a real `payload.auth()` session check where feasible.

## Known Issues / Tech Debt (baseline, not blocking, but don't add more)

- `bun run lint` passes but reports pre-existing warnings, mostly `no-explicit-any`, `no-unused-vars`,
  `no-img-element` and the React Compiler rules (`set-state-in-effect`, `purity`, `refs`), which
  `oxlint.config.ts` keeps at `warn` until they are cleaned up.
- Leftover debug `console.log`s (e.g. `apps/backend/src/collections/ResumeJobs/index.ts`,
  `apps/backend/src/blocks/ResumeDownloadsBlock/Renderer/Renderer.tsx`) and commented-out dead code (e.g.
  `apps/backend/src/collections/ResumeSkillTags/index.ts`) exist and should be cleaned up opportunistically.
- `package.json` `overrides` pins `postcss-merge-rules` to `9.0.4`: `9.0.6` throws
  `RangeError: Invalid string length` while cssnano minifies Payload's admin CSS in the
  production build. Lift the pin once a newer release builds cleanly (`bun run build`).
- No app-level rate limiting exists on public API routes.
- No shared logging abstraction — error logging is ad hoc `console.error` calls.

### Observability

Error capture goes through `@sentry/nextjs`/`@sentry/node` via a manual `Sentry.init(...)` in
`apps/backend/instrumentation.ts`/`apps/frontend/instrumentation-client.ts`
(`defaultIntegrations: false` plus
`zodErrorsIntegration`/`vercelAIIntegration`) — **not** `withSentryConfig`, which is incompatible
with Turbopack (its auto-instrumentation appends packages to `serverExternalPackages` that come
back as unresolvable content-hashed `require()` calls at runtime; see commits 4f4f903e, dced5bbe,
46e20549). Source maps are instead uploaded with a standalone `sentry-cli` step in
`build-and-deploy.yml`'s `deploy` job only (push-triggered, real builds) — not in
`lint-and-test.yml`'s `e2e` job, since a PR build never ships and there'd be no deployed release
to attach the maps to.
Scoped to `apps/backend/.next/server/app` + `apps/backend/.next/static/chunks` rather than the full
`.next` tree — see the step's own comments for why (a Cloudflare request-size limit in front of the
Sentry backend, and the fact that most vendor code ends up in opaque, unhelpful chunk names anyway).

The Sentry backend is a self-hosted [Rustrak](https://github.com/rustrak/rustrak) instance
(`SENTRY_URL`), confirmed (by reading its source) to implement the real Sentry envelope + CI/release
API, not a partial lookalike — any future "do we still need the Sentry SDK/do we need OTel instead"
question should start from that fact rather than re-investigating it.

## Testing

- Unit tests run via **Vitest** (`bun run test`), E2E tests via **Playwright** (`bun run test:e2e`) —
  see `README.md` for prerequisites. Co-locate unit tests as `*.test.ts` next to the code under
  test; E2E specs live in `e2e/*.spec.ts` (never `*.spec.ts` under `src/`).
- Each app has its own `vitest.config.ts`. The repo-root `tsconfig.json` maps `@/*` to *both* apps,
  so Vite cannot pick the right tree on its own — each app's config sets an explicit `@` alias
  pointing at its own `src/`. Do not remove it. `packages/lib` and `packages/app-components` have
  their own `vitest.config.ts` too, with `@website/*` aliases pointing at the sibling packages.
- Shared mocks live in the repo-root `vitest.setup.ts`: `payload` (`getPayload` stubbed via `importOriginal`
  spread — never replace the whole module, value imports from it are used at runtime),
  `next/cache` and `redis`. `tailwind-merge`, `date-fns`, `slugify`, `pupa` and `neotraverse` are
  intentionally NOT mocked — their real behavior is the contract under test.
- `TZ=UTC` is forced in `vitest.setup.ts` and date tests depend on it. Anything touching
  `Interval.setToX()` or `getLocalISOString` needs `vi.useFakeTimers()` + `vi.setSystemTime()`.
  Use `vi.stubEnv()` for env-dependent code (`SERVER_URL`, `PREVIEW_SECRET`).
- There is no CI-enforced coverage threshold; when fixing a bug, add a regression test near
  existing tests for that module if a suitable test file already exists.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
