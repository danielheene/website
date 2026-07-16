# Font Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the four PP font families (PP Frama, PP Frama Text, PP Supply Sans, PP Supply Mono) out of `web/` into four self-contained workspace packages, each exposing a ready-to-use Next.js font object and a ready-to-use react-pdf font config, then delete the old duplicated font files.

**Architecture:** One package per family under `packages/font-pp-<name>/`, each bundling its own `.woff2`+`.ttf` files under `src/files/` and exposing two subpath exports: `./next` (calls `next/font/local`'s `localFont()` with a literal `src` array) and `./pdf` (a literal react-pdf `Font.register`-shaped config object reading local `.ttf` paths). No shared manifest — confirmed via a live prototype that `next/font/local`'s SWC transform requires a literal array at the call site, so `next.ts` can never consume computed data anyway; `pdf.ts` mirrors the same literal-list style instead of introducing an manifest only it would use.

**Tech Stack:** pnpm workspaces, `tsup` (cjs+esm+dts build, matching the existing `packages/font-pp-frama` scaffold), `next/font/local`, `@react-pdf/renderer`'s `Font.register`.

## Global Constraints

- No visual/typographic changes: weights, styles, `fallback` arrays, and `adjustFontFallback` values must be copied verbatim from the current `web/src/fonts/<name>.ts` files.
- `pp-supply-sans` and `pp-supply-mono` only have **normal**-style font files on disk (no separate italic files) — their current `web/src/pdf/fonts/<name>.ts` register each weight **twice**, once as `fontStyle: 'normal'` and once as `fontStyle: 'italic'`, both pointing at the same `.ttf` file. This exact duplication must be preserved in the new `pdf.ts` files, not "fixed."
- The react-pdf side must stop depending on `process.env.SERVER_URL` / HTTP fetch — `pdf.ts` resolves `.ttf` files locally via `import.meta.url` + `node:path`.
- Do not modify `web/env.ts` or `web/next.config.ts` — both have unrelated, in-progress work on this branch.
- Package name scope: `@danielheene/font-<name>`, matching the existing `packages/font-pp-frama` scaffold.
- `next` must be a `peerDependency` (or otherwise not hard-pinned) in each package, since `web/` runs Next.js 16.2.10 and `storybook/` runs Next.js 15.3.9 — both need to compile `./next`'s source directly.

---

## File Reference: exact data to preserve per family

### PP Frama (already prototyped in `packages/font-pp-frama/src/next.ts` — reuse as-is)

Weights: 100, 200, 300, 400, 500, 700, 900 — normal + italic each (14 files).
`adjustFontFallback: false`, fallback: `['ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']`.

### PP Frama Text

Weights: 300, 400, 700 — normal + italic each (6 files).
`adjustFontFallback: 'Arial'`, fallback: same array as PP Frama.

### PP Supply Sans

Weights: 200, 400, 500, 700 — **normal only** (4 files on disk).
`adjustFontFallback: false`, fallback: same array as PP Frama.
PDF config registers each weight twice (normal + italic, same file) — see Global Constraints.

### PP Supply Mono

Weights: 200, 400, 500, 700 — **normal only** (4 files on disk).
`adjustFontFallback: false`, fallback: `['ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono']`.
PDF config registers each weight twice (normal + italic, same file) — see Global Constraints.

---

### Task 1: Finish the `font-pp-frama` package (`next.ts` + `pdf.ts`, package.json, drop unused `index.ts`)

**Files:**
- Modify: `packages/font-pp-frama/package.json`
- Modify: `packages/font-pp-frama/src/next.ts` (already exists from the design-phase prototype — verify content matches below)
- Create: `packages/font-pp-frama/src/pdf.ts`
- Delete: `packages/font-pp-frama/src/index.ts`
- The `packages/font-pp-frama/src/files/*.woff2` files already exist (copied during the design spike) — verify all 14 are present; also copy the matching 14 `.ttf` files from `web/public/fonts/pp-frama/`.

**Interfaces:**
- Produces: `import PPFrama from '@danielheene/font-pp-frama/next'` → a `next/font/local` return object (has `.variable`, `.className`, etc.)
- Produces: `import PPFramaPdf from '@danielheene/font-pp-frama/pdf'` → `{ family: string, fonts: Array<{ src: string, fontWeight: number|string, fontStyle: 'normal'|'italic' }> }`

- [ ] **Step 1: Copy the `.ttf` files into the package**

```bash
cp /Users/daniel/Code/danielheene/website/web/public/fonts/pp-frama/*.ttf \
   /Users/daniel/Code/danielheene/website/packages/font-pp-frama/src/files/
ls /Users/daniel/Code/danielheene/website/packages/font-pp-frama/src/files/ | wc -l
```

Expected: `28` (14 `.woff2` + 14 `.ttf`).

- [ ] **Step 2: Verify `next.ts` content is exactly this**

File: `packages/font-pp-frama/src/next.ts`

```ts
import localFont from 'next/font/local'

export const PPFrama = localFont({
  variable: '--pp-frama',
  preload: true,
  src: [
    { path: './files/pp-frama-100-normal.woff2', weight: '100', style: 'normal' },
    { path: './files/pp-frama-100-italic.woff2', weight: '100', style: 'italic' },
    { path: './files/pp-frama-200-normal.woff2', weight: '200', style: 'normal' },
    { path: './files/pp-frama-200-italic.woff2', weight: '200', style: 'italic' },
    { path: './files/pp-frama-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './files/pp-frama-300-italic.woff2', weight: '300', style: 'italic' },
    { path: './files/pp-frama-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './files/pp-frama-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './files/pp-frama-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './files/pp-frama-500-italic.woff2', weight: '500', style: 'italic' },
    { path: './files/pp-frama-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './files/pp-frama-700-italic.woff2', weight: '700', style: 'italic' },
    { path: './files/pp-frama-900-normal.woff2', weight: '900', style: 'normal' },
    { path: './files/pp-frama-900-italic.woff2', weight: '900', style: 'italic' },
  ],
  adjustFontFallback: false,
  display: 'swap',
  fallback: [
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
})

export default PPFrama
```

- [ ] **Step 3: Write `pdf.ts`**

File: `packages/font-pp-frama/src/pdf.ts`

```ts
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Frama',
  fonts: [
    { src: path.join(dirname, './files/pp-frama-100-italic.ttf'), fontWeight: 100, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-100-normal.ttf'), fontWeight: 100, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-200-italic.ttf'), fontWeight: 200, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-200-normal.ttf'), fontWeight: 200, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-300-italic.ttf'), fontWeight: 300, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-300-normal.ttf'), fontWeight: 300, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-400-italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-400-normal.ttf'), fontWeight: 400, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-500-italic.ttf'), fontWeight: 500, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-500-normal.ttf'), fontWeight: 500, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-700-italic.ttf'), fontWeight: 700, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-700-normal.ttf'), fontWeight: 700, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-900-italic.ttf'), fontWeight: 900, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-900-normal.ttf'), fontWeight: 900, fontStyle: 'normal' },
  ],
}
```

- [ ] **Step 4: Delete the unused `index.ts` and update `package.json`**

```bash
rm /Users/daniel/Code/danielheene/website/packages/font-pp-frama/src/index.ts
```

File: `packages/font-pp-frama/package.json`

```json
{
  "name": "@danielheene/font-pp-frama",
  "type": "module",
  "exports": {
    "./next": "./src/next.ts",
    "./pdf": "./src/pdf.ts"
  },
  "sideEffects": false,
  "peerDependencies": {
    "next": ">=15"
  },
  "devDependencies": {
    "@types/node": "^26.1.1",
    "next": "^16.2.10"
  },
  "scripts": {
    "build": "pnpm run compile --clean",
    "compile": "tsup src/next.ts src/pdf.ts --format cjs,esm --minify --keep-names --dts",
    "dev": "pnpm run compile --watch"
  }
}
```

- [ ] **Step 5: Install and build the package**

```bash
cd /Users/daniel/Code/danielheene/website
pnpm install --filter @danielheene/font-pp-frama
pnpm --filter @danielheene/font-pp-frama run build
```

Expected: build succeeds, producing `dist/next.js`, `dist/next.mjs`, `dist/next.d.ts`, `dist/pdf.js`, `dist/pdf.mjs`, `dist/pdf.d.ts`.

- [ ] **Step 6: Commit**

```bash
cd /Users/daniel/Code/danielheene/website
git add packages/font-pp-frama pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(fonts): finish font-pp-frama package with next and pdf exports

Adds the local pdf.ts react-pdf config (reading bundled ttf files
directly instead of over HTTP), removes the unused manifest-style
index.ts, and narrows package.json to the two subpath exports.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Create the `font-pp-frama-text` package

**Files:**
- Create: `packages/font-pp-frama-text/package.json`
- Create: `packages/font-pp-frama-text/src/next.ts`
- Create: `packages/font-pp-frama-text/src/pdf.ts`
- Create: `packages/font-pp-frama-text/src/files/*.woff2` + `*.ttf` (6 + 6 = 12 files, copied from `web/public/fonts/pp-frama-text/`)

**Interfaces:**
- Produces: `import PPFramaText from '@danielheene/font-pp-frama-text/next'`
- Produces: `import PPFramaTextPdf from '@danielheene/font-pp-frama-text/pdf'`

- [ ] **Step 1: Scaffold the package directory and copy font files**

```bash
mkdir -p /Users/daniel/Code/danielheene/website/packages/font-pp-frama-text/src/files
cp /Users/daniel/Code/danielheene/website/web/public/fonts/pp-frama-text/*.woff2 \
   /Users/daniel/Code/danielheene/website/web/public/fonts/pp-frama-text/*.ttf \
   /Users/daniel/Code/danielheene/website/packages/font-pp-frama-text/src/files/
ls /Users/daniel/Code/danielheene/website/packages/font-pp-frama-text/src/files/ | wc -l
```

Expected: `12`.

- [ ] **Step 2: Write `package.json`**

File: `packages/font-pp-frama-text/package.json`

```json
{
  "name": "@danielheene/font-pp-frama-text",
  "type": "module",
  "exports": {
    "./next": "./src/next.ts",
    "./pdf": "./src/pdf.ts"
  },
  "sideEffects": false,
  "peerDependencies": {
    "next": ">=15"
  },
  "devDependencies": {
    "@types/node": "^26.1.1",
    "next": "^16.2.10"
  },
  "scripts": {
    "build": "pnpm run compile --clean",
    "compile": "tsup src/next.ts src/pdf.ts --format cjs,esm --minify --keep-names --dts",
    "dev": "pnpm run compile --watch"
  }
}
```

- [ ] **Step 3: Write `next.ts`**

File: `packages/font-pp-frama-text/src/next.ts`

```ts
import localFont from 'next/font/local'

export const PPFramaText = localFont({
  variable: '--pp-frama-text',
  preload: true,
  src: [
    { path: './files/pp-frama-text-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './files/pp-frama-text-300-italic.woff2', weight: '300', style: 'italic' },
    { path: './files/pp-frama-text-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './files/pp-frama-text-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './files/pp-frama-text-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './files/pp-frama-text-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  adjustFontFallback: 'Arial',
  display: 'swap',
  fallback: [
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
})

export default PPFramaText
```

- [ ] **Step 4: Write `pdf.ts`**

File: `packages/font-pp-frama-text/src/pdf.ts`

```ts
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Frama Text',
  fonts: [
    { src: path.join(dirname, './files/pp-frama-text-300-italic.ttf'), fontWeight: 300, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-text-300-normal.ttf'), fontWeight: 300, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-text-400-italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-text-400-normal.ttf'), fontWeight: 400, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-text-700-italic.ttf'), fontWeight: 700, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-text-700-normal.ttf'), fontWeight: 700, fontStyle: 'normal' },
  ],
}
```

- [ ] **Step 5: Add to workspace, install, build**

```bash
cd /Users/daniel/Code/danielheene/website
pnpm install --filter @danielheene/font-pp-frama-text
pnpm --filter @danielheene/font-pp-frama-text run build
```

Expected: build succeeds, `dist/next.*` and `dist/pdf.*` produced.

- [ ] **Step 6: Commit**

```bash
cd /Users/daniel/Code/danielheene/website
git add packages/font-pp-frama-text pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(fonts): add font-pp-frama-text package

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Create the `font-pp-supply-sans` package (normal-only files, doubled PDF styles)

**Files:**
- Create: `packages/font-pp-supply-sans/package.json`
- Create: `packages/font-pp-supply-sans/src/next.ts`
- Create: `packages/font-pp-supply-sans/src/pdf.ts`
- Create: `packages/font-pp-supply-sans/src/files/*.woff2` + `*.ttf` (4 + 4 = 8 files, copied from `web/public/fonts/pp-supply-sans/`)

**Interfaces:**
- Produces: `import PPSupplySans from '@danielheene/font-pp-supply-sans/next'`
- Produces: `import PPSupplySansPdf from '@danielheene/font-pp-supply-sans/pdf'`

- [ ] **Step 1: Scaffold the package directory and copy font files**

```bash
mkdir -p /Users/daniel/Code/danielheene/website/packages/font-pp-supply-sans/src/files
cp /Users/daniel/Code/danielheene/website/web/public/fonts/pp-supply-sans/*.woff2 \
   /Users/daniel/Code/danielheene/website/web/public/fonts/pp-supply-sans/*.ttf \
   /Users/daniel/Code/danielheene/website/packages/font-pp-supply-sans/src/files/
ls /Users/daniel/Code/danielheene/website/packages/font-pp-supply-sans/src/files/ | wc -l
```

Expected: `8`.

- [ ] **Step 2: Write `package.json`**

File: `packages/font-pp-supply-sans/package.json`

```json
{
  "name": "@danielheene/font-pp-supply-sans",
  "type": "module",
  "exports": {
    "./next": "./src/next.ts",
    "./pdf": "./src/pdf.ts"
  },
  "sideEffects": false,
  "peerDependencies": {
    "next": ">=15"
  },
  "devDependencies": {
    "@types/node": "^26.1.1",
    "next": "^16.2.10"
  },
  "scripts": {
    "build": "pnpm run compile --clean",
    "compile": "tsup src/next.ts src/pdf.ts --format cjs,esm --minify --keep-names --dts",
    "dev": "pnpm run compile --watch"
  }
}
```

- [ ] **Step 3: Write `next.ts`**

File: `packages/font-pp-supply-sans/src/next.ts`

```ts
import localFont from 'next/font/local'

export const PPSupplySans = localFont({
  variable: '--pp-supply-sans',
  preload: true,
  src: [
    { path: './files/pp-supply-sans-200.woff2', weight: '200', style: 'normal' },
    { path: './files/pp-supply-sans-400.woff2', weight: '400', style: 'normal' },
    { path: './files/pp-supply-sans-500.woff2', weight: '500', style: 'normal' },
    { path: './files/pp-supply-sans-700.woff2', weight: '700', style: 'normal' },
  ],
  adjustFontFallback: false,
  display: 'swap',
  fallback: [
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
})

export default PPSupplySans
```

- [ ] **Step 4: Write `pdf.ts`** — note each weight is registered twice (normal + italic pointing at the same file), matching current behavior in `web/src/pdf/fonts/pp-supply-sans.ts`

File: `packages/font-pp-supply-sans/src/pdf.ts`

```ts
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Supply Sans',
  fonts: [
    { src: path.join(dirname, './files/pp-supply-sans-200.ttf'), fontWeight: 200, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-200.ttf'), fontWeight: 200, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-sans-400.ttf'), fontWeight: 400, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-400.ttf'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-sans-500.ttf'), fontWeight: 500, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-500.ttf'), fontWeight: 500, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-sans-700.ttf'), fontWeight: 700, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-700.ttf'), fontWeight: 700, fontStyle: 'italic' },
  ],
}
```

- [ ] **Step 5: Add to workspace, install, build**

```bash
cd /Users/daniel/Code/danielheene/website
pnpm install --filter @danielheene/font-pp-supply-sans
pnpm --filter @danielheene/font-pp-supply-sans run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
cd /Users/daniel/Code/danielheene/website
git add packages/font-pp-supply-sans pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(fonts): add font-pp-supply-sans package

Preserves the existing behavior of registering each weight twice in
the react-pdf config (normal and italic both pointing at the same
file), since no separate italic files exist for this family.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create the `font-pp-supply-mono` package (normal-only files, doubled PDF styles)

**Files:**
- Create: `packages/font-pp-supply-mono/package.json`
- Create: `packages/font-pp-supply-mono/src/next.ts`
- Create: `packages/font-pp-supply-mono/src/pdf.ts`
- Create: `packages/font-pp-supply-mono/src/files/*.woff2` + `*.ttf` (4 + 4 = 8 files, copied from `web/public/fonts/pp-supply-mono/`)

**Interfaces:**
- Produces: `import PPSupplyMono from '@danielheene/font-pp-supply-mono/next'`
- Produces: `import PPSupplyMonoPdf from '@danielheene/font-pp-supply-mono/pdf'`

- [ ] **Step 1: Scaffold the package directory and copy font files**

```bash
mkdir -p /Users/daniel/Code/danielheene/website/packages/font-pp-supply-mono/src/files
cp /Users/daniel/Code/danielheene/website/web/public/fonts/pp-supply-mono/*.woff2 \
   /Users/daniel/Code/danielheene/website/web/public/fonts/pp-supply-mono/*.ttf \
   /Users/daniel/Code/danielheene/website/packages/font-pp-supply-mono/src/files/
ls /Users/daniel/Code/danielheene/website/packages/font-pp-supply-mono/src/files/ | wc -l
```

Expected: `8`.

- [ ] **Step 2: Write `package.json`**

File: `packages/font-pp-supply-mono/package.json`

```json
{
  "name": "@danielheene/font-pp-supply-mono",
  "type": "module",
  "exports": {
    "./next": "./src/next.ts",
    "./pdf": "./src/pdf.ts"
  },
  "sideEffects": false,
  "peerDependencies": {
    "next": ">=15"
  },
  "devDependencies": {
    "@types/node": "^26.1.1",
    "next": "^16.2.10"
  },
  "scripts": {
    "build": "pnpm run compile --clean",
    "compile": "tsup src/next.ts src/pdf.ts --format cjs,esm --minify --keep-names --dts",
    "dev": "pnpm run compile --watch"
  }
}
```

- [ ] **Step 3: Write `next.ts`**

File: `packages/font-pp-supply-mono/src/next.ts`

```ts
import localFont from 'next/font/local'

export const PPSupplyMono = localFont({
  variable: '--pp-supply-mono',
  preload: true,
  src: [
    { path: './files/pp-supply-mono-200.woff2', weight: '200', style: 'normal' },
    { path: './files/pp-supply-mono-400.woff2', weight: '400', style: 'normal' },
    { path: './files/pp-supply-mono-500.woff2', weight: '500', style: 'normal' },
    { path: './files/pp-supply-mono-700.woff2', weight: '700', style: 'normal' },
  ],
  adjustFontFallback: false,
  display: 'swap',
  fallback: [
    'ui-monospace',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
  ],
})

export default PPSupplyMono
```

- [ ] **Step 4: Write `pdf.ts`** — same doubled-style pattern as `pp-supply-sans`, matching `web/src/pdf/fonts/pp-supply-mono.ts`

File: `packages/font-pp-supply-mono/src/pdf.ts`

```ts
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Supply Mono',
  fonts: [
    { src: path.join(dirname, './files/pp-supply-mono-200.ttf'), fontWeight: 200, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-mono-200.ttf'), fontWeight: 200, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-mono-400.ttf'), fontWeight: 400, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-mono-400.ttf'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-mono-500.ttf'), fontWeight: 500, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-mono-500.ttf'), fontWeight: 500, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-mono-700.ttf'), fontWeight: 700, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-mono-700.ttf'), fontWeight: 700, fontStyle: 'italic' },
  ],
}
```

- [ ] **Step 5: Add to workspace, install, build**

```bash
cd /Users/daniel/Code/danielheene/website
pnpm install --filter @danielheene/font-pp-supply-mono
pnpm --filter @danielheene/font-pp-supply-mono run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
cd /Users/daniel/Code/danielheene/website
git add packages/font-pp-supply-mono pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(fonts): add font-pp-supply-mono package

Preserves the existing behavior of registering each weight twice in
the react-pdf config (normal and italic both pointing at the same
file), since no separate italic files exist for this family.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Switch `web/` Next.js consumers to the new packages

**Files:**
- Modify: `web/package.json` (add 3 remaining `workspace:*` deps — `@danielheene/font-pp-frama` is already there from the design spike)
- Modify: `web/app/(frontend)/layout.tsx:14-17`
- Modify: `web/app/(payload)/layout.tsx:11-14`

**Interfaces:**
- Consumes: `@danielheene/font-pp-frama/next` (Task 1), `@danielheene/font-pp-frama-text/next` (Task 2), `@danielheene/font-pp-supply-sans/next` (Task 3), `@danielheene/font-pp-supply-mono/next` (Task 4) — each a default export from `next/font/local`.

- [ ] **Step 1: Add remaining workspace dependencies to `web/package.json`**

In `web/package.json`, alongside the existing `"@danielheene/font-pp-frama": "workspace:*"` line, add:

```json
    "@danielheene/font-pp-frama-text": "workspace:*",
    "@danielheene/font-pp-supply-mono": "workspace:*",
    "@danielheene/font-pp-supply-sans": "workspace:*",
```

(Keep dependencies alphabetically sorted, matching the existing list style.)

- [ ] **Step 2: Update `web/app/(frontend)/layout.tsx` imports**

Find (around line 14-17):

```ts
import PPFrama from '@danielheene/font-pp-frama/next'
import PPFramaText from '@/fonts/pp-frama-text'
import PPSupplyMono from '@/fonts/pp-supply-mono'
import PPSupplySans from '@/fonts/pp-supply-sans'
```

Replace with:

```ts
import PPFrama from '@danielheene/font-pp-frama/next'
import PPFramaText from '@danielheene/font-pp-frama-text/next'
import PPSupplyMono from '@danielheene/font-pp-supply-mono/next'
import PPSupplySans from '@danielheene/font-pp-supply-sans/next'
```

- [ ] **Step 3: Update `web/app/(payload)/layout.tsx` imports**

Find (around line 11-14):

```ts
import PPFrama from '@/fonts/pp-frama'
import PPFramaText from '@/fonts/pp-frama-text'
import PPSupplyMono from '@/fonts/pp-supply-mono'
import PPSupplySans from '@/fonts/pp-supply-sans'
```

Replace with:

```ts
import PPFrama from '@danielheene/font-pp-frama/next'
import PPFramaText from '@danielheene/font-pp-frama-text/next'
import PPSupplyMono from '@danielheene/font-pp-supply-mono/next'
import PPSupplySans from '@danielheene/font-pp-supply-sans/next'
```

- [ ] **Step 4: Install workspace links**

```bash
cd /Users/daniel/Code/danielheene/website
pnpm install --filter web
ls -la web/node_modules/@danielheene/
```

Expected: symlinks for all four `font-pp-*` packages pointing into `../../../packages/font-pp-*`.

- [ ] **Step 5: Type-check `web/`**

```bash
cd /Users/daniel/Code/danielheene/website/web
pnpm exec tsc --noEmit -p tsconfig.json 2>&1 | grep -i "font-pp\|pp-frama\|pp-supply"
```

Expected: no output (no errors referencing the font imports).

- [ ] **Step 6: Manually verify with `next dev`** (do this before deleting old files in Task 7, so there's still a fallback if something's wrong)

```bash
cd /Users/daniel/Code/danielheene/website/web
pnpm run dev
```

Open `http://localhost:3000` (or whatever port is configured) in a browser, confirm the page loads with fonts rendering identically to before (PP Frama body text, PP Supply Sans/Mono headers). Check the browser devtools Network tab for `4xx`/`5xx` on any `.woff2` request. Stop the dev server when done (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
cd /Users/daniel/Code/danielheene/website
git add web/package.json "web/app/(frontend)/layout.tsx" "web/app/(payload)/layout.tsx" pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
refactor(web): switch Next.js font imports to the new font packages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Switch `web/src/pdf` react-pdf consumers to the new packages

**Files:**
- Modify: `web/src/pdf/fonts/index.ts`
- Delete: `web/src/pdf/fonts/pp-frama.ts`
- Delete: `web/src/pdf/fonts/pp-frama-text.ts`
- Delete: `web/src/pdf/fonts/pp-supply-sans.ts`
- Delete: `web/src/pdf/fonts/pp-supply-mono.ts`

**Interfaces:**
- Consumes: `@danielheene/font-pp-frama/pdf`, `@danielheene/font-pp-frama-text/pdf`, `@danielheene/font-pp-supply-sans/pdf`, `@danielheene/font-pp-supply-mono/pdf` — each a default export shaped `{ family: string, fonts: Array<{ src: string, fontWeight: number, fontStyle: 'normal'|'italic' }> }`.
- Produces: `registerFonts` keeps its existing signature (`registerFonts(['PPFrama', 'PPFramaText', 'PPSupplyMono', 'PPSupplySans']) => Record<FontName, string>`), unchanged for callers in `web/src/pdf/constants.ts`.

- [ ] **Step 1: Update `web/src/pdf/fonts/index.ts` imports**

Current content:

```ts
import { Font } from '@react-pdf/renderer'

import PPFrama from './pp-frama'
import PPFramaText from './pp-frama-text'
import PPSupplyMono from './pp-supply-mono'
import PPSupplySans from './pp-supply-sans'

const fontMap = {
  PPFrama: PPFrama,
  PPFramaText: PPFramaText,
  PPSupplyMono: PPSupplyMono,
  PPSupplySans: PPSupplySans,
}

type FontName = keyof typeof fontMap

export const registerFonts = <T extends FontName[], K extends T[number]>(fonts: T) => {
  const registeredFonts = {}

  for (const font of fonts) {
    Font.register(fontMap[font] as Parameters<typeof Font.register>[number])
    Font.getRegisteredFonts()
    registeredFonts[font] = fontMap[font].family
  }

  return registeredFonts as Record<K, string>
}
```

Replace the four `import ... from './pp-*'` lines with:

```ts
import PPFrama from '@danielheene/font-pp-frama/pdf'
import PPFramaText from '@danielheene/font-pp-frama-text/pdf'
import PPSupplyMono from '@danielheene/font-pp-supply-mono/pdf'
import PPSupplySans from '@danielheene/font-pp-supply-sans/pdf'
```

(The rest of the file — `fontMap`, `FontName`, `registerFonts` — stays unchanged.)

- [ ] **Step 2: Add the same 4 workspace deps to `web/package.json` if not already covered by Task 5**

Skip this step if Task 5 already added all four `@danielheene/font-pp-*` deps to `web/package.json` — it does the same for both the `/next` and `/pdf` subpaths, so no additional dependency entries are needed here.

- [ ] **Step 3: Delete the old per-family pdf font files**

```bash
rm /Users/daniel/Code/danielheene/website/web/src/pdf/fonts/pp-frama.ts
rm /Users/daniel/Code/danielheene/website/web/src/pdf/fonts/pp-frama-text.ts
rm /Users/daniel/Code/danielheene/website/web/src/pdf/fonts/pp-supply-sans.ts
rm /Users/daniel/Code/danielheene/website/web/src/pdf/fonts/pp-supply-mono.ts
ls /Users/daniel/Code/danielheene/website/web/src/pdf/fonts/
```

Expected: only `index.ts` remains.

- [ ] **Step 4: Type-check**

```bash
cd /Users/daniel/Code/danielheene/website/web
pnpm exec tsc --noEmit -p tsconfig.json 2>&1 | grep -i "pdf/fonts\|font-pp"
```

Expected: no output.

- [ ] **Step 5: Render the résumé PDF and verify fonts load without `SERVER_URL`**

```bash
cd /Users/daniel/Code/danielheene/website/web
pnpm run dev
```

In another terminal, once the dev server is up:

```bash
curl -s -o /tmp/resume-test.pdf -w "%{http_code}\n" "http://localhost:3000/download/resume.pdf?locale=en"
file /tmp/resume-test.pdf
```

Expected: `200`, and `file` reports a valid PDF document. Open `/tmp/resume-test.pdf` and visually confirm all four font families render (body text in PP Frama, headers in PP Supply Sans, job intervals in PP Supply Mono, introduction in PP Frama Text) — compare against a resume PDF generated before this change if uncertain. Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
cd /Users/daniel/Code/danielheene/website
git add web/src/pdf/fonts/index.ts web/package.json
git rm web/src/pdf/fonts/pp-frama.ts web/src/pdf/fonts/pp-frama-text.ts web/src/pdf/fonts/pp-supply-sans.ts web/src/pdf/fonts/pp-supply-mono.ts
git commit -m "$(cat <<'EOF'
refactor(pdf): switch react-pdf font configs to the new font packages

react-pdf font loading no longer depends on process.env.SERVER_URL /
HTTP fetch at render time -- fonts are read from local files bundled
in each @danielheene/font-pp-* package.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Switch Storybook to the new package and delete old `web/src/fonts` + `web/public/fonts`

**Files:**
- Modify: `storybook/.storybook/preview.tsx`
- Modify: `storybook/package.json` (add `@danielheene/font-pp-frama` as a `workspace:*` dependency)
- Delete: `web/src/fonts/pp-frama.ts`, `web/src/fonts/pp-frama-text.ts`, `web/src/fonts/pp-supply-sans.ts`, `web/src/fonts/pp-supply-mono.ts`
- Delete: `web/public/fonts/pp-frama/`, `web/public/fonts/pp-frama-text/`, `web/public/fonts/pp-supply-sans/`, `web/public/fonts/pp-supply-mono/` (entire directories)

**Interfaces:**
- Consumes: `@danielheene/font-pp-frama/next` (Task 1).

- [ ] **Step 1: Update `storybook/.storybook/preview.tsx`**

Find:

```ts
import { PPFrama } from '../../web/src/fonts/pp-frama.ts'
```

Replace with:

```ts
import { PPFrama } from '@danielheene/font-pp-frama/next'
```

- [ ] **Step 2: Add the workspace dependency to `storybook/package.json`**

In `storybook/package.json`, add alongside existing dependencies (keep alphabetical):

```json
    "@danielheene/font-pp-frama": "workspace:*",
```

- [ ] **Step 3: Install and verify Storybook still resolves the import**

```bash
cd /Users/daniel/Code/danielheene/website
pnpm install --filter storybook
ls -la storybook/node_modules/@danielheene/
```

Expected: a symlink `@danielheene/font-pp-frama -> ../../../packages/font-pp-frama`.

- [ ] **Step 4: Run Storybook and visually confirm PP Frama still renders**

```bash
cd /Users/daniel/Code/danielheene/website/storybook
pnpm run dev
```

Open the Storybook URL printed in the terminal, pick any story, and confirm text renders in PP Frama (no fallback/system font visible, no console errors about the font). Stop the dev server when done.

- [ ] **Step 5: Delete the old per-family Next.js font files in `web/src/fonts`**

```bash
rm /Users/daniel/Code/danielheene/website/web/src/fonts/pp-frama.ts
rm /Users/daniel/Code/danielheene/website/web/src/fonts/pp-frama-text.ts
rm /Users/daniel/Code/danielheene/website/web/src/fonts/pp-supply-sans.ts
rm /Users/daniel/Code/danielheene/website/web/src/fonts/pp-supply-mono.ts
ls /Users/daniel/Code/danielheene/website/web/src/fonts/ 2>&1
```

Expected: either the directory no longer exists or is empty (`no such file or directory` is fine — confirms full cleanup).

- [ ] **Step 6: Delete the old duplicated font asset directories from `web/public/fonts`**

```bash
rm -rf /Users/daniel/Code/danielheene/website/web/public/fonts/pp-frama
rm -rf /Users/daniel/Code/danielheene/website/web/public/fonts/pp-frama-text
rm -rf /Users/daniel/Code/danielheene/website/web/public/fonts/pp-supply-sans
rm -rf /Users/daniel/Code/danielheene/website/web/public/fonts/pp-supply-mono
ls /Users/daniel/Code/danielheene/website/web/public/fonts/ 2>&1
```

Expected: directory no longer exists, or empty, or contains only unrelated font families (if any exist beyond these four — verify none of the four family names remain).

- [ ] **Step 7: Re-run the full type-check and build for `web/` to confirm nothing still references the deleted files**

```bash
cd /Users/daniel/Code/danielheene/website/web
pnpm exec tsc --noEmit -p tsconfig.json 2>&1 | grep -i "cannot find\|fonts/pp-"
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
cd /Users/daniel/Code/danielheene/website
git add storybook/.storybook/preview.tsx storybook/package.json pnpm-lock.yaml
git rm -r web/src/fonts web/public/fonts/pp-frama web/public/fonts/pp-frama-text web/public/fonts/pp-supply-sans web/public/fonts/pp-supply-mono
git commit -m "$(cat <<'EOF'
refactor(fonts): switch Storybook to font package, delete old font files

Deletes web/src/fonts/*.ts and the four duplicated font asset
directories under web/public/fonts/ now that every consumer (web
Next.js layouts, react-pdf, Storybook) imports fonts from the
@danielheene/font-pp-* workspace packages instead.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Final full-repo verification

**Files:** none (verification only).

- [ ] **Step 1: Confirm no remaining references to the deleted paths anywhere in the repo**

```bash
cd /Users/daniel/Code/danielheene/website
grep -rn "@/fonts/pp-\|src/fonts/pp-\|public/fonts/pp-frama\b\|public/fonts/pp-frama-text\|public/fonts/pp-supply-sans\|public/fonts/pp-supply-mono\|SERVER_URL}/fonts/" \
  --include="*.ts" --include="*.tsx" web storybook 2>/dev/null
```

Expected: no output.

- [ ] **Step 2: Build every workspace package**

```bash
cd /Users/daniel/Code/danielheene/website
pnpm --filter "./packages/font-pp-*" run build
```

Expected: all four packages report a successful `tsup` build.

- [ ] **Step 3: Full `web` type-check**

```bash
cd /Users/daniel/Code/danielheene/website/web
pnpm exec tsc --noEmit -p tsconfig.json
```

Expected: exits `0` with no errors.

- [ ] **Step 4: Full `web` production build**

```bash
cd /Users/daniel/Code/danielheene/website/web
pnpm exec next build
```

Expected: build completes (this may still hit the unrelated, pre-existing `web/env.ts` validation issue on this branch — if it fails with the `SERVER_HOST`/`PAYLOAD_SECRET`/etc. "Invalid input: expected string, received undefined" errors seen during the design spike, that confirms the failure is the known unrelated env-loader bug, not a font regression; capture the output and flag it rather than treating it as a task failure).

- [ ] **Step 5: Report final state to the user**

Summarize: all four packages built, `web`/`storybook` type-check clean, dev-mode visual checks passed for both the frontend layout and the résumé PDF, old font files fully removed. Note whether the `next build` env-loader issue was hit (pre-existing, unrelated) or not.

---

## Self-Review Notes

- **Spec coverage:** every spec section has a corresponding task — package layout (Tasks 1-4), `next.ts`/`pdf.ts` design (Tasks 1-4), migration/cleanup (Tasks 5-7), testing (Task 8 + per-task manual checks).
- **Placeholder scan:** no TBD/TODO; every step has literal file content or an exact command.
- **Type consistency:** `registerFonts`'s `fontMap` values are the `pdf.ts` default exports (`{ family, fonts }`), matching `Font.register`'s expected shape — unchanged from today. `next.ts` default exports are consumed identically to the current `web/src/fonts/<name>.ts` default exports (both are `next/font/local` return objects with `.variable`).
