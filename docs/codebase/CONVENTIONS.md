# Coding Conventions

## Core Sections (Required)

### 1) Naming Rules

| Item | Rule | Example | Evidence |
|------|------|---------|----------|
| Payload entity directories | PascalCase, matching the exported entity | `web/src/collections/BlogPosts/`, `web/src/blocks/ResumeExperienceBlock/` | `web/src/collections/`, `web/src/blocks/` |
| Files | `index.ts` for config/barrel; `Foo.tsx` server component + `Foo.client.tsx` client component pair | `web/src/components/Header/Header.tsx` + `Header.client.tsx` | Explore agent findings, `web/src/components/Header/` |
| Field/Block factory functions | `XxxField(config)` / `XxxBlock`, returning a Payload config object, composed via `deepMerge` for overrides | `LinkField`, `TitleField`, `ResumeBlockField` | `web/src/fields/Link/index.ts` |
| Types/interfaces | Local component props as `XxxProps` interfaces; generated Payload types imported from `@/types/payload` | `HeaderClientProps` | `web/src/components/Header/Header.client.tsx` |
| Slug/enum constants | `CollectionSlug`, `GlobalSlug`, `TaskSlug`, `WorkflowSlug`, `QueueSlug` — TypeScript enums/const objects in `web/src/types/*.ts` | `web/src/types/collections.ts`, `web/src/types/jobs-queue.ts` |
| Env vars | `SCREAMING_SNAKE_CASE`, validated centrally by a `zod` schema | `SERVER_URL`, `PAYLOAD_SECRET` | `web/src/types/environment.ts` |

### 2) Formatting and Linting

- Formatter + linter: **Biome** `^2.4.16` (no ESLint/Prettier) — `biome.json`.
- Key enforced style: 2-space indent, single quotes (double for JSX), semicolons `asNeeded`, trailing commas, 100-char line width (`biome.json` → `formatter`/`javascript.formatter`).
- Notable rule overrides: `style.useImportType` off, `suspicious.noArrayIndexKey` off, `a11y.noSvgWithoutTitle` off (tracked as inline `<TODO>` comments instead, e.g. `web/src/components/Logo/Logo.tsx:55`), `a11y.useValidAriaRole`/`noNoninteractiveTabindex` downgraded to `warn` (`biome.json` → `linter.rules`).
- Import organization is enforced by Biome's `assist.actions.source.organizeImports`, with an explicit group order: URL imports → Node/Bun builtins → React/Next/Payload package imports → other packages → `@/**`/`@pdf/**`/`@components/**` aliases → relative paths (`biome.json` lines ~130-190).
- Run commands: `pnpm lint` (`biome check`), `pnpm format` (`biome format --write`).
- Biome's `files.includes` only covers root single-files plus `web/*`, `web/src/**`, `web/app/**`, `web/public/**` — `storybook/`, `scripts/`, `packages/`, `tests/` are **not linted/formatted** by the root config (`biome.json:9-20`).

### 3) Import and Module Conventions

- Alias policy: prefer path aliases over deep relative imports. Primary alias `@/*` → `web/src/*` (`web/tsconfig.json:19-21`); additional granular aliases (`@access`, `@blocks`, `@collections`, `@components`, `@fields`, `@fonts`, `@globals`, `@lib`, `@pdf`, `@styles`, `@jobs-queue`, `@types`) are configured in the webpack resolver (`web/next.config.ts:129-140`) but **not mirrored in `tsconfig.json` paths** (only `@/*`, `@imgs/*`, `@pdf/*`, `@custom-types`, `@payload-config` are declared there, `web/tsconfig.json:18-37`) — editors relying purely on `tsconfig.json` may not resolve the granular aliases.
- Barrel policy: every aggregation level (`collections/`, `blocks/`, `globals/`, `fields/`) exports an `index.ts` barrel producing an array (`COLLECTIONS`, `BLOCKS`, `GLOBALS`) plus a derived slug union — this is the required registration point for new entities.
- Package-level `imports` field (Node's `#imports` map) used for CSS entry points: `#payload.css` / `#frontend.css` → `./src/styles/*.css` (`web/package.json:8-11`).

### 4) Error and Logging Conventions

- Error strategy: mostly `console.error`/`console.info` + returning HTTP error `Response`s from route handlers rather than throwing (e.g. `web/app/(frontend)/api/service-status/route.ts:16-21,39-44`); Payload's own error handling governs collection/access-control failures.
- Env validation failures use `zod`'s `prettifyError` printed to console followed by `process.exit(1)` — a hard boot-time failure rather than a caught/reported error (`web/env.ts:22-26`).
- **[TODO]** No structured/centralized logging library found (no `pino`, `winston`, etc. in `web/package.json`); logging is ad hoc `console.*` calls. Sentry (`@sentry/nextjs`) is installed but not actively wired (see CONCERNS.md) so there is currently no error-aggregation destination beyond console output.
- Sensitive-data redaction: no explicit redaction logic found; secrets flow through `process.env` and the `zod`-validated `Env` type — **[TODO]** confirm no secret values are ever passed to `console.debug`/`console.log` (a prior commit, `02c1405`, specifically removed `console.debug(process.env)` dumps from `next.config.ts`, suggesting this was previously a real issue).

### 5) Testing Conventions

- Test file naming/location rule: `.test.js` suffix, placed in `tests/` or co-located with source (per `README.md:117-124` and `.junie/guidelines.md`) — **no test files currently exist in the repo** (see TESTING.md).
- Mocking strategy norm: **[TODO]** — no test files exist to establish a real-world pattern.
- Coverage expectation: **[TODO]** — no coverage tool configured.

### 6) Evidence

- `biome.json`
- `web/tsconfig.json`, `web/next.config.ts`
- `web/src/fields/Link/index.ts`, `web/src/components/Header/`
- `web/env.ts`

## Extended Sections (Optional)

Not populated — the codebase is consistent enough (single linter, single alias convention) that a full per-layer error-handling matrix isn't warranted yet.
