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
- **Redis** — used both as Payload's KV cache (`@payloadcms/kv-redis`), the Next.js turbo cache
  (`@trieb.work/nextjs-turbo-redis-cache`), and a custom pub/sub layer (`src/lib/RedisHandler.ts`)
  that powers Server-Sent Events (`app/(frontend)/api/sse/route.ts`).
- **S3-compatible storage** (`@payloadcms/storage-s3`, Minio locally) for media.
- **Tailwind CSS 4** for styling, **Storybook** for component development.
- **Biome** for linting/formatting (not ESLint/Prettier).

See `README.md` for setup/run instructions; this file focuses on conventions and pitfalls.

## Build, Lint, and Test Commands

```bash
pnpm install          # install deps (pnpm only — see packageManager in package.json)
pnpm dev              # runs Next.js dev server + Storybook in parallel
pnpm dev:app          # Next.js dev server only
pnpm generate         # regenerate Payload types + import map (run after changing collections/fields)
pnpm build            # production build
pnpm lint             # biome check (lint + format check, does NOT auto-fix)
pnpm format           # biome format --write (auto-fixes formatting only)
pnpm test             # unit tests (Vitest)
pnpm test:e2e         # Playwright E2E (needs docker compose up -d)
```

Always run `pnpm generate` after adding/renaming a collection, global, field, or block — many
files import generated types from `src/types/payload.ts` and `@/types/collections`.

`pnpm lint` currently does **not** pass cleanly on `main` (baseline has pre-existing errors/
warnings — see "Known Issues" below). Don't let pre-existing failures block your task, but do not
introduce new lint errors, and prefer fixing lint issues in files you already touch.

## Code Style (enforced by `biome.json` / `.editorconfig`)

- 2-space indentation, LF line endings, 100-char line width.
- Single quotes for JS/TS, double quotes in JSX attributes.
- **No semicolons** (`semicolons: "asNeeded"`, ASI style) — do not add trailing semicolons.
- Trailing commas everywhere (`trailingCommas: "all"`).
- Import order is auto-organized by Biome's `organizeImports` assist action, in this group order:
  1. URL imports
  2. Node/Bun builtins
  3. `react*` / `next*` / `payload*` / `@payloadcms/**`
  4. other npm packages
  5. `@/**` path-alias imports
  6. relative imports
  7. style imports
  Run `pnpm format` (or your editor's Biome integration) instead of manually sorting imports.
- `tsconfig.json` has `"strict": false` — do not rely on the compiler to catch null/undefined
  bugs; be explicit and defensive, especially in Payload hooks and access-control functions.
- `import type` vs. value imports is **not** enforced (`useImportType` is off) — either style is
  accepted, but prefer `import type` for type-only imports for clarity when touching a file.

### Conventions to follow (not currently enforced by tooling — please don't add new inconsistencies)

- **Enum-like access**: prefer dot notation (`CollectionSlug.Pages`) over bracket notation
  (`CollectionSlug['Pages']`). Bracket notation is the single largest source of existing lint
  noise (`lint/complexity/useLiteralKeys`); don't add more of it.
- **Exports**: prefer named exports (`export const X = ...`) over default exports for components;
  this is the dominant pattern in `src/components/`.
- **Barrel files**: existing `index.ts`/`index.tsx` files use either `export * from './X'` or
  `export { X } from './X'` — match whichever pattern already exists in the folder you're editing.
- **Hooks vs. utils naming**: files in `src/hooks/` use kebab-case (`use-mobile.ts`); files in
  `src/lib/` use camelCase (`generateSlug.ts`). Follow the convention of the folder you're in.
- **Fields**: folder name has no suffix (`src/fields/Slug/`), but the exported factory function
  has an `XField` suffix (`SlugField`, `TitleField`). Keep this pattern for new fields.
- **Globals**: naming is currently inconsistent (`SiteSettings`, `SettingsGlobalUser`,
  `PDFGeneratorSettings`). When adding a new global, prefer the `XSettings` suffix pattern.
- Avoid leftover `console.log` debug statements and large commented-out code blocks — several
  exist in the codebase (see Known Issues) but should not be added to.
- Avoid `any`; if you must use it, add a `biome-ignore` comment with a real justification (see
  `src/lib/resolveRelation.ts` for a good example), not a placeholder like `<TODO>`.

## Architecture Notes

- **Access control** (`src/access/`): small, composable `Access` functions (`anyone`,
  `authenticated`, `authenticatedOrPublished`, `forbidden`). There is **no role/permission system**
  — `authenticated` only checks "is any Payload user logged in". Treat every Payload user as
  fully trusted (single-admin trust model) unless you introduce roles explicitly.
- **Collections/Blocks/Fields/Globals** are factory-function based — most fields (e.g.
  `TitleField()`, `SlugField()`) accept an `overrides` object rather than being edited in place.
  Reuse existing field factories instead of inlining raw Payload field configs when one exists.
- **Redis** (`src/lib/RedisHandler.ts`) exposes `get`/`set`/`invalidate` (cache) and
  `publish`/`subscribe` (pub/sub, used by the SSE route). Keys/channels are plain strings — no
  namespacing helper exists yet; be consistent with existing key formats when adding new ones.
- **Revalidation**: Payload collection hooks call `revalidate*` helpers (e.g.
  `src/collections/Pages/hooks/revalidatePage.ts`) to invalidate Next.js cache tags after content
  changes — follow this pattern for any new collection that's rendered on the frontend.

## Security Guardrails (found during review — respect these when touching related code)

- **SSE / Redis channels** (`app/(frontend)/api/sse/route.ts`): the `channel` query param is
  currently accepted from the client with **no allowlist**. If you touch this route, add
  validation against a known set of channel names before adding new `publish()` callers —
  otherwise any client can open unlimited unauthenticated subscriptions.
- **`queryPresets` access** (`payload.config.ts`): `read`/`create`/`update`/`delete` are all
  `() => true` (fully public). Don't copy this pattern for new collections/globals; scope access
  explicitly (e.g. `authenticated`).
- **Raw SVG rendering**: `src/collections/ResumeCustomers` stores raw SVG markup that is later
  rendered via `dangerouslySetInnerHTML` in `src/components/LogoCarousel/LogoCarousel.tsx`. The
  only sanitization (`svgo`) currently runs client-side in the admin UI and is not a real security
  boundary. Do not add other raw-HTML/SVG fields rendered this way without server-side
  sanitization (e.g. a `beforeChange` hook stripping `<script>`/`on*`/`javascript:` URIs).
- **`CRON_SECRET`** is declared in `.env.example` / `src/types/environment.ts` but not enforced
  anywhere — there is no cron route yet. If you add one, validate this secret explicitly (ideally
  with `crypto.timingSafeEqual`, not `!==`).
- Never commit real secrets; only placeholder values belong in `.env.example`.
- New authenticated API routes should mirror `app/(frontend)/api/preview/route.ts`'s pattern of
  pairing a shared-secret check with a real `payload.auth()` session check where feasible.

## Known Issues / Tech Debt (baseline, not blocking, but don't add more)

- `pnpm lint` reports pre-existing errors/warnings, mostly `useLiteralKeys` (bracket vs. dot
  access), `noExplicitAny`, `noUnusedVariables`/`noUnusedImports`.
- Leftover debug `console.log`s (e.g. `src/collections/ResumeJobs/index.ts`,
  `src/blocks/ResumeDownloadsBlock/Renderer/Renderer.tsx`) and commented-out dead code (e.g.
  `src/collections/ResumeSkillTags/index.ts`) exist and should be cleaned up opportunistically.
- No app-level rate limiting exists on public API routes.
- No shared logging abstraction — error logging is ad hoc `console.error` calls.

## Testing

- Unit tests run via **Vitest** (`pnpm test`), E2E tests via **Playwright** (`pnpm test:e2e`) —
  see `README.md` for prerequisites. Co-locate unit tests as `*.test.ts` next to the code under
  test; E2E specs live in `e2e/*.spec.ts` (never `*.spec.ts` under `src/`).
- Shared mocks live in `vitest.setup.ts`: `payload` (`getPayload` stubbed via `importOriginal`
  spread — never replace the whole module, value imports from it are used at runtime),
  `next/cache` and `redis`. `tailwind-merge`, `date-fns`, `slugify`, `pupa` and `neotraverse` are
  intentionally NOT mocked — their real behavior is the contract under test.
- `TZ=UTC` is forced in `vitest.setup.ts` and date tests depend on it. Anything touching
  `Interval.setToX()` or `getLocalISOString` needs `vi.useFakeTimers()` + `vi.setSystemTime()`.
  Use `vi.stubEnv()` for env-dependent code (`SERVER_URL`, `PREVIEW_SECRET`).
- There is no CI-enforced coverage threshold; when fixing a bug, add a regression test near
  existing tests for that module if a suitable test file already exists.
