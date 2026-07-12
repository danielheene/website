# Architecture

## Core Sections (Required)

### 1) Architectural Style

- Primary style: **CMS-driven, feature/domain-organized monolith** — a single Next.js App Router application where content structure (pages, blocks, globals) is defined in Payload CMS and rendered by paired React components. Not a classic layered (controller/service/repository) architecture; organization follows Payload's own vocabulary (collections, globals, blocks, fields).
- Why this classification: `web/payload.config.ts` is the central composition root wiring `COLLECTIONS`, `GLOBALS`, and `BLOCKS` (all aggregated via barrel files, `web/src/collections/index.ts` etc.) into one `buildConfig()` call; the frontend (`web/app/(frontend)/`) reads that same content through Payload's local API rather than a separate backend service.
- Primary constraints: (1) Payload's local-API/ORM pattern over MongoDB via Mongoose (`@payloadcms/db-mongodb`, `web/payload.config.ts:170-172`) shapes all data access; (2) content blocks must be registered in both the Payload schema (`web/src/blocks/index.ts`) and have a matching React `Renderer/` to be displayed — a dual-registration convention; (3) the app and admin panel share one Next.js deployment (`web/app/(frontend)` vs `web/app/(payload)` route groups), so admin and public traffic are not physically isolated.

### 2) System Flow

```text
HTTP request -> Next.js App Router (web/app/(frontend)/[slug]/page.tsx)
             -> Payload local API fetcher (web/src/lib/fetchers/fetchCollectionEntries.ts / fetchGlobalData.ts)
             -> Payload collection/global config (access control + hooks applied, web/src/collections/*, web/src/access/*)
             -> MongoDB (mongooseAdapter) / Redis (kv) / S3 (media)
             -> Block resolution (web/src/blocks/RenderBlocks.tsx maps stored block data -> per-block Renderer components)
             -> React Server Component tree -> HTML response
```

Background/async path:
```text
Payload hook (e.g. afterChange on a Resume global, web/src/globals/ResumeAboutMe/index.ts)
             -> enqueue job (web/src/lib/hooks/enqueueGenerateResumeDocuments.ts)
             -> Payload jobs queue (cron-polled, web/payload.config.ts:191-217)
             -> task handler (web/src/jobs-queue/tasks/generateResumeDocument.tsx)
             -> @react-pdf/renderer document build (web/src/pdf/index.tsx) -> stored via S3 storage plugin
```

### 3) Layer/Module Responsibilities

| Layer or module | Owns | Must not own | Evidence |
|-----------------|------|--------------|----------|
| `web/app/` (routes) | HTTP routing, metadata (`manifest.ts`, `robots.ts`, `sitemap.ts`), thin route handlers | Payload schema, business rules | `web/app/(frontend)/`, `web/app/sitemap.ts` |
| `web/src/collections/`, `web/src/globals/` | Content schema, per-entity access rules, lifecycle hooks (revalidation, cascading updates) | Presentation/rendering | `web/src/collections/BlogPosts/index.ts`, `web/src/globals/ResumeAboutMe/index.ts` |
| `web/src/blocks/` | Page-builder block schema **and** its renderer (co-located) | Global site chrome (that's `components/Header`, `components/Footer`) | `web/src/blocks/ResumeExperienceBlock/` |
| `web/src/access/` | Read/write authorization predicates reused across collections/globals (`anyone`, `authenticated`, `authenticatedOrPublished`) | Field-level validation logic | `web/src/access/` |
| `web/src/lib/fetchers/` | Payload local-API read wrappers used by route/server components | Direct MongoDB queries bypassing Payload | `web/src/lib/fetchers/fetchCollectionEntries.ts` |
| `web/src/jobs-queue/` | Background task definitions run by Payload's cron-polled job runner | Request-time synchronous work | `web/src/jobs-queue/tasks/index.ts` |
| `web/src/pdf/` | Resume PDF document composition (`@react-pdf/renderer`) | Web page rendering | `web/src/pdf/index.tsx` |
| `web/env.ts` / `web/src/types/environment.ts` | Environment loading and `zod` validation, shared across Next.js and the Payload CLI | Feature logic | `web/env.ts`, `web/payload.config.ts:23,28` |

### 4) Reused Patterns

| Pattern | Where found | Why it exists |
|---------|-------------|---------------|
| Field/Block factory functions (`XxxField(config)`, deep-merged overrides) | `web/src/fields/Link/index.ts`, `web/src/fields/ResumeBlock/`, used by collections/blocks/globals | Avoids duplicating common Payload field shapes (title, slug, meta, link groups) across ~20 collections/blocks/globals |
| Barrel aggregation + derived slug unions | `web/src/collections/index.ts`, `web/src/blocks/index.ts`, `web/src/globals/index.ts`, `web/src/types/collections.ts` | Single registration point feeding `buildConfig()`, keeps slugs type-safe |
| Server/client component pairing (`Foo.tsx` + `Foo.client.tsx`) | `web/src/components/Header/` | Keeps data-fetching on the server while isolating interactivity (`'use client'`) to a minimal boundary |
| afterChange hook → revalidate/enqueue | `web/src/collections/BlogPosts/hooks/revalidateBlogPost.ts`, `web/src/lib/hooks/enqueueGenerateResumeDocuments.ts` | Keeps Next.js cache and generated artifacts (PDFs) in sync with CMS edits without polling |
| Explicit root-env loading (`loadEnv`/`loadRootEnv`) called at the top of both `next.config.ts` and `payload.config.ts` | `web/env.ts`, `web/next.config.ts:17`, `web/payload.config.ts:28` | Needed because the app now lives in `web/` but `.env*` files stay at the repo root (workspace-wide single source of truth) — Next's implicit per-project env loading wouldn't find them, and the Payload CLI runs outside Next's lifecycle entirely |

### 5) Known Architectural Risks

- **Env loading fragility**: `web/env.ts:16-20` builds `envFilePaths` via `globSync` (potentially multiple `.env*` files) then calls `path.join(...envFilePaths)` — `path.join` concatenates path *segments*, not multiple full file paths; passing several matched files into it does not produce a valid directory argument for `loadEnvConfig`. This is easy to miss because a single match happens to "work" by accident. Recommend re-reading this function before relying on multi-file `.env` loading behavior.
- **Admin and public app share one deployment**: no separate service boundary between `web/app/(payload)` (admin/API) and `web/app/(frontend)` (public site) — a spike in public traffic or a public-facing bug can affect admin availability, and vice versa.
- **Dual-registration coupling for blocks**: adding a block requires touching both `web/src/blocks/index.ts` (schema) and its `Renderer/` — nothing enforces the pairing at compile time beyond convention, so an unregistered renderer would fail silently or an orphaned schema entry could render nothing.

### 6) Evidence

- `web/payload.config.ts` (composition root)
- `web/src/blocks/index.ts`, `web/src/blocks/RenderBlocks.tsx`
- `web/src/collections/index.ts`, `web/src/globals/index.ts`
- `web/env.ts`, `web/next.config.ts`
- `web/src/jobs-queue/tasks/index.ts`, `web/src/pdf/index.tsx`

## Extended Sections (Optional)

Not populated — no additional async/event topology beyond the Payload jobs queue described above.
