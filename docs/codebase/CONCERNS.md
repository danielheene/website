# Codebase Concerns

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| Severity | Concern | Evidence | Impact | Suggested action |
|----------|---------|----------|--------|------------------|
| High | No CI gate runs build/lint/tests before merge — only `changesets.yml` (release, triggers on push to `main`) and `dependabot.yml` (auto-merge) exist | `.github/workflows/changesets.yml`, `.github/workflows/dependabot.yml` (no `ci.yml`/`test.yml`/`build.yml`) | Broken builds or lint failures can land on `main` and even auto-merge via Dependabot without any check running | Add a workflow running `pnpm lint`, `pnpm --filter web exec tsc --noEmit`, and `pnpm build` on PRs |
| High | Zero test coverage — `tests/` is empty and no `*.test.js` files exist anywhere in the repo | See TESTING.md; `README.md`/`.junie/guidelines.md` document a demonstration test that was deliberately deleted | Regressions in Payload hooks, block renderers, or PDF generation have no automated safety net | Start with the highest-churn files (`src/blocks/Resume*Block/Renderer/index.tsx`, `src/types/blocks.ts`) |
| Medium | `.env.example` is missing several env vars required by the `zod` schema (`SERVER_HOST`, `STATUS_PAGE_URL`, `STATUS_PAGE_HEARTBEAT_URL`, `UMAMI_USERNAME`, `UMAMI_PASSWORD`, `NEXT_PUBLIC_UMAMI_SITE_ID`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `MAPBOX_API_KEY`) | `.env.example` vs `web/src/types/environment.ts:3-52` | New contributors following the README's setup steps will hit a hard `process.exit(1)` from `web/env.ts:22-26` with no clue which vars are missing beyond the zod error output | Bring `.env.example` in sync with `envSchema`, or mark truly-optional vars as `.optional()` in the schema |
| Medium | `README.md` describes the pre-migration repo layout (app at repo root, Node `^22`, pnpm `^10`) — stale relative to the current `web/` workspace structure and `package.json` engine versions (Node `^26`, pnpm `^11`) | `README.md:5-19,90-109` vs `package.json:234-237`, `docs/superpowers/specs/2026-07-11-monorepo-web-package-design.md` | New contributors or AI agents onboarding from the README will run commands from the wrong directory / expect the wrong Node version | Update `README.md` to reflect the `web/` workspace (tracked as `[ASK USER]` #1 below) |
| Medium | `.github/dependabot.yml` declares `package-ecosystem: "bun"` for the root directory, but the repo uses pnpm exclusively | `.github/dependabot.yml:8`, `package.json` (`packageManager: pnpm@11.9.0`) | Dependabot likely silently fails to update root JS dependencies (wrong ecosystem parser for a pnpm lockfile) | Change `package-ecosystem` to `npm` (Dependabot's value for the npm/pnpm/yarn ecosystem family) — already flagged as a known, unaddressed mismatch in `docs/superpowers/specs/2026-07-11-monorepo-web-package-design.md:226-229` |
| Low | `web/env.ts:16-20` builds `envFilePaths` via `globSync(...)` (array of matched `.env*` file paths) then passes them into `path.join(...envFilePaths)` — `path.join` treats each argument as a path *segment*, not independent files, which is not the documented behavior of `loadEnvConfig` (expects a single directory) | `web/env.ts:14-29` | Works today only because there's effectively one relevant match pattern resolving predictably in practice; fragile if the number/order of matched `.env*` files changes | Re-verify this function's behavior directly (e.g. log `envFilePaths` and the resolved path) before depending on it further, or pass a directory instead of globbed file paths |

### 2) Technical Debt

| Debt item | Why it exists | Where | Risk if ignored | Suggested fix |
|-----------|---------------|-------|-----------------|---------------|
| Sentry dependency installed but not wired | `@sentry/nextjs` and `@payloadcms/plugin-sentry` are dependencies; the Payload plugin call and the `SENTRY_*` env vars are commented out | `web/payload.config.ts:240-245`, `web/src/types/environment.ts:40-43`, `web/next.config.ts:100` | No error monitoring/aggregation in production beyond console logs | Either finish wiring Sentry or remove the unused dependencies to reduce bundle/install weight |
| `OPENAI_API_KEY` and `MAPBOX_API_KEY` present in the env schema with no call sites found | Unclear — possibly planned features or leftover from a prior iteration | `web/src/types/environment.ts:45,47` | Required-env validation forces every environment to supply keys for integrations that may not be used | `[ASK USER]` #2 below |
| `packages/*` workspace glob reserved but empty | Deliberate first step of a larger monorepo migration (extracting `web/` before extracting shared packages) | `pnpm-workspace.yaml:4`, `docs/superpowers/specs/2026-07-11-monorepo-web-package-design.md:16-18,37-43` | None currently — explicitly scoped as future work | No action needed; tracked intentionally |
| `turbo.json` defines a `check-types` task, but no workspace package implements a `check-types` script | Called out as a known pre-existing gap in the migration design doc, not fixed by that pass | `turbo.json:14-18` vs `web/package.json` scripts, `storybook/package.json` scripts | `turbo run check-types` would currently no-op / fail to find a runnable script anywhere | Add a `check-types` script (`tsc --noEmit`) to `web/package.json` and `storybook/package.json` |
| Biome's `files.includes` doesn't cover `scripts/`, `packages/`, or `tests/` | Config was updated to include `web/*` during the recent migration but the pre-existing root globs weren't broadened further | `biome.json:9-20` | `scripts/dev-tunnel.mjs` and any future `tests/`/`packages/*` code won't be linted/formatted | Extend `files.includes` once those directories gain real content |

### 3) Security Concerns

| Risk | OWASP category (if applicable) | Evidence | Current mitigation | Gap |
|------|--------------------------------|----------|--------------------|-----|
| S3 bucket set to public-read in local dev via `mc anonymous set download` | A01 (Broken Access Control) — informational, dev-only as written | `docker-compose.yml` (create-bucket service) | This is dev-only compose config, not necessarily production | **[ASK USER]** #3 — confirm intended production bucket ACL matches this public-read default |
| No rate limiting/retry-backoff visible on any external API route (`service-status`, Anthropic calls) | A04 (Insecure Design) — DoS/abuse surface | `web/app/(frontend)/api/service-status/route.ts`, `web/src/lib/fetchAnthropic*.ts` | None found | Consider basic rate limiting on public API routes if traffic grows |
| Hard `process.exit(1)` on env validation failure prints the full `zod` prettified error to console | Low — could leak which specific secrets are missing/malformed in logs, though not the secret values themselves | `web/env.ts:22-26` | Error is descriptive by design (developer ergonomics) | Acceptable for a personal-site scale project; note if logs are ever publicly accessible (e.g. CI logs) |

### 4) Performance and Scaling Concerns

| Concern | Evidence | Current symptom | Scaling risk | Suggested improvement |
|---------|----------|-----------------|-------------|-----------------------|
| Redis configured with `--maxmemory-policy noeviction` in dev compose | `docker-compose.yml` (redis service) | None observed in dev | If KV usage grows unbounded, Redis will refuse writes instead of evicting, causing hard failures rather than graceful degradation | Revisit eviction policy for production Redis if usage patterns change |
| Single MongoDB instance, no replica set in dev compose | `docker-compose.yml` (mongo service) | N/A (dev-only) | **[TODO]** unknown production topology — can't assess risk without more info | **[ASK USER]** #4 — what is the production database topology? |

### 5) Fragile/High-Churn Areas

| Area | Why fragile | Churn signal | Safe change strategy |
|------|-------------|-------------|----------------------|
| `src/blocks/ResumeAboutMeBlock/index.ts`, `src/blocks/ResumeDownloadsBlock/Renderer/index.tsx`, `src/blocks/ResumeExperienceBlock/Renderer/index.tsx`, `src/types/blocks.ts` | Untested (see TESTING.md), core to the resume feature which also drives PDF generation via jobs-queue | 4 changes each in last 90 days (scan output) | Add unit/snapshot tests before further changes; changes here should be manually verified against both the web renderer and the generated PDF |
| `app/(frontend)/[slug]/page.tsx`, `app/(frontend)/api/service-status/route.ts`, `app/(frontend)/blog/_tag/[slug]/page.tsx`, `app/(frontend)/blog/post/[slug]/page.tsx`, `payload.config.ts` | Central routing/config files with no test coverage | 3 changes each in last 90 days (scan output) | Manually verify frontend routes + admin panel boot after any change here |
| `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json`, `biome.json` | Root tooling/config, mid-migration (workspace split just happened) | 4-5 changes each in last 90 days (scan output) | Expected during an active migration; should stabilize — re-check `docs/superpowers/plans/` for any remaining migration steps |

### 6) `[ASK USER]` Questions

1. `README.md` describes the pre-`web/`-workspace layout (root-level `app/`/`src/`, Node `^22`, pnpm `^10`). Should this documentation pass (or a follow-up) update `README.md` to match the current `web/` workspace structure and `package.json` engine versions?
2. `OPENAI_API_KEY` and `MAPBOX_API_KEY` are required by the `zod` env schema (`web/src/types/environment.ts:45,47`) but no call sites reference them anywhere in `web/src/`. Are these used by a feature not yet built, dead config from a prior iteration, or called from a location this pass didn't find?
3. `docker-compose.yml`'s `create-bucket` service sets the local S3 bucket policy to public-read (`mc anonymous set download`). Does the production S3-compatible bucket use the same public-read policy, and is that intentional?
4. What is the production hosting/deployment target for `web/` (Vercel, Docker/Fly, self-hosted, etc.)? No Dockerfile, `vercel.json`, or other deploy config was found in the repo, and neither `README.md` nor the CI workflows document it.
5. Is there a plan to add a CI workflow that runs `pnpm lint` / typecheck / `pnpm build` on pull requests, given the current CI only handles releases (Changesets) and Dependabot auto-merge?

### 7) Evidence

- `docs/codebase/.codebase-scan.txt` (TODO/FIXME scan, high-churn files, CI/CD detection)
- `.github/workflows/changesets.yml`, `.github/workflows/dependabot.yml`
- `web/env.ts`, `web/src/types/environment.ts`, `.env.example`
- `docs/superpowers/specs/2026-07-11-monorepo-web-package-design.md`
- `docker-compose.yml`, `biome.json`, `turbo.json`

## Extended Sections (Optional)

Not populated — the concerns above are the material ones found; a full bug inventory or cost/effort roadmap would require product/ownership input beyond what's derivable from the code.
