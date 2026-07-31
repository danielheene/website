---
sessionId: session-260731-060819-10ob
---

# Requirements

### Overview & Goals
Extend the `pp-supply-sans` local font configuration (`src/fonts/pp-supply-sans/next.ts`) to declare `@font-face` entries for the full range of font weights (100–900) and both `normal` and `italic` styles, mirroring the approach already implemented for `pp-supply-mono` (`src/fonts/pp-supply-mono/next.ts`). Only the four existing `.woff2` files (200, 400, 500, 700) may be used as sources — no new font assets will be added.

The goal is to prevent the browser from synthesizing "fake" bold or fake italic styles (which causes visual glitches/inconsistent rendering) when content requests a `font-weight`/`font-style` combination that isn't explicitly declared. By declaring a `@font-face` for every weight/style combination (even when it maps to the closest available real file), the browser always finds a matching face and never synthesizes one.

### Scope
**In Scope**
- Update `src/fonts/pp-supply-sans/next.ts` `src` array to add all missing weight/style entries, reusing the 4 existing `.woff2` files, following the exact weight-grouping pattern used in `pp-supply-mono`:
  - `pp-supply-sans-200.woff2` → weights `100`, `200` (normal + italic)
  - `pp-supply-sans-400.woff2` → weights `300`, `400` (normal + italic)
  - `pp-supply-sans-500.woff2` → weights `500`, `600` (normal + italic)
  - `pp-supply-sans-700.woff2` → weights `700`, `800`, `900` (normal + italic)

**Out of Scope**
- Adding new font files (no italic-specific or additional weight assets exist and none will be created).
- Changes to `pp-supply-mono` (already done, used only as reference).
- Changes to other fonts in `src/fonts/`.
- Any CSS/consuming component changes (e.g. Tailwind font-weight utility usage).

### Functional Requirements
- Every integer weight step from 100–900 must resolve to an explicit `@font-face` entry for both `normal` and `italic` styles, so `font-weight`/`font-style` CSS never falls outside the declared faces.
- Existing weight-to-file mappings must not be changed; only the mapping structure (weight grouping + style duplication) mirrors `pp-supply-mono`.
- The `variable`, `adjustFontFallback`, `display`, and `fallback` config options remain unchanged.

# Technical Design

### Current Implementation
`src/fonts/pp-supply-sans/next.ts` currently defines only 4 `src` entries (weights 200, 400, 500, 700; style `normal` only), using `next/font/local`'s `localFont`. No italic files exist in `src/fonts/pp-supply-sans/files/` (only `-200`, `-400`, `-500`, `-700` `.woff2`/`.ttf` pairs).

### Reference Pattern (`pp-supply-mono`)
`src/fonts/pp-supply-mono/next.ts` already solves this exact problem for the same 4-weight asset set. It defines 18 `src` entries: each of the 4 physical `.woff2` files is reused across 2–3 adjacent integer weights, and each weight is declared for both `style: 'normal'` and `style: 'italic'` pointing at the same file. This ensures the browser always has a matching real `@font-face` for any weight (100–900) and style (normal/italic) combination in use, so it never synthesizes bold/italic (which would look inconsistent with the actual typeface design).

### Proposed Changes
Apply the identical structure to `src/fonts/pp-supply-sans/next.ts`:

```ts
src: [
  { path: './files/pp-supply-sans-200.woff2', weight: '100', style: 'normal' },
  { path: './files/pp-supply-sans-200.woff2', weight: '100', style: 'italic' },
  { path: './files/pp-supply-sans-200.woff2', weight: '200', style: 'normal' },
  { path: './files/pp-supply-sans-200.woff2', weight: '200', style: 'italic' },
  { path: './files/pp-supply-sans-400.woff2', weight: '300', style: 'normal' },
  { path: './files/pp-supply-sans-400.woff2', weight: '300', style: 'italic' },
  { path: './files/pp-supply-sans-400.woff2', weight: '400', style: 'normal' },
  { path: './files/pp-supply-sans-400.woff2', weight: '400', style: 'italic' },
  { path: './files/pp-supply-sans-500.woff2', weight: '500', style: 'normal' },
  { path: './files/pp-supply-sans-500.woff2', weight: '500', style: 'italic' },
  { path: './files/pp-supply-sans-500.woff2', weight: '600', style: 'normal' },
  { path: './files/pp-supply-sans-500.woff2', weight: '600', style: 'italic' },
  { path: './files/pp-supply-sans-700.woff2', weight: '700', style: 'normal' },
  { path: './files/pp-supply-sans-700.woff2', weight: '700', style: 'italic' },
  { path: './files/pp-supply-sans-700.woff2', weight: '800', style: 'normal' },
  { path: './files/pp-supply-sans-700.woff2', weight: '800', style: 'italic' },
  { path: './files/pp-supply-sans-700.woff2', weight: '900', style: 'normal' },
  { path: './files/pp-supply-sans-700.woff2', weight: '900', style: 'italic' },
]
```

All other `localFont(...)` options (`variable: '--pp-supply-sans'`, `preload`, `adjustFontFallback: false`, `display: 'swap'`, `fallback: [...]`) remain unchanged.

### File Structure
- Modified: `src/fonts/pp-supply-sans/next.ts` (only the `src` array is expanded from 4 to 18 entries).
- No files added/removed under `src/fonts/pp-supply-sans/files/`.

# Delivery Steps

### ✓ Step 1: Expand pp-supply-sans src array with full weight/style coverage
src/fonts/pp-supply-sans/next.ts declares an explicit @font-face entry for every weight 100-900 and both normal/italic styles, using only the existing 4 woff2 files.

- Replace the current 4-entry `src` array in `src/fonts/pp-supply-sans/next.ts` with an 18-entry array.
- Map `pp-supply-sans-200.woff2` to weights `100` and `200`, each with `normal` and `italic` style entries.
- Map `pp-supply-sans-400.woff2` to weights `300` and `400`, each with `normal` and `italic` style entries.
- Map `pp-supply-sans-500.woff2` to weights `500` and `600`, each with `normal` and `italic` style entries.
- Map `pp-supply-sans-700.woff2` to weights `700`, `800`, and `900`, each with `normal` and `italic` style entries.
- Leave `variable`, `preload`, `adjustFontFallback`, `display`, and `fallback` untouched.

### ✓ Step 2: Verify configuration matches pp-supply-mono pattern and builds cleanly
The updated font config is structurally consistent with pp-supply-mono and compiles without type or lint errors.

- Diff the new `pp-supply-sans/next.ts` `src` array against `pp-supply-mono/next.ts` to confirm identical weight-grouping/style-duplication structure.
- Confirm all referenced file paths (`pp-supply-sans-200.woff2`, `-400.woff2`, `-500.woff2`, `-700.woff2`) exist in `src/fonts/pp-supply-sans/files/`.
- Run type-check/lint on the modified file to catch syntax or typing issues.