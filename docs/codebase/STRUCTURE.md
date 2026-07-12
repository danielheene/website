# Codebase Structure

## Core Sections (Required)

### 1) Top-Level Map

| Path | Purpose | Evidence |
|------|---------|----------|
| `web/` | The Next.js 15/16 + Payload CMS application — the only deployable unit today | `web/package.json`, `web/app/`, `web/src/` |
| `storybook/` | Standalone Storybook workspace documenting the design system (colors, typography, icons) | `storybook/package.json`, `storybook/stories/` |
| `packages/` | Reserved pnpm workspace glob (`packages/*`) for future shared packages — currently **empty** | `pnpm-workspace.yaml:4`, `docs/superpowers/specs/2026-07-11-monorepo-web-package-design.md:16-18` (explicitly out of scope for the current pass) |
| `scripts/` | Standalone Node scripts, e.g. `dev-tunnel.mjs` (spawns `next dev` behind a `cloudflared` quick tunnel) | `scripts/dev-tunnel.mjs` |
| `tests/` | Reserved location for Node-test-runner tests — currently **empty**, no test files exist | scan output (`find tests -type f` → no results) |
| `patches/` | pnpm patch files applied via `patchedDependencies` | `patches/pdfjs-dist@5.4.296.patch`, `package.json:243-245` |
| `.changeset/` | Changesets config for versioning/release notes | `.changeset/config.json` |
| `.github/workflows/` | CI: Changesets release automation + Dependabot auto-merge (no build/lint/test CI gate — see CONCERNS.md) | `.github/workflows/changesets.yml`, `.github/workflows/dependabot.yml` |
| `docs/superpowers/` | Design specs and implementation plans for recent structural changes (e.g. the `web/` workspace extraction) | `docs/superpowers/specs/`, `docs/superpowers/plans/` |
| `.junie/` | AI coding-agent memory/guidelines (Junie tool) — **partially stale**, predates the `web/` move | `.junie/AGENTS.md`, `.junie/guidelines.md` |
| `docker-compose.yml` | Local dev infra: MongoDB, Redis, S3-compatible `rustfs` storage + bucket bootstrap | `docker-compose.yml` |
| `biome.json`, `turbo.json`, `pnpm-workspace.yaml` | Root-level shared tooling config | (self) |

### 2) Entry Points

- Main runtime entry: Next.js App Router under `web/app/` — two route groups: `web/app/(frontend)/` (public site) and `web/app/(payload)/` (Payload admin UI + REST API catch-all).
  - Frontend root page: `web/app/(frontend)/page.tsx`; dynamic page-by-slug: `web/app/(frontend)/[slug]/page.tsx`.
  - Payload admin: `web/app/(payload)/admin/[[...segments]]/page.tsx`; Payload REST API catch-all: `web/app/(payload)/api/[...slug]/route.ts`.
- CMS/config entry: `web/payload.config.ts` (loaded by both the Next.js integration and the standalone `payload` CLI, e.g. `payload migrate`).
- Secondary entry points:
  - Background jobs: Payload's jobs queue, tasks defined in `web/src/jobs-queue/tasks/` and registered in `web/src/payload.config.ts:191-217` (`shouldAutoRun` gated by `ENABLE_JOB_WORKERS` env var, cron-scheduled via `autoRun`).
  - Dev tunnel script: `scripts/dev-tunnel.mjs` (standalone Node process, not part of the Next.js build).
- How entry is selected: `pnpm dev` → `turbo run dev` → per-package `dev` script (`web/package.json:15` → `next dev`; `storybook/package.json` → `storybook dev -p 6006`).

### 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|----------|-------------------|------------------------|
| `web/app/` | Route segments, layouts, route handlers (`route.ts`) — thin, delegates to `web/src/` | Business logic, Payload field/collection definitions |
| `web/src/collections/`, `web/src/globals/` | Payload schema: fields, access rules, hooks per collection/global | React rendering logic |
| `web/src/blocks/` | Payload block schema (`index.ts`) **and** its paired React `Renderer/` (co-located, not split across trees) | Data-fetching outside the block's own renderer |
| `web/src/components/` | Reusable, presentation-focused React components (server + `.client.tsx` pairs) | Payload collection/field schema |
| `web/src/fields/` | Reusable Payload field factories (`XxxField(config)`) shared across collections/blocks/globals | One-off inline field definitions that don't need reuse |
| `web/src/access/` | Payload `Access` functions (`anyone`, `authenticated`, `authenticatedOrPublished`) | Business/domain logic unrelated to read/write authorization |
| `web/src/lib/` | Cross-cutting utilities: `fetchers/` (Payload local-API reads), `hooks/` (Payload lifecycle hooks), `i18n/`, `dateTime/`, `jsonLd/` (schema.org structured data) | UI components |
| `web/src/jobs-queue/` | Payload job task definitions (async/background work, e.g. resume PDF generation) | Synchronous request-handling code |
| `web/src/pdf/` | `@react-pdf/renderer` document/section builders for resume PDF export | Web-facing React components |
| `web/src/types/` | `payload.ts` (**auto-generated**, do not hand-edit — see header at `web/src/types/payload.ts:1-6`) plus manual slug/enum/type files (`collections.ts`, `globals.ts`, `blocks.ts`, `jobs-queue.ts`, `select-options.ts`, `environment.ts`) | Runtime logic |

### 4) Naming and Organization Rules

- Directory organization: **feature/domain-based** within Payload concepts (one PascalCase directory per collection/block/field/global — e.g. `web/src/collections/BlogPosts/`, `web/src/blocks/ResumeExperienceBlock/`), each with an `index.ts` config and optional `hooks/`, `utils/`, `Renderer/` subfolders.
- File naming: PascalCase directories matching the exported entity name; barrel `index.ts` at every aggregation level (`collections/index.ts`, `blocks/index.ts`, `globals/index.ts`, `fields/index.ts`) exporting arrays (`COLLECTIONS`, `BLOCKS`, `GLOBALS`) plus derived slug unions.
- Client/server component split: `Foo.tsx` (server) + `Foo.client.tsx` (`'use client'`) co-located in the same directory (e.g. `web/src/components/Header/Header.tsx` + `Header.client.tsx`).
- Import aliasing: `@/*` → `web/src/*` (primary alias, `web/tsconfig.json:19-21`); additional webpack aliases `@access`, `@blocks`, `@collections`, `@components`, `@fields`, `@fonts`, `@globals`, `@lib`, `@pdf`, `@styles`, `@jobs-queue`, `@types` all resolve into `web/src/*` subpaths (`web/next.config.ts:129-140`); `@payload-config` → `web/payload.config.ts` (`web/tsconfig.json:31-33`).

### 5) Evidence

- `docs/codebase/.codebase-scan.txt` (directory tree, code metrics)
- `web/tsconfig.json`, `web/next.config.ts`
- `web/src/collections/index.ts`, `web/src/blocks/index.ts`, `web/src/globals/index.ts`
- `docs/superpowers/specs/2026-07-11-monorepo-web-package-design.md`

## Extended Sections (Optional)

### Monorepo Workspace Map

- `pnpm-workspace.yaml:1-4` declares three workspace member globs: `web`, `storybook`, `packages/*`.
- This structure is the result of a very recent (2026-07-11 per plan/spec filenames) migration that moved the app from the repo root into `web/`; the root `package.json` now holds only shared tooling (`biome`, `turbo`, `changesets`, `syncpack`, `sort-package-json`) — see `docs/superpowers/plans/2026-07-11-monorepo-web-package.md` and the design doc referenced above for full rationale.
- **Intent vs. reality**: the root `README.md` still describes the pre-migration layout (`app/`, `src/` at repo root, Node `^22`, pnpm `^10`) — it has not been updated to reflect the `web/` workspace split. `[ASK USER]` should the README be updated as part of this documentation pass, or is that tracked separately?
