# `LinkField` unified target select, template label and paired icons

Status: approved, ready for implementation plan
Date: 2026-08-13

## Motivation

`src/fields/Link/index.ts` currently models a link as a mode switch plus two
mutually exclusive inputs. An editor picks `type` (`reference` / `custom`)
from a radio, and that radio drives an `admin.condition` on both the
`reference` relationship and the `url` text field. Three controls exist to
express one decision — "what does this link point at?" — and the editor has
to make the decision twice: once in the radio, once in whichever input the
radio revealed.

The label is a plain required text field, so the extremely common case
"label this link with the title of the page it points to" is a manual copy
that silently goes stale when the target page is retitled.

And the field carries a single `icon`, which cannot express the trailing
affordance ("Read more →") that button-shaped links generally want.

This spec collapses the target into one creatable select, turns the label
into a `TemplateField` defaulting to `{title}`, and splits the single icon
into a leading and a trailing slot.

## Goals

1. Replace the `type` radio + conditional `reference` + conditional `url`
   with a single creatable select: existing documents appear as grouped
   options, and typing anything else offers "create" for a custom URL.
2. Expose the selection to consuming code as one union —
   `{ relationTo: CollectionSlug, value: <reference> }` or
   `{ relationTo: 'customURL', value: <url> }` — without giving up Payload's
   automatic relationship population.
3. Make `label` a `TemplateField` with a `{title}` variable, defaulting to
   `{title}` and remaining fully editable.
4. Resolve that template server-side, freshly on every read, so a retitled
   target is reflected without re-saving the linking document.
5. Split `icon` into `iconBefore` and `iconAfter` so a link can carry a
   leading glyph, a trailing glyph, or both.
6. Keep every existing consumer working: `LinkGroupField`, `SiteSettings`,
   the lexical `LinkFeature`, `CMSLink` and `serialize.tsx`.

## Non-goals

- Changing how `reference` and `url` are **stored**. The unification is a UI
  and read-model change; the underlying polymorphic relationship stays a
  real relationship. See "Storage decision" below for why.
- Adding a search API for link targets. Options are preloaded per field
  render. See "Accepted tradeoffs".
- Touching `appearance` / `withAppearanceSelect`, `newTab`, or the
  `LinkGroupField` alignment options. They carry over unchanged.
- Widening the set of linkable collections beyond `pages`, `posts` and
  `topics`.
- A general-purpose "template any field" mechanism. Only `label` becomes a
  template.

## Storage decision

The requested shape — `{ relationTo, value }` where `relationTo` may be the
pseudo-slug `customURL` — cannot be a native Payload polymorphic
relationship, because `relationTo` only accepts real collection slugs. A
hand-rolled group storing that union literally would therefore lose
automatic population, and both `CMSLink` (which needs `reference.value.slug`
to build an href) and the `{title}` variable (which needs the target's
title) depend on that population.

So: storage keeps the real `reference` relationship alongside a `url` text
field, and the union is **derived** rather than stored. A `resolveLinkTarget`
helper gives consuming code the single shape, while Payload keeps populating
the document for free and no content migration is needed for the target
itself.

## Design

### 1. Field shape

```ts
link: {
  reference?: { relationTo: 'pages' | 'posts' | 'topics'
                value: Page | BlogPostData | Topic } | null
  url?: string | null
  label: string            // template source, defaults to '{title}'
  resolvedLabel: string    // virtual, read-only, rendered on afterRead
  iconBefore?: string | null
  iconAfter?: string | null
  iconOnly?: boolean | null
  newTab?: boolean | null
  appearance?: 'default' | 'outline'   // unchanged, still opt-in
}
```

Changes against today's shape:

- `type` is **removed**.
- `icon` is **renamed** to `iconBefore`; `iconAfter` is **added**.
- `resolvedLabel` is **added** as a virtual field.
- `reference` and `url` lose their `admin.condition` and lose their
  individual `required: true`.

`reference` and `url` are mutually exclusive. Exactly one must be set, which
is enforced by a `validate` on `reference` that reads `siblingData`:

```ts
validate: (value, { siblingData }) =>
  value || (siblingData as LinkFieldData)?.url
    ? true
    : 'Select a document or enter a custom URL'
```

`url` keeps a `validate` of its own for the URL grammar (see §3), so a value
written by any path other than the select — an import, a seed script, the
API — is still checked.

### 2. Deriving the union — `resolveLinkTarget`

`src/fields/Link/lib/resolveLinkTarget.ts`:

```ts
export type LinkTarget =
  | { relationTo: CollectionSlug; value: Page | BlogPostData | Topic }
  | { relationTo: 'customURL'; value: string }

export const resolveLinkTarget = (link: LinkFieldData): LinkTarget | null
```

Returns the reference branch when `reference` is set, the `customURL` branch
when `url` is set, and `null` when neither is (which `validate` should have
prevented, but the frontend must not crash on legacy or partial data).

This is the single place consuming code asks "what does this link point
at?". `CMSLink` uses it to build the href; the label hook uses it to derive
`{title}`.

### 3. The unified target select

One custom Field component mounted on the `reference` path. `url` gets
`admin.hidden: true` — it is still a real, validated field, just not
separately rendered.

**Server half** — `src/fields/Link/components/TargetField.tsx`:

Calls `fetchLinkTargetOptions()` and passes the result to the client half as
a prop. `fetchLinkTargetOptions` lives in
`src/fields/Link/lib/fetchLinkTargetOptions.ts`, wrapped in React `cache()`
and keyed on `req` — which Payload passes to every field server component
and which is one stable object per request — so the two server components
that need it (this one and the label field, §4) share a single set of
queries:

```ts
payload.find({
  collection,
  depth: 0,
  limit: LINK_TARGET_OPTION_LIMIT,   // 200
  overrideAccess: false,
  req,
  select: { title: true, slug: true },
  sort: 'title',
  user: req.user,
})
```

for each of `pages`, `posts`, `topics`, shaped into `OptionGroup[]` with one
group per collection. `overrideAccess: false` plus `user` means an editor
never sees a document they cannot read.

**Client half** — `src/fields/Link/components/TargetField.client.tsx`:

Renders `ReactSelect` from `@payloadcms/ui` — which already wraps
`react-select`, is themed for the admin panel, and exposes `isCreatable` —
with `isClearable` and the grouped options. The import must stay in this
client file: `src/fields/Link/index.ts` is loaded by the Payload config, and
a transitive `@payloadcms/ui` import there breaks `payload generate:types`
under plain Node on its bundler-only `.css` imports. The same caveat is
already documented at the bottom of `src/fields/Icon/index.ts`.

Sibling paths are derived from the component's own `path` by swapping the
last segment, so the component works at any nesting depth (array rows,
blocks, the lexical drawer).

On change:

| Interaction | `reference` | `url` |
| --- | --- | --- |
| picks a grouped option | `{ relationTo, value: id }` | `null` |
| creates a new option | `null` | the typed string |
| clears the select | `null` | `null` |

The displayed value is derived from current form state: match `reference` by
id against the preloaded options, else fall back to a synthesised option
built from the populated value — so a link to a deleted document, or to one
past `LINK_TARGET_OPTION_LIMIT`, renders as a labelled selection rather than
an empty select. A set `url` renders as a synthesised option too.

**Accepted custom URL grammar**, enforced both at create time in the select
(rejected inline, no option created) and by `url`'s `validate`:

- absolute `http://` / `https://`
- `mailto:` and `tel:`
- root-relative paths (`/contact`)
- fragments (`#section`)

Anything else is rejected. The two checks share one predicate in
`src/fields/Link/lib/isValidCustomURL.ts`.

### 4. Label as a template

**Admin side.** `TemplateField` gains an `overrides` param, matching the
`deepMerge`-plus-`overrides` convention already used by `IconField`,
`LinkField` and `LinkGroupField`. That lets the link swap
`admin.components.Field` for its own component without forking
`TemplateField`.

`src/fields/Link/components/LabelField.tsx` (server) resolves the same
cached `fetchLinkTargetOptions()`, and
`src/fields/Link/components/LabelField.client.tsx` reads sibling
`reference` / `url` from form state, looks the title up in those options,
and renders the **existing** `FieldComponentClient` from
`src/fields/Template/Components/FieldComponent.client.tsx` with
`data={{ title }}`. The live preview under the input therefore updates as
soon as the editor picks a different document — no new rendering machinery,
just a different data source for a component that already accepts one.

The field is configured with `defaultValue: '{title}'` and stays an ordinary
editable text input. An editor is free to overwrite it with a literal, or to
write something like `More about {title}`.

**Read side.** `resolvedLabel` is a virtual field:

```ts
{
  name: 'resolvedLabel',
  type: 'text',
  virtual: true,
  admin: { hidden: true },
  hooks: { afterRead: [renderLinkLabel] },
}
```

`renderLinkLabel` (`src/fields/Link/hooks/renderLinkLabel.ts`) reads
`siblingData.label`, derives `title` via `resolveLinkTarget`, and returns the
rendered string. Per the Payload conventions in this repo, this is a
**field-level** `afterRead` returning a value — not a collection hook
mutating `doc`.

`{title}` resolves to:

- the referenced document's `title`, for the reference branch;
- the URL's **hostname**, for the `customURL` branch — so the `{title}`
  default never yields an empty label. Hostname extraction is only
  meaningful for absolute URLs; `mailto:`/`tel:`/relative/fragment targets
  fall back to the raw `url` string.

Two supporting changes make this hook viable:

1. **Extract `renderTemplate`'s core.** `src/lib/renderTemplate.ts` is
   `'use server'`, so every export is a server action — not something a
   Payload field hook should depend on. The pupa call, the data proxy and
   the filter proxy move to a plain module (`src/lib/renderTemplate.core.ts`);
   `renderTemplate.ts` becomes a thin `'use server'` wrapper over it, so the
   `TemplateField` client keeps its current entry point unchanged.
2. **Memoise the globals per request.** The core calls `fetchSiteSettings`
   and `fetchGlobalUserSettings`, neither of which is cached (the `Cached`
   variants are separate exports). A page with N links would otherwise cost
   2N global reads. The core caches both on `req.context` for the life of
   the request when a `req` is passed, and falls back to the current
   behaviour when it is not.

### 5. Icons

`iconBefore` and `iconAfter` are both `IconField()` instances. Field layout
becomes one row — `[iconBefore] [label] [iconAfter]` at roughly
`15% / 70% / 15%` — with `iconOnly` and `newTab` beneath it, and
`appearance` last when enabled.

`iconOnly` is kept as-is. It is what gives an icon-only button an accessible
name, by promoting the resolved label to `aria-label`.

### 6. Frontend rendering

`CMSLink` (`src/components/Link/index.tsx`) changes to:

- build its href through `resolveLinkTarget` rather than the inline
  `type === 'reference'` check;
- render `iconBefore` → text → `iconAfter`;
- use `resolvedLabel ?? label` as the text, so a consumer that somehow reads
  without the virtual field still renders something sane rather than a raw
  `{title}`;
- keep the existing `iconOnly` / `aria-label` behaviour, now driven by the
  resolved text.

`CMSLink` is rendered from client components (`RichText/index.tsx` and
`Header.client.tsx` are both `'use client'`), which is precisely why the
template must be resolved before the data reaches it — `CMSLink` cannot
`await` anything.

`serialize.tsx` needs no logic change; it forwards `node.fields` to
`CMSLink` and those fields gain `resolvedLabel` along with everything else.

## Migration

Because `reference` and `url` stay in place, the data migration is narrow:

- `icon` → `iconBefore`
- delete `type`

The difficulty is reach, not transformation. Links live in nested block
arrays across `pages`, in `SiteSettings`, and — via the lexical
`LinkFeature` — inside rich-text node JSON. So the migration is a recursive
walker over document JSON that rewrites every link-shaped object it finds,
in the style of `scripts/migrate-skill-name-caption.ts`.

"Link-shaped" is identified structurally: an object carrying a `label` **and**
at least one of `reference` / `url` / `type`. The walker is a pure function
over plain JSON, tested independently of the database, and the script is
idempotent — an object already carrying `iconBefore` and no `type` is left
untouched.

`src/types/payload.ts` regenerates from the config; it is not hand-edited.

## Reused code (no new invention)

- `ReactSelect` from `@payloadcms/ui` — already wraps `react-select` with
  `isCreatable`, `isClearable` and admin theming.
- `IconField` — used twice, unchanged.
- `FieldComponentClient` from `src/fields/Template/Components/` — reused
  verbatim by the label component, given a different `data` source.
- `renderTemplate`'s pupa/filter machinery — moved, not rewritten.
- `generateContentURL` / `generateContentPath` — unchanged href building.
- `deepMerge` + `overrides` field-factory convention.
- The `scripts/migrate-*.ts` walker-and-idempotent-script pattern.

## Accepted tradeoffs

**Options are preloaded, not searched.** `fetchLinkTargetOptions` resolves
the full option list at field render, and `react-select` filters in memory.
This is the smallest amount of code and gives instant filtering, at two
costs: a document created in a drawer does not appear in the select until
the form is reloaded, and the approach degrades once the linkable
collections grow past a few hundred entries. `LINK_TARGET_OPTION_LIMIT`
bounds the query so the failure mode is "some entries missing" rather than
an unbounded read. Moving to a debounced search endpoint later is a
self-contained change to `fetchLinkTargetOptions` plus the client half.

**`{title}` is resolved on every read.** That is the point — it is what
keeps labels fresh when a target is retitled — but it does mean template
rendering on the read path. The `req.context` memoisation above keeps the
per-link cost to the pupa render itself.

## Risks to settle early in implementation

1. **Lexical `LinkFeature`.** `src/fields/RichText/index.ts` spreads
   `...LinkField().fields` into `LinkFeature`. The link drawer is the one
   consumer that does not render through the normal document form, so the
   custom server components (`TargetField`, `LabelField`) must be verified
   there before the rest of the work is built on top of them. This is the
   highest-risk unknown in the spec and should be the first thing proven.
2. **`afterRead` ordering.** `resolvedLabel`'s hook needs
   `siblingData.reference` populated by the time it runs. Confirm that field-level
   `afterRead` hooks see populated relationships at the depth the frontend
   queries with; if they do not, the fallback is for `renderLinkLabel` to
   read the title from the unpopulated id via `req.payload` behind the same
   `req.context` memoisation.
3. **`virtual: true` and `select`.** Virtual fields are not returned by
   queries that pass an explicit `select`. Any existing call site that
   selects link fields narrowly must add `resolvedLabel`, or it will fall
   back to the raw template.

## Testing

Vitest, following the repo's existing colocated `*.test.ts` convention:

- `resolveLinkTarget` — reference branch, `customURL` branch, neither set,
  populated vs unpopulated `value`.
- `isValidCustomURL` — each accepted form, plus rejections
  (`javascript:`, bare `example.com`, empty).
- `renderLinkLabel` — `{title}` against a reference, against an absolute
  URL (hostname), against `mailto:`/relative (raw string fallback), a
  literal label passing through untouched, and a template referencing a
  global.
- The migration walker — `icon` → `iconBefore`, `type` dropped, nested
  blocks, lexical node JSON, idempotence, and non-link objects left
  untouched.
- The link `validate` — neither target set fails, either one alone passes.

Component-level behaviour of the select (create, clear, swap) is covered by
the existing Playwright setup rather than by unit tests, consistent with how
other custom admin fields in this repo are tested.

## Open items for the implementation plan

- Order of work, with the lexical `LinkFeature` spike first.
- Whether `LINK_TARGET_OPTION_LIMIT` should be per-collection or shared.
- Whether the migration script runs against a dump first, per the workflow
  used for `migrate-skill-name-caption.ts`.
