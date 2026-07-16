---
title: Extract fonts into standalone workspace packages
date: 2026-07-16
status: approved
---

# Extract fonts into standalone workspace packages

## Problem

The site uses four PP font families — PP Frama, PP Frama Text, PP Supply Sans,
PP Supply Mono. Today each family's files live under `web/public/fonts/<name>/`
(both `.woff2` for the browser and `.ttf` for PDF rendering), with two separate,
hand-written consumers:

- `web/src/fonts/<name>.ts` — a `next/font/local` call for the Next.js app and
  Storybook, pointing at the `.woff2` files via a relative path into
  `web/public/fonts`.
- `web/src/pdf/fonts/<name>.ts` — a `react-pdf` `Font.register` config for the
  résumé PDF (`web/src/pdf`), fetching `.ttf` files over HTTP at render time via
  `${process.env.SERVER_URL}/fonts/<name>/...ttf` (served from Payload's public
  folder).

There's no single source of truth per font family, the PDF path depends on
`SERVER_URL` being reachable at render time, and the fonts aren't reusable
outside `web/`. One package (`packages/font-pp-frama`) was already scaffolded
but is incomplete (its `next.ts`-equivalent still points back at
`../../public/fonts/...`, i.e. it isn't self-contained).

## Goals

- Each font family becomes one self-contained, portable workspace package that
  bundles its own font files.
- Each package exposes both a ready-to-use Next.js font object and a
  ready-to-use react-pdf font config.
- The react-pdf side stops depending on `SERVER_URL`/HTTP fetch and reads its
  `.ttf` files locally instead.
- Old per-family files and duplicated font assets in `web/` are deleted once
  migrated.

## Non-goals

- No change to `web/env.ts` / `web/next.config.ts` (both have unrelated,
  in-progress work on this branch — out of scope here).
- No visual/typographic changes to any font (weights, styles, fallbacks stay
  identical to what's configured today).
- No support for consuming these packages outside this pnpm workspace (no
  publishing to a public registry).

## Feasibility spike (already run)

The core risk was whether `next/font/local`'s `localFont()` call can live
inside a separate workspace package and still work when imported into the
Next.js app — this is a known *open, unresolved* upstream issue
([vercel/next.js#51476](https://github.com/vercel/next.js/issues/51476)) in
some repo/bundler configurations, and `next/font/local`'s SWC transform
requires the `src` array at the `localFont()` call site to be a literal (not
computed via `.map()`/variables).

This was verified directly in this repo: `packages/font-pp-frama/src/next.ts`
was written calling `localFont()` with a literal `src` array against files
placed in `packages/font-pp-frama/src/files/`, linked into `web/` via the
existing pnpm workspace symlink (`web/node_modules/@danielheene/font-pp-frama
-> ../../../packages/font-pp-frama`), and imported as
`@danielheene/font-pp-frama/next` from a throwaway Next.js app inside `web/`.
Both `next build` and `next dev` compiled successfully; all 14 `.woff2` files
were correctly emitted under `/_next/static/media/`, preload `<link>` tags and
the CSS module class were generated, and the page served `200`. **The
cross-package pattern works in this repo's actual Next.js 16.2.10 + pnpm
setup.**

## Design

### Package layout

One package per family, matching the existing scaffold's naming:

- `@danielheene/font-pp-frama`
- `@danielheene/font-pp-frama-text`
- `@danielheene/font-pp-supply-sans`
- `@danielheene/font-pp-supply-mono`

Each package:

```
packages/font-pp-frama/
  package.json
  src/
    files/
      pp-frama-100-normal.woff2
      pp-frama-100-normal.ttf
      ... (one woff2 + one ttf per weight/style combination, matching
           today's web/public/fonts/pp-frama contents exactly)
    next.ts       # localFont() call (literal src array), exports the font object
    pdf.ts        # react-pdf Font.register config (literal fonts array)
```

`package.json` `exports`:

```json
{
  "./next": "./src/next.ts",
  "./pdf": "./src/pdf.ts"
}
```

Subpath exports keep `next/font/local` (a Next.js-only API) out of the bundle
for consumers who only want the react-pdf config, and vice versa.

No shared manifest: `next/font/local`'s SWC transform requires the `src` array
at the `localFont()` call site to be a literal (confirmed — the transform only
understands literal strings/numbers/objects/arrays, not calls or variable
references), so `next.ts` can't consume a shared data structure anyway. Since
`next.ts` must hardcode its file list as a literal regardless, having `pdf.ts`
read from a separate manifest would only serve one consumer — that's
indirection without payoff. Both `next.ts` and `pdf.ts` hardcode their own
literal file list directly. Each family has ~6–14 short entries and fonts
change rarely, so the duplication is low-risk.

### next.ts

```ts
import localFont from 'next/font/local'

export const PPFrama = localFont({
  variable: '--pp-frama',
  preload: true,
  src: [
    { path: './files/pp-frama-100-normal.woff2', weight: '100', style: 'normal' },
    // ... one literal entry per file, matching pdf.ts's file list
  ],
  adjustFontFallback: false, // or the family-specific fallback value used today
  display: 'swap',
  fallback: [ /* unchanged from today's web/src/fonts/<name>.ts */ ],
})

export default PPFrama
```

Behavior (weights, styles, fallback fonts, `adjustFontFallback`, `display`)
carries over unchanged from the current `web/src/fonts/<name>.ts` files.

### pdf.ts

```ts
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Frama',
  fonts: [
    {
      src: path.join(dirname, './files/pp-frama-100-normal.ttf'),
      fontWeight: '100',
      fontStyle: 'normal',
    },
    // ... one literal entry per file, matching next.ts's file list
  ],
}
```

This replaces the current `${SERVER_URL}/fonts/<name>/...ttf` HTTP-fetch
pattern with a local file path resolved relative to the package's own files —
removing the `SERVER_URL` dependency for PDF font loading entirely.

### File formats

Every package ships both `.woff2` and `.ttf` for every weight/style, mirroring
exactly what exists in `web/public/fonts/<name>/` today (no per-package
variation based on current usage).

### Build

Same `tsup` pattern as the existing scaffold: `compile`/`build`/`dev` scripts
building `cjs` + `esm` + `.d.ts` for `next.ts`/`pdf.ts`. Static font
files under `src/files/` are not processed by tsup — they're referenced by
relative path from the built output, same directory layout as source.

### Migration and cleanup

Once all four packages exist and build correctly:

1. Update consumers to import from the new packages instead of the old paths:
   - `web/app/(frontend)/layout.tsx`, `web/app/(payload)/layout.tsx` — Next.js
     font imports (`@/fonts/<name>` → `@danielheene/font-<name>/next`).
   - `storybook/.storybook/preview.tsx` — same Next.js font import swap.
   - `web/src/pdf/constants.ts` (via `web/src/pdf/fonts/index.ts`'s
     `registerFonts`) — react-pdf font imports
     (`./pp-frama` etc. → `@danielheene/font-<name>/pdf`).
2. Delete `web/public/fonts/*` (all four family directories).
3. Delete `web/src/fonts/<name>.ts` for all four families.
4. Delete `web/src/pdf/fonts/<name>.ts` for all four families, keeping
   `web/src/pdf/fonts/index.ts`'s `registerFonts` helper but repointing its
   imports at the new packages.
5. Add each package as a `workspace:*` dependency in `web/package.json`
   (and `storybook/package.json` for the Next.js font subpath, since
   Storybook's preview also imports a Next.js font directly).

## Testing

- `pnpm build` at the root succeeds (all four packages compile via `tsup`).
- `next build` in `web/` succeeds using the new imports (already smoke-tested
  for `pp-frama` specifically in the feasibility spike).
- `next dev` in `web/` serves the frontend and payload admin layouts with all
  four fonts rendering (manual visual check — fonts are visually unchanged).
- The résumé PDF route (`web/app/(frontend)/download/resume.pdf/route.tsx`)
  renders correctly with all four font families and doesn't depend on
  `SERVER_URL` being set/reachable.
- Storybook (`storybook/.storybook/preview.tsx`) still loads `PPFrama`
  correctly.
