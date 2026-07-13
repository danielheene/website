# Storybook Doc-Block Tailwind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Storybook startup errors caused by imports of nonexistent modules (`@storybook/addon-themes`'s `styled`, `@storybook/components`'s `withReset`, `@storybook/theming` as a package) by migrating the three doc-block helper components (`Typeset`, `IconGallery`, `ColorPalette`) off Storybook's CSS-in-JS `styled`/`theming` system and onto the same Tailwind CSS v4 + `cn()` conventions the `web` app already uses.

**Architecture:** Wire the `storybook` workspace into the app's existing Tailwind v4 theme by importing `web/src/styles/frontend.css` from a new `storybook/src/styles.css`, loaded once in `storybook/.storybook/preview.tsx`. Add a local `cn()` utility (mirroring `web/src/lib/cn.ts`) so story components can compose Tailwind classes with `tailwind-merge`. Replace each `styled.div(...)` CSS-in-JS declaration with a plain element plus a `className` built from Tailwind utility classes, using the app's semantic color tokens (`text-foreground`, `border-border`, `bg-card`, etc.) in place of the Storybook `theme` object properties they replace.

**Tech Stack:** React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), `tailwind-merge`, `polished` (kept — still used for `transparentize`/`readableColor` math in `ColorPalette.tsx`), Storybook 10 (`@storybook/nextjs` framework, so PostCSS/Tailwind config is picked up the same way Next.js picks it up in `web/`).

## Global Constraints

- The `storybook` workspace currently has **no Tailwind CSS wired up at all** (no `postcss.config.js`, no CSS import in `storybook/.storybook/preview.tsx`) — Task 1 must establish this before any component migration, or Tailwind classes in later tasks will render unstyled.
- Reuse the app's existing design tokens (`web/src/styles/theme/*.css`) via a relative `@import` of `web/src/styles/frontend.css` — do not duplicate or hand-copy token values into a separate storybook stylesheet. This keeps `storybook` and `web` visually in sync automatically.
- Do not add a dark-mode toggle decorator (e.g. via `@storybook/addon-themes`'s `withThemeByDataAttribute`) — out of scope for this pass. `dark:` variant classes should still be written correctly (matching the original light/dark branching in the CSS-in-JS being replaced) even though there's no interactive way to preview them yet in Storybook.
- Where the original CSS-in-JS branched on `theme.base === 'light' ? X : Y`, preserve both values exactly using Tailwind's `dark:` variant (e.g. `text-foreground/40 dark:text-foreground/60`). Where it did not branch (a single value regardless of theme), do not add a `dark:` class.
- `Swatch`'s and `PrimaryLabel`'s colors in `ColorPalette.tsx` are **runtime-computed values** (a hex/rgb color passed as a prop, or computed via `polished`'s `readableColor`/`transparentize`) — these must stay as inline `style` props. Do not attempt to express them as static Tailwind classes.
- Every file this plan touches currently lives under `storybook/src/` (moved there from `storybook/stories/` during this same work session — confirm with `ls storybook/src/components/ storybook/src/stories/` before starting; if paths differ from what's written here, that's a sign the files moved again and the task should re-orient from the actual current location, not silently apply patches to a stale path).
- No test framework exists in the `storybook` workspace (confirmed: no Jest/Vitest, no `*.test.tsx` files). Verification for every task is: (1) `pnpm --filter storybook run build` completes with exit code 0 and prints no `Module not found` / `was not found in` warnings for the files touched in that task, and (2) `grep` confirms the touched file no longer imports `styled` from `storybook/theming` or `withReset` from `storybook/internal/components` (except where explicitly kept, noted per task).

---

### Task 1: Wire up Tailwind CSS and a `cn()` utility in the `storybook` workspace

**Files:**
- Create: `storybook/postcss.config.js`
- Create: `storybook/src/styles.css`
- Create: `storybook/src/lib/cn.ts`
- Modify: `storybook/.storybook/preview.tsx`
- Modify: `storybook/package.json`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` exported from `storybook/src/lib/cn.ts`, importable by later tasks as `import { cn } from '../lib/cn'` (from `storybook/src/components/*.tsx`) or `import { cn } from '../../lib/cn'` (from `storybook/src/stories/*.mdx`, if ever needed — not needed by Tasks 2-4).
- Produces: a global stylesheet loaded once for the whole Storybook preview, so every story/doc-block can use Tailwind utility classes and the app's semantic tokens (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `font-mono`, `font-sans`, etc.) without any further per-file setup.

- [ ] **Step 1: Add the Tailwind toolchain and `tailwind-merge` to `storybook/package.json`**

Read the current file first (`storybook/package.json`), then add these entries. Match `web/package.json`'s versions exactly for consistency:

```json
{
  "dependencies": {
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.4",
    "@tailwindcss/typography": "^0.5.20",
    "autoprefixer": "^10.5.0",
    "cssnano": "^8.0.1",
    "postcss": "^8.5.13",
    "tailwindcss": "^4.3.0"
  }
}
```

Merge these into the existing `dependencies`/`devDependencies` objects (don't remove anything already there). `@tailwindcss/typography` is required because `web/src/styles/frontend.css` (which Step 2 imports) contains `@plugin "@tailwindcss/typography";` — Tailwind v4 resolves `@plugin` via node resolution from the consuming package, so it must be installed in `storybook`'s own `node_modules`, not just `web`'s.

- [ ] **Step 2: Create `storybook/postcss.config.js`**

Identical shape to `web/postcss.config.js`:

```js
/* global process */

const config = {
  plugins: {
    autoprefixer: {},
    '@tailwindcss/postcss': {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
}

export default config
```

- [ ] **Step 3: Create `storybook/src/styles.css`**

```css
@import '../../web/src/styles/frontend.css';
```

This single-line import reuses the app's real stylesheet (Tailwind base/theme/utilities layers, all `theme/*.css` token partials, the `@tailwindcss/typography` plugin, the `@custom-variant dark` definition, and the `body`/`a` base-layer rules) so `storybook` and `web` never drift out of sync. `@storybook/nextjs` uses Next.js's own CSS/PostCSS pipeline (confirmed via `storybook/.storybook/main.ts`'s `framework: { name: getAbsolutePath('@storybook/nextjs') }`), so a relative `@import` reaching into the sibling `web` workspace resolves the same way Next.js already resolves `nextConfigPath: '../../web/next.config.ts'` and `staticDirs: ['../../web/public']` in that same file.

- [ ] **Step 4: Import the stylesheet once in `storybook/.storybook/preview.tsx`**

Read the current file first, then add the import as the first line:

```tsx
import '../src/styles.css'

import { definePreview } from '@storybook/nextjs'


export default definePreview({
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  addons: [],

})
```

- [ ] **Step 5: Create `storybook/src/lib/cn.ts`**

Exact mirror of `web/src/lib/cn.ts`:

```ts
import { ClassNameValue as ClassValue, twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]): string => twMerge(...inputs)
export type { ClassNameValue as ClassValue } from 'tailwind-merge'
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: lockfile updates for the `storybook` workspace, no errors.

- [ ] **Step 7: Verify the build picks up Tailwind**

Run: `pnpm --filter storybook run build`
Expected: exit code 0. Then run `grep -c "\.text-foreground" storybook/dist/assets/*.css` (path may vary — check `storybook/dist/` for the emitted CSS file if the glob doesn't match) and confirm it prints a number greater than 0, proving the `text-foreground` utility class was generated into the build output.

- [ ] **Step 8: Commit**

```bash
git add storybook/package.json storybook/postcss.config.js storybook/src/styles.css storybook/src/lib/cn.ts storybook/.storybook/preview.tsx pnpm-lock.yaml
git commit -m "chore(storybook): wire up Tailwind CSS and a cn() utility"
```

---

### Task 2: Migrate `_shared.tsx` and `Typeset.tsx` off `styled`/`theming`

**Files:**
- Modify: `storybook/src/components/_shared.tsx`
- Modify: `storybook/src/components/Typeset.tsx`

**Interfaces:**
- Consumes: `cn` from `../lib/cn` (Task 1).
- Produces: `blockBackgroundClassName: string`, exported from `storybook/src/components/_shared.tsx`, consumed by Task 3 (`IconGallery.tsx`'s `ItemSpecimen`) and Task 4 (`ColorPalette.tsx`'s `SwatchColors`) in place of the old `getBlockBackgroundStyle(theme)` function call.
- `Typeset`'s public API (`TypesetProps`, the `Typeset` component's props and behavior) is unchanged — this is a styling-implementation-only change.

- [ ] **Step 1: Replace `_shared.tsx`'s theme-based function with a static Tailwind class string**

Read the current file first (`storybook/src/components/_shared.tsx`), then replace its entire contents with:

```tsx
export const blockBackgroundClassName =
  'rounded-md border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.20)]'
```

This replaces `theme.appBorderRadius` → `rounded-md` (the app's `--radius` token, see `web/src/styles/theme/_radii.css`), `theme.background.content` → `bg-card`, `theme.appBorderColor` → `border-border`, and the light/dark box-shadow branch → `shadow-[...] dark:shadow-[...]` with the exact same rgba values as the original (`rgba(0, 0, 0, 0.10) 0 1px 3px 0` light / `rgba(0, 0, 0, 0.20) 0 2px 5px 0` dark).

- [ ] **Step 2: Rewrite `Typeset.tsx`**

Read the current file first (`storybook/src/components/Typeset.tsx`) — it already has one partially-migrated line (the label `<header>`, using `cn(['mr-[30px] text-[1em] pr-[1em]', 'text-foreground/40 dark:text-foreground/60'])`). Keep that line exactly as-is; finish migrating the rest of the file (the `Wrapper` and `Sample` styled-components, and the `styled`/`withReset` imports) around it. Replace the entire file with:

```tsx
import { FC, Fragment } from 'react'

import { cn } from '../lib/cn'
import { blockBackgroundClassName } from './_shared'

export interface TypesetProps {
  fontFamily?: string
  fontSizes: [string | number, string | number][]
  fontWeight?: number
  sampleText?: string
}

/**
 * Convenient styleguide documentation showing examples of type with different sizes and weights and
 * configurable sample text.
 */
export const Typeset: FC<TypesetProps> = ({
  fontFamily,
  fontSizes,
  fontWeight,
  sampleText,
  ...props
}) => (
  <div
    {...props}
    className={cn(
      blockBackgroundClassName,
      'docblock-typeset sb-unstyled grid grid-cols-[min-content_auto] items-baseline my-[25px] mb-10 p-[30px_20px]',
    )}
  >
    {fontSizes.map(([label, size]) => (
      <Fragment key={label}>
        <header
          className={cn(['mr-[30px] text-[1em] pr-[1em]', 'text-foreground/40 dark:text-foreground/60'])}
          style={{ fontSize: '1em', paddingRight: '1em' }}
        >
          {label}
        </header>
        <div
          className="text-ellipsis overflow-hidden whitespace-nowrap"
          style={{
            fontFamily,
            fontSize: size,
            fontWeight,
            lineHeight: 1.2,
          }}
        >
          {sampleText || 'Was he a beast if music could move him so?'}
        </div>
      </Fragment>
    ))}
  </div>
)
```

Notes on this mapping: `Wrapper` (`styled.div(withReset, ({theme}) => ({...getBlockBackgroundStyle(theme), display:'grid', gridTemplateColumns:'min-content auto', alignItems:'baseline', margin:'25px 0 40px', padding:'30px 20px'}))`) becomes the outer `<div>` with `blockBackgroundClassName` plus `grid grid-cols-[min-content_auto] items-baseline my-[25px] mb-10 p-[30px_20px]` (`margin: 25px 0 40px` → `my-[25px] mb-10` since Tailwind margin utilities are per-axis, not 4-value shorthand, and 40px = `10 * 0.25rem`). `Sample` (`overflow:hidden, whiteSpace:'nowrap', textOverflow:'ellipsis'`) becomes `text-ellipsis overflow-hidden whitespace-nowrap` on the sample-text `div`. The `withReset` import is dropped entirely (it was an emotion style-interpolation helper, meaningless without `styled`).

- [ ] **Step 3: Verify**

Run: `pnpm --filter storybook run build`
Expected: exit code 0, no `Module not found` or `was not found in` warnings mentioning `_shared.tsx` or `Typeset.tsx`.

Run: `grep -n "storybook/theming\|storybook/internal/components" storybook/src/components/_shared.tsx storybook/src/components/Typeset.tsx`
Expected: no output (both imports fully removed).

- [ ] **Step 4: Commit**

```bash
git add storybook/src/components/_shared.tsx storybook/src/components/Typeset.tsx
git commit -m "refactor(storybook): migrate Typeset off styled/theming to Tailwind"
```

---

### Task 3: Migrate `IconGallery.tsx` off `styled`/`theming`

**Files:**
- Modify: `storybook/src/components/IconGallery.tsx`
- Modify: `storybook/src/stories/Icons.mdx`

**Interfaces:**
- Consumes: `cn` from `../lib/cn` (Task 1), `blockBackgroundClassName` from `./_shared` (Task 2).
- `IconItem`/`IconGallery`'s public API (`IconItemProps`, `IconGalleryProps`, exported component names) is unchanged.
- `ResetWrapper` from `storybook/internal/components` is **kept** — it is a plain layout/reset wrapper component, not part of the `styled`/`theming` CSS-in-JS system being removed, and `IconGallery.tsx` already imports it correctly (this file's only broken import was `styled` from `@storybook/addon-themes`, already fixed to `storybook/theming` earlier this session — this task removes the CSS-in-JS `styled` usage entirely rather than just fixing its import source).
- `storybook/src/stories/Icons.mdx` currently imports `IconItem` via `import { IconItem } from '@sb//IconGallery.tsx'` — `@sb` is not a configured webpack/Next.js alias anywhere in `storybook/.storybook/main.ts`, so this import is broken (confirmed by Tasks 1 and 2's implementers, both of whom hit `Module not found: Error: Can't resolve '@sb//IconGallery.tsx'` when running a full `pnpm --filter storybook run build` and correctly deferred the fix to this task). This was introduced when the file moved from `storybook/stories/` to `storybook/src/stories/` earlier in this session (likely a mis-guessed IDE path-alias rewrite during the move). Since this task is the one touching `IconGallery.tsx` (the file `IconItem` is actually exported from), fixing this one-line import here — rather than leaving it for a later task or a final-review fix wave — is the minimal, obviously-correct scope: change it to a correct relative import, `import { IconItem } from '../components/IconGallery'` (three `../` would be wrong — `Icons.mdx` lives at `storybook/src/stories/Icons.mdx`, and `IconGallery.tsx` lives at `storybook/src/components/IconGallery.tsx`, so `../components/IconGallery` is the correct two-level-up-then-down relative path). Do not touch any other line in `Icons.mdx` — its `BRAND_ICON`/`UI_ICON`/`Icon` import and both `Object.values(...)` call sites were already fixed earlier this session and are out of scope here.

- [ ] **Step 1: Rewrite `IconGallery.tsx`**

Read the current file first (`storybook/src/components/IconGallery.tsx`), then replace its entire contents with:

```tsx
import type { FunctionComponent } from 'react'
import React from 'react'

import { ResetWrapper } from 'storybook/internal/components'

import { cn } from '../lib/cn'
import { blockBackgroundClassName } from './_shared'

interface IconItemProps {
  name: string
  children?: React.ReactNode
}

/** An individual icon with a caption and an example (passed as `children`). */
export const IconItem: FunctionComponent<IconItemProps> = ({ name, children }) => (
  <div className="inline-flex flex-col items-center flex-[0_1_calc(20%-50px)] min-w-[120px] m-[15px]">
    <div
      className={cn(
        blockBackgroundClassName,
        'overflow-hidden text-[3rem] h-[2em] w-[2em] flex items-center justify-center flex-none [&>img]:w-[1em] [&>img]:h-[1em] [&>svg]:w-[1em] [&>svg]:h-[1em]',
      )}
      onClick={async () => {
        if (navigator) await navigator.clipboard.writeText(name)
      }}
    >
      {children}
    </div>
    <div className="font-mono text-sm font-bold text-foreground mt-[1em] leading-[1.2] text-center">
      {name}
    </div>
  </div>
)

interface IconGalleryProps {
  children?: React.ReactNode
}

/** Show a grid of icons, as specified by `IconItem`. */
export const IconGallery: FunctionComponent<IconGalleryProps> = ({ children, ...props }) => (
  <ResetWrapper>
    <div {...props} className="docblock-icongallery sb-unstyled flex flex-row flex-wrap">
      {children}
    </div>
  </ResetWrapper>
)
```

Mapping: `ItemLabel` (font-mono, `theme.typography.size.s2` ≈ 14px, bold, `theme.color.defaultText`, `marginTop:'1em'`, `lineHeight:1.2`, center) → `font-mono text-sm font-bold text-foreground mt-[1em] leading-[1.2] text-center`. `ItemSpecimen` (background block + fixed 2em box + centered flex + `> img, > svg` sized to `1em`) → `blockBackgroundClassName` plus sizing/flex utilities plus the `[&>img]:...`/`[&>svg]:...` Tailwind v4 arbitrary-variant child selectors (equivalent to the original's `'> img, > svg': {...}` nested selector). `Item` → the flex/sizing utilities on the outer wrapper `div`. `List` → `flex flex-row flex-wrap` (the original only set `flexFlow: 'row wrap'`, which is `flex-direction: row` + `flex-wrap: wrap`; `flex-row` is the Tailwind default direction but included explicitly for clarity).

- [ ] **Step 2: Fix `Icons.mdx`'s broken `IconItem` import**

Read the current file first (`storybook/src/stories/Icons.mdx`), then change only this one line:

```diff
-import { IconItem } from '@sb//IconGallery.tsx'
+import { IconItem } from '../components/IconGallery'
```

Leave every other line in the file untouched.

- [ ] **Step 3: Verify**

Run: `pnpm --filter storybook run build`
Expected: exit code 0, **no `Module not found` or `was not found in` warnings anywhere in the output** — this is the first task where a full, unmodified build should succeed end-to-end, since Step 2 just fixed the last broken import blocking it (Task 1 and Task 2's implementers both independently confirmed this exact `@sb//IconGallery.tsx` resolution failure was the sole reason they couldn't run a full build; nothing else is known to be broken at this point).

Run: `grep -n "styled\|storybook/theming" storybook/src/components/IconGallery.tsx`
Expected: no output.

Run: `grep -n "@sb" storybook/src/stories/Icons.mdx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add storybook/src/components/IconGallery.tsx storybook/src/stories/Icons.mdx
git commit -m "refactor(storybook): migrate IconGallery off styled/theming to Tailwind

Also fixes Icons.mdx's broken '@sb//IconGallery.tsx' import (an
unconfigured alias introduced when files moved into src/ earlier this
session) to a correct relative import, since it directly blocked
verifying this task's own build."
```

---

### Task 4: Migrate `ColorPalette.tsx` off `styled`/`theming`

**Files:**
- Modify: `storybook/src/components/ColorPalette.tsx`

**Interfaces:**
- Consumes: `cn` from `../lib/cn` (Task 1), `blockBackgroundClassName` from `./_shared` (Task 2).
- `ColorItem`/`ColorPalette`'s public API (`ColorItemProps`, `ColorPaletteProps`, exported component names, the `renderSwatch`/`renderSwatchLabel`/`renderSwatchSpecimen` helper functions and their signatures) is unchanged.
- `ResetWrapper` from `storybook/internal/components` is kept (same reasoning as Task 3).
- `readableColor`/`transparentize` from `polished` are kept — `Swatch`'s and `PrimaryLabel`'s colors are runtime-computed from arbitrary user-supplied color strings, which cannot be expressed as static Tailwind classes (per Global Constraints).

- [ ] **Step 1: Rewrite `ColorPalette.tsx`**

Read the current file first (`storybook/src/components/ColorPalette.tsx`), then replace its entire contents with:

```tsx
import React, { Fragment, FunctionComponent } from 'react'

import { ResetWrapper } from 'storybook/internal/components'

import { readableColor, transparentize } from 'polished'

import { cn } from '../lib/cn'
import { blockBackgroundClassName } from './_shared'

type Colors = string[] | { [key: string]: string }

interface ColorItemProps {
  title: string
  subtitle: string
  colors: Colors
}

function renderSwatch(color: string, index: number) {
  return (
    <div
      key={`${color}-${index}`}
      title={color}
      className="relative flex-1"
      style={{ backgroundColor: color }}
    />
  )
}

function renderSwatchLabel(color: string, index: number, colorDescription?: string) {
  return (
    <div
      key={`${color}-${index}`}
      title={color}
      className={cn(
        'flex-1 text-center font-mono text-xs leading-none overflow-hidden text-foreground/40 dark:text-foreground/60',
        '[&>div]:inline-block [&>div]:overflow-hidden [&>div]:max-w-full [&>div]:text-ellipsis',
        '[&_span]:block [&_span]:mt-[2px]',
      )}
    >
      <div>
        {color}
        {colorDescription && colorDescription !== color && <span>{colorDescription}</span>}
      </div>
    </div>
  )
}

function renderSwatchSpecimen(colors: Colors) {
  if (Array.isArray(colors)) {
    return (
      <div className="flex flex-col flex-1 relative mb-[30px]">
        <div className={cn(blockBackgroundClassName, 'flex flex-row h-[50px] mb-[10px] overflow-hidden bg-white bg-[repeating-linear-gradient(-45deg,#ccc,#ccc_1px,#fff_1px,#fff_16px)] bg-clip-padding')}>
          {colors.map((color, index) => renderSwatch(color, index))}
        </div>
        <div className="flex flex-row">{colors.map((color, index) => renderSwatchLabel(color, index))}</div>
      </div>
    )
  }

  const swatchElements = []
  const labelElements = []

  for (const colorKey in colors) {
    if (colorKey === 'DEFAULT') break

    const colorValue = colors[colorKey]
    swatchElements.push(renderSwatch(colorValue, swatchElements.length))
    labelElements.push(renderSwatchLabel(colorKey, labelElements.length, colorValue))
  }

  let primarySwatch = <Fragment />
  if ('DEFAULT' in colors) {
    const primaryColor = colors['DEFAULT']
    const primaryLabelColor = transparentize(0.1, readableColor(primaryColor))

    primarySwatch = (
      <div className="flex flex-row h-[50px] mb-[-2px] overflow-hidden bg-white bg-[repeating-linear-gradient(-45deg,#ccc,#ccc_1px,#fff_1px,#fff_16px)] bg-clip-padding rounded-b-none [&+.swatch-colors]:rounded-t-none">
        <div className="relative flex-1" style={{ backgroundColor: primaryColor }}>
          <div
            className="absolute inset-0 flex justify-center items-center font-bold font-mono"
            style={{ color: primaryLabelColor }}
          >
            {primaryColor}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 relative mb-[30px]">
      {primarySwatch}
      <div className={cn(blockBackgroundClassName, 'swatch-colors flex flex-row h-[50px] mb-[10px] overflow-hidden bg-white bg-[repeating-linear-gradient(-45deg,#ccc,#ccc_1px,#fff_1px,#fff_16px)] bg-clip-padding')}>
        {swatchElements}
      </div>
      <div className="flex flex-row">{labelElements}</div>
    </div>
  )
}

/**
 * A single color row your styleguide showing title, subtitle and one or more colors, used as a
 * child of `ColorPalette`.
 */
export const ColorItem: FunctionComponent<ColorItemProps> = ({ title, subtitle, colors }) => {
  return (
    <div className="flex items-start">
      <div className="flex-[0_0_30%] leading-[20px] mt-[5px]">
        <div className="font-bold text-foreground">{title}</div>
        <div className="text-foreground/20 dark:text-foreground/60">{subtitle}</div>
      </div>
      <div className="flex-1 flex flex-row">{renderSwatchSpecimen(colors)}</div>
    </div>
  )
}

interface ColorPaletteProps {
  children?: React.ReactNode
}

/**
 * Styleguide documentation for colors, including names, captions, and color swatches, all specified
 * as `ColorItem` children of this wrapper component.
 */
export const ColorPalette: FunctionComponent<ColorPaletteProps> = ({ children, ...props }) => (
  <ResetWrapper>
    <div
      {...props}
      className="docblock-colorpalette sb-unstyled text-sm leading-[20px] flex flex-col"
    >
      <div className="flex flex-row items-center pb-[20px] font-bold text-foreground/40 dark:text-foreground/60">
        <div className="flex-[0_0_30%]">Name</div>
        <div className="flex-1">Swatches</div>
      </div>
      {children}
    </div>
  </ResetWrapper>
)
```

Mapping notes:
- `ItemTitle`/`ItemSubtitle`/`ItemDescription` → inlined as plain `div`s with Tailwind classes inside `ColorItem` (no longer separate named components, since each is used exactly once — this removes now-pointless indirection while keeping identical rendered output).
- `ItemSubtitle`'s light/dark values are `0.2`/`0.6` (different from `Typeset`'s `0.4`/`0.6` — preserved exactly per the original `transparentize(0.2, ...)` light / `transparentize(0.6, ...)` dark branch).
- `SwatchLabel`'s light/dark values are `0.4`/`0.6` (same pattern as `Typeset`'s label).
- `Swatch`'s `&::before` pseudo-element (absolutely positioned, full-bleed, solid `background` color, no other visual purpose) is simplified to setting `backgroundColor` directly via inline `style` on the div itself — same visual result, since the pseudo-element covered the entire parent with nothing else layered underneath it.
- `PrimarySwatchColor`'s `styled(SwatchColors)` extension (override `marginBottom: -2, borderBottomRadius: 0` plus a `& + .swatch-colors` sibling selector) is expressed as its own inline class list (duplicating `SwatchColors`' base classes minus `blockBackgroundClassName`/`mb-[10px]`, since the original override replaced those two specific properties) plus `[&+.swatch-colors]:rounded-t-none` — the sibling `SwatchColors` usage right below it keeps the literal `swatch-colors` class name so this selector still matches.
- `renderSwatchSpecimen`'s array-branch inlines what was `SwatchSpecimen`/`SwatchColors`/`SwatchLabels` the same way the object-branch already needed to (for consistency, since the array branch is simpler and has no primary-swatch case).

- [ ] **Step 2: Verify**

Run: `pnpm --filter storybook run build`
Expected: exit code 0, no `Module not found` or `was not found in` warnings mentioning `ColorPalette.tsx`.

Run: `grep -n "styled\|storybook/theming" storybook/src/components/ColorPalette.tsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add storybook/src/components/ColorPalette.tsx
git commit -m "refactor(storybook): migrate ColorPalette off styled/theming to Tailwind"
```

---

## Final Verification (after all tasks)

Run: `pnpm --filter storybook run dev` (foreground-safe with a short timeout, e.g. `timeout 60 pnpm --filter storybook run dev`)
Expected: log line `Storybook ready!`, **zero** `was not found in` / `Module not found` warnings anywhere in the output (compare against the original three warning clusters this plan set out to fix: `UI_ICONS`/`BRAND_ICONS` from `Icon` — already fixed earlier this session in `Icons.mdx`, not part of this plan's tasks but worth re-confirming here — and `styled` from `@storybook/addon-themes`, now fully eliminated by Tasks 2-4).

Run: `grep -rn "@storybook/addon-themes'\|@storybook/components'\|@storybook/theming'" storybook/src/`
Expected: no output (no file references the old broken package names anymore; everything either uses `storybook/theming` / `storybook/internal/components`, or — after this plan — nothing from those packages at all in the three migrated files).
