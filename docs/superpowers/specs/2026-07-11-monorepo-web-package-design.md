# Design: Move the app into a `web/` workspace package

## Context

The repository was recently converted into a pnpm workspace (`storybook/` and
`packages/*` were added as workspace members) to support Storybook alongside
the main Next.js + Payload CMS application. The application itself, however,
still lives at the workspace root (`app/`, `src/`, `public/`,
`next.config.ts`, `payload.config.ts`, root `package.json`, etc.).

This is the first step of a larger monorepo migration: extracting the app
into its own workspace package, `web/`, so the repository root holds only
shared tooling/config and every runnable unit (the app, Storybook, and any
future packages) is an ordinary sibling workspace member.

Extracting shared code (UI components, types) into `packages/*` is explicitly
out of scope for this pass — the app moves as a single unit, with all its
current code and dependencies intact.

## Goals

- Move the Next.js + Payload app from the workspace root into `web/`.
- Keep environment variables (`.env`, `.env.local`, `.env.example`) at the
  repository root as the single source of truth, loaded explicitly by the
  app rather than relying on Next.js's implicit per-project `.env` loading.
- Keep `scripts/`, `tests/`, and `patches/` at the root for now (explicitly
  deferred, not part of this pass).
- Route `dev`/`build` through Turborepo, which is already partially wired up
  (`turbo.json` exists with `build`/`dev`/`check-types` tasks) but not yet
  used by the root scripts.
- Use the move as an opportunity to remove now-redundant/noisy code from
  `next.config.ts`: the inline Cloudflare tunnel spawning logic (superseded
  by the already-existing standalone `scripts/dev-tunnel.mjs`) and two
  `console.debug` env dumps that produce excessive log noise on every
  config load.

## Non-goals

- Extracting shared code into `packages/*`.
- Relocating `tests/` or `patches/` (revisit later).
- Changing the Storybook workspace package.
- Changing CI workflows beyond what's strictly required for the move to keep
  working (no new pipelines, no publishing changes).

## Target layout

```
website/                    (workspace root — tooling only)
├── web/                    (NEW — the Next.js + Payload app)
│   ├── app/
│   ├── src/
│   ├── public/
│   ├── payload.config.ts
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── global.d.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── env.ts              (NEW — shared root-env loader helper)
│   └── package.json        (NEW)
├── storybook/               (unchanged)
├── packages/                (unchanged, empty, reserved for future use)
├── scripts/
│   └── dev-tunnel.mjs       (unchanged)
├── tests/                   (unchanged, stays root)
├── patches/                 (unchanged, stays root)
├── .env / .env.local / .env.example  (unchanged, stay root)
├── docker-compose.yml       (unchanged)
├── biome.json               (edited: includes point at web/)
├── turbo.json                (unchanged — already package-scoped)
├── pnpm-workspace.yaml       (edited: add 'web' to packages)
└── package.json              (edited: pared down to tooling)
```

## Design details

### 1. `package.json` split

**`web/package.json`** (new): receives all current root `dependencies`
verbatim, plus the app-related `devDependencies`: `typescript`, `@types/*`
(`node`, `react`, `react-dom`, `hyphen`, `jsdom`, `jsonwebtoken`,
`lodash-es`, `timestring`), `tailwindcss`, `postcss`, `autoprefixer`,
`cssnano`, `tailwind-merge`, `@tailwindcss/postcss`. Its `imports` field
(`#payload.css`, `#frontend.css`) moves with it since those paths are
relative to `src/`. Scripts carry over unchanged: `build`, `next`, `dev`,
`generate`, `generate:importmap`, `generate:types`, `migrate`, `payload`,
`start`.

**Root `package.json`**: keeps only monorepo-wide tooling
(`@biomejs/biome`, `turbo`, `syncpack`, `sort-package-json`) plus the
pnpm-mandatory root-level fields: `packageManager`, `resolutions`,
`patchedDependencies`, `engines`. Scripts become:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "pnpm --filter web run start",
    "migrate": "pnpm --filter web run migrate",
    "generate": "pnpm --filter web run generate",
    "lint": "biome check",
    "format": "biome format --write",
    "ci": "pnpm run migrate && pnpm run build",
    "ci:publish": "pnpm publish -r",
    "chore:reinstall": "pnpm --shell-mode exec rm -rf node_modules && pnpm --shell-mode exec rm pnpm-lock.yaml && pnpm --ignore-workspace install",
    "chore:sort": "sort-package-json"
  }
}
```

### 2. `pnpm-workspace.yaml`

Add `web` to the `packages` list (alongside `storybook` and `packages/*`).

### 3. Environment loading

Next.js auto-loads `.env*` files relative to its own project directory. With
the app moved to `web/`, that would stop finding the root-level `.env*`
files. Fix: add `web/env.ts`, a small helper that calls `loadEnvConfig` from
`@next/env` pointed at the repository root:

```ts
// web/env.ts
import { loadEnvConfig } from '@next/env'
import path from 'node:path'

export function loadRootEnv(dir: string) {
  loadEnvConfig(path.resolve(dir, '..'))
}
```

Both `web/next.config.ts` and `web/payload.config.ts` import and call this
at the top of their module, before anything reads `process.env`.
`payload.config.ts` needs its own call because Payload CLI commands
(`payload migrate`, `payload generate:types`) run standalone, outside of
Next's request lifecycle, and would otherwise never see the root env vars.

`@next/env` is added as an explicit dependency in `web/package.json`
(previously only a transitive dependency of `next`).

### 4. `next.config.ts` cleanup

Two changes beyond the plain relocation, both opportunistic cleanups
enabled by touching this file anyway:

- **Remove the inline Cloudflare tunnel logic** (`createTunnel`, the
  `ChildProcess`/`spawn` imports, and the `PHASE_DEVELOPMENT_SERVER`
  branch that invokes it). This responsibility is already covered by the
  standalone `scripts/dev-tunnel.mjs`, which spawns `next dev` itself via a
  `cloudflared` quick tunnel — the two mechanisms are redundant and only one
  (the standalone script) should remain as the supported path. Reconciling
  which tunnel *mechanism* to standardize on long-term (`wrangler` named
  tunnel vs. `cloudflared` quick tunnel) is out of scope for this pass;
  this design just removes the copy embedded in `next.config.ts`.
- **Remove the two `console.debug` calls** (`console.debug(process.env)`
  and `console.debug(parsedEnv.data)`) that dump the full/parsed
  environment on every config load — this is the "logs are not great"
  noise flagged at the start of this work. Nothing downstream depends on
  this output.

All other config (webpack aliases, `images`, `turbopack`, `rewrites`,
`serverExternalPackages`) is otherwise moved as-is — the relative paths
inside it (e.g. `./src/access`) stay correct because `src/` moves together
with `next.config.ts`.

### 5. `tsconfig.json`

Moves into `web/` unchanged. Its `paths` (`./src/*`, `@payload-config`,
etc.) remain valid because the relative structure between `tsconfig.json`,
`src/`, and `payload.config.ts` is preserved.

### 6. `biome.json`

Update `files.includes`:
- `src/**/*` → `web/src/**/*`
- `app/**` → `web/app/**`
- `public/**` → `web/public/**`
- extend the root single-file globs (`/*.js`, `/*.ts`, etc.) to also match
  `web/*.{js,ts,tsx,json}` so `web/next.config.ts`, `web/payload.config.ts`,
  and `web/postcss.config.js` stay linted/formatted.

### 7. `turbo.json`

No structural change. It already scopes `outputs` and task dependencies
per-package (`^build`, `.next/**` relative to each package), so it works
correctly once `web/` is the package producing those outputs.

### 8. Mechanical moves

`git mv` the following into `web/`: `app/`, `src/`, `public/`,
`payload.config.ts`, `next.config.ts`, `next-env.d.ts`, `global.d.ts`,
`tsconfig.json`, `postcss.config.js`. New files: `web/package.json`,
`web/env.ts`.

Nothing else moves: `.env*`, `docker-compose.yml`, `scripts/`, `tests/`,
`patches/`, `.github/`, `README.md`, `turbo.json`, `pnpm-workspace.yaml`
stay at root (root `package.json` and `biome.json` are edited in place,
not moved).

## Verification

1. `pnpm install` at root — resolves the new `web` workspace member.
2. `pnpm --filter web exec tsc --noEmit` — confirms `tsconfig.json` paths
   and imports still resolve after the move.
3. `pnpm dev` (→ `turbo run dev`) — confirms the dev server starts, loads
   root env vars via the new `web/env.ts` helper, no longer spawns a
   tunnel from `next.config.ts`, and no longer prints the env dumps.
4. `pnpm build` (→ `turbo run build`) — confirms a production build
   succeeds from the new location.
5. `pnpm --filter web run migrate` — confirms Payload CLI commands see the
   root env vars via `payload.config.ts`'s own `loadRootEnv` call.
6. `pnpm --filter storybook dev` — confirms Storybook, untouched by this
   move, still works.

## Risks

- Any tooling or CI step that currently assumes the app lives at the
  workspace root (absolute or root-relative paths outside the files
  reviewed above) could break silently. Mitigated by the verification pass
  above, but a full CI dry-run is worth doing before merging.
- The pre-existing gap where `turbo.json` defines a `check-types` task but
  no package currently implements a `check-types` script is *not* fixed by
  this design — noted here so it isn't mistaken for something this move
  was supposed to address.
- `.github/dependabot.yml` currently lists `package-ecosystem: "bun"` for
  the root directory, which looks like a pre-existing mismatch (the repo
  uses pnpm) unrelated to this move — flagged here, not fixed, since it's
  out of scope.
