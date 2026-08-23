# Simplify LinkField — Design Spec

## Goal

Replace the current `LinkField` (custom ReactSelect target picker, pupa-template label with live `{title}` substitution, optional appearance select) with a simpler, mostly-declarative field built from stock Payload field types plus the existing `IconField`.

## Current state (for reference)

`src/fields/Link/index.ts` builds a `group` field with:
- Row 1: `reference` (custom `TargetField` component — combined document/URL ReactSelect, 75%) + `newTab` checkbox (25%)
- Hidden `url` text field, written by `TargetField`
- Row 2: `iconBefore` (IconField, 15%) + `label` (`TemplateField`, pupa `{title}` template, custom `LabelField` component, 70%) + `iconAfter` (IconField, 15%)
- `resolvedLabel`: virtual field, `afterRead` hook renders the `label` template against the resolved target's title
- `iconOnly` checkbox (own row)
- Optional `appearance` select, gated by `withAppearanceSelect` (never actually turned on at any real call site)

## New design

One `group` field, three rows, all using stock Payload field types except `IconField` (kept as-is).

### Row 1 (`type: 'row'`)
| Field | Width | Type | Notes |
|---|---|---|---|
| `linkType` | 50% | `select` | Options: `Linked document` (`reference`) / `Custom URL` (`url`). `defaultValue: 'reference'`, `required: true`. Drives which field row 2 shows. |
| `newTab` | 25% | `checkbox` | "Open in new tab" — unchanged from today. |
| `iconOnly` | 25% | `checkbox` | "Icon only" — moved up from its old standalone row; same label/description as today. |

### Row 2 (`type: 'row'`)
Both fields occupy the row but only one is ever visible, switched by `linkType`:

| Field | Type | Condition | Notes |
|---|---|---|---|
| `reference` | `relationship` | shown when resolved mode is `reference` (see fallback below) | Stock admin UI, no custom `Field` component. `relationTo: [pages, blogPosts, blogTopics]`, `maxDepth: 1`. Replaces the current custom `TargetField`/`fetchLinkTargetOptions` picker entirely. |
| `url` | `text` | shown when resolved mode is `url` | Label "Custom URL". Validated by the existing `isValidCustomURL`. |

**Legacy-data fallback.** `linkType` is a new field — documents saved before this change have no value for it. Both fields' `admin.condition` resolve the effective mode the same way, shared via one helper:

```ts
// src/fields/Link/lib/resolveLinkTypeMode.ts
export const resolveLinkTypeMode = (siblingData: { linkType?: string; url?: string }): 'reference' | 'url' => {
  if (siblingData?.linkType === 'url' || siblingData?.linkType === 'reference') return siblingData.linkType
  return siblingData?.url ? 'url' : 'reference'
}
```

`reference`'s condition is `(_, siblingData) => resolveLinkTypeMode(siblingData) === 'reference'`; `url`'s is the `=== 'url'` counterpart. This is a UI-only fallback for documents that predate `linkType` — it does not write `linkType` back; the field simply saves an explicit value the next time the document is edited and saved. No migration or `afterRead` backfill is needed.

Each field's own `validate` checks the resolved mode (via the same helper, reading `siblingData`) and requires a value only when it is the active mode — so an inactive, hidden field never blocks save.

### Row 3 (`type: 'row'`)
| Field | Width | Type | Notes |
|---|---|---|---|
| `iconBefore` | 15% | `IconField({ name: 'iconBefore' })` | Unchanged. |
| `label` | 70% | `text` | **Plain text input.** Required, no default value, no template substitution. When `iconOnly` is checked this becomes the field whose value is used as the link's `aria-label` (already true today via `CMSLink`'s `iconOnly` branch — no change needed there beyond removing `resolvedLabel`). |
| `iconAfter` | 15% | `IconField({ name: 'iconAfter' })` | `admin.condition: (_, siblingData) => !siblingData?.iconOnly` — the field (and its layout cell) disappears from row 3 when Icon only is checked. |

When `iconAfter` is hidden by the condition, `label` keeps its own configured width (70%); Payload's row layout does not need `label` to reflow to fill the gap — this matches how conditional fields already behave elsewhere in the codebase (e.g. `Media/index.ts`).

### Removed entirely
- `appearance` field, `appearanceOptions` export, `withAppearanceSelect` config option (no real call site sets it to `true` — confirmed via repo-wide search; only its own now-obsolete test does).
- `resolvedLabel` virtual field and its `afterRead` hook wiring.
- `src/fields/Link/hooks/renderLinkLabel.ts` + `renderLinkLabel.test.ts`.
- `src/fields/Link/components/LabelField.tsx` + `LabelField.client.tsx`.
- `src/fields/Link/components/TargetField.tsx` + `TargetField.client.tsx`.
- `src/fields/Link/lib/resolveTitleFromOptions.ts` + test.
- `src/fields/Link/lib/fetchLinkTargetOptions.ts` + test.
- `src/fields/Link/lib/deriveLinkTitle.ts` + test (only consumer was the template-title machinery being removed).
- `src/fields/Link/lib/siblingPath.ts` + test (only consumers were `LabelField.client.tsx` and `TargetField.client.tsx`, both removed).
- The stray `removin` token currently sitting mid-file at `src/fields/Link/index.ts:102` (pre-existing artifact, unrelated to any real code path) is deleted as part of the rewrite.

### Added
- `src/fields/Link/lib/resolveLinkTypeMode.ts` (+ test) — the shared mode-resolution helper described above.

### Kept as-is
- `IconField` usage (`iconBefore`, `iconAfter`).
- `isValidCustomURL` validation logic.
- `resolveLinkTarget.ts` / `LinkFieldDataLean` / `LinkTarget` types — still the shape `CMSLink` and every consumer read link data through. `resolveLinkTarget` still switches on `reference` vs `url` being populated, independent of `linkType` (which only exists to drive the *editing* UI, not the resolved-href logic).

## Consumer updates

- **`src/components/Link/index.tsx` (`CMSLink`)**: drop `resolvedLabel` from destructuring and the `text = resolvedLabel || label` fallback — render `label` directly. `iconOnly`/aria-label/icon rendering logic is unchanged.
- **`src/types/payload.ts`**: regenerated via `payload generate:types` after the field change (adds `linkType`, drops `resolvedLabel` and `appearance`).
- **`src/lib/unsplash/buildCreditsValue.ts`** (and its tests `buildCreditsValue.test.ts`, `creditsLinkValidation.test.ts`, `creditsRendering.test.tsx`): these spread `LinkField().fields` into a caption-variant `LinkFeature`. Update code comments describing the field list (currently enumerate `iconBefore, label, iconAfter, resolvedLabel, iconOnly`) and any assertions tied to removed fields (`resolvedLabel`, `appearance`) or the new `linkType` field.
- **`src/lib/seed/pages.ts:184-189`**: the footer/legal link seed builder writes `{ newTab, label, url, reference: null }` directly. Add `linkType: 'url'` to this literal so seeded data is valid under the new required `linkType` field.
- **`src/lib/seed/lexical.ts`**: comment references `LinkField().fields` shape — update if it enumerates specific field names.
- **`src/fields/Link/index.test.ts`**: rewrite. Remove assertions about `appearance`/`withAppearanceSelect`, `resolvedLabel` virtual field, and the old `type`/`icon` fields (already-obsolete checks). Add assertions for: `linkType` select with correct options/default, `reference`/`url` conditional visibility wiring (including the legacy-data fallback), `label` being a plain required text field with no `defaultValue`, `iconAfter`'s `admin.condition` hiding it when `iconOnly` is true.
- **`src/fields/LinkGroup/index.ts`**, **`src/globals/SiteSettings/index.ts`**: both call `LinkField()` with no overrides — no changes needed beyond the field shape change itself.
- **`src/fields/RichText/index.ts:113-117`**: spreads `LinkField().fields` into `LinkFeature` — no changes needed beyond the field shape change itself (no field-name-specific logic here).

## Testing

- `src/fields/Link/index.test.ts`: primary coverage of the new field shape (see above).
- `src/fields/Link/lib/resolveLinkTypeMode.test.ts`: new unit test for the fallback helper — explicit `linkType` wins; absent `linkType` with `url` set infers `'url'`; absent `linkType` with neither set infers `'reference'`.
- `src/lib/unsplash/*.test.ts`: verify they still pass against the new field list; update fixtures/comments referencing removed fields.
- Manual/admin-UI check not required for this plan (no browser testing requested), but the plan's tasks should leave the codebase typechecking and all existing tests green.

## Out of scope

- No changes to `IconField`, `isValidCustomURL`, `resolveLinkTarget`, or how `CMSLink` resolves hrefs.
- No DB migration for existing production data — handled entirely by the `resolveLinkTypeMode` UI fallback described above.
