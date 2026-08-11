# Two-column content block: the toolbar problem

Status: **investigated, not implemented — two approaches ruled out**

## The complaint

Used standalone in the page block layout, `TwoColumnContentBlock` renders **two
fixed toolbars** — one per column — for what is visually a single component.

## Why it happens

The block declares two sibling `richText` fields:

```ts
// src/blocks/TwoColumnContentBlock/index.ts
fields: [{ type: 'row', fields: [
  RichTextField({ name: 'contentLeft',  editorVariant: 'markdown', … }),
  RichTextField({ name: 'contentRight', editorVariant: 'markdown', … }),
]}]
```

Two fields → two Lexical **documents** → two editor instances → two toolbars.
Nothing in the schema expresses "these are two columns of one thing"; they are
two fields that happen to sit in a `row`.

The block is registered twice, from a single definition:

| Registration | Where | Toolbars |
| --- | --- | --- |
| `src/fields/RichText/index.ts:147` (`BlocksFeature`, by slug) | nested in Lexical | **1** — already fine |
| `src/blocks/index.ts` (`BLOCKS`) | standalone, `pages.content` | **2** — the complaint |

The nested case is already correct because `rootFeatures` sets
`disableIfParentHasFixedToolbar: true` (`src/fields/RichText/index.ts:98`) — a
nested editor defers to its ancestor's toolbar. Standalone there is no ancestor,
so nothing is suppressed.

Note both registrations resolve to the **same block object**, so the definition
cannot branch on which context it is in.

---

## Ruled out ①: port Lexical's layout nodes (wrong problem)

First proposal was to replace the two fields with one `richText` field whose
document holds a container node:

```
root
└─ layout-container
    ├─ layout-item   ← left
    └─ layout-item   ← right
```

**Why it was the wrong shape:** this block's home is `pages.content`, a plain
`blocks` field carrying 13 block types, most unrelated to Lexical (resume,
legal, link-group blocks). It is a *layout block*, not a Lexical construct.
Building editor infrastructure for it inverts the relationship.

It is also expensive. `LayoutContainerNode` / `LayoutItemNode` are **not
shipped** — not in `@lexical/*` (0.41.0), not in
`@payloadcms/richtext-lexical` (3.87.0). They exist only in the playground
source and would have to be ported by hand, along with a Payload feature,
deletion guards, a converter, renderer changes, and a migration.

This remains the *only* design that genuinely yields one toolbar — see
"If it is ever worth doing" below.

## Ruled out ②: one toolbar above the row (impossible with Payload's toolbar)

Second proposal: strip `FixedToolbarFeature` from the columns and render one
toolbar at block level, relying on `applyToFocusedEditor` to point it at
whichever column has focus.

The first half works. A `column` variant (`markdown` minus the toolbar) was
implemented and verified through Payload's resolved config:

| Field | Features | `toolbarFixed` |
| --- | --- | --- |
| `TwoColumn.contentLeft` | 14 | absent |
| `TwoColumn.contentRight` | 14 | absent |
| `OneColumn.content` (control) | 15 | present |

The second half **cannot be built**. Three independent blockers, all in
`@payloadcms/richtext-lexical@3.87.0`:

1. **The toolbar requires editor context.** `FixedToolbar` calls
   `useEditorConfigContext()` and `useLexicalEditable()`
   (`features/toolbars/fixed/client/Toolbar/index.js:215-217`), so it only
   renders *inside* a Lexical editor. A custom component mounted on the block's
   `row` has neither.

2. **`applyToFocusedEditor` is parent→child only.** It resolves through
   `editorConfigContext.focusedEditor` (`Toolbar/index.js:223`), and that
   context is created per editor and shared downward — focus propagates via
   `parentContext.focusEditor(...)`
   (`lexical/config/client/EditorConfigProvider.js:56-57`). Two **sibling**
   fields are not in each other's context, so neither can drive a toolbar for
   the other. This is exactly why the flag works for nested editors and not
   here.

3. **The component is not exported** from
   `@payloadcms/richtext-lexical/client`, so there is nothing to import even if
   (1) and (2) were solved.

Outcome: removing the columns' toolbars leaves **zero**, not one. Both the
variant and the supporting feature-list refactor were reverted; the block is
back on `editorVariant: 'markdown'`.

---

## Where this leaves it

Two toolbars standalone is not a misconfiguration — it follows directly from two
sibling `richText` fields being two Lexical documents. No combination of Payload
feature flags changes that.

Options, in increasing cost:

- **Accept it.** Current state. Two toolbars standalone, one nested.
- **Drop the columns' toolbars entirely.** One line each
  (`editorVariant`, plus a variant that omits `FixedToolbarFeature`).
  Authors keep keyboard shortcuts and the `/` slash menu, both of which work
  without a toolbar. Visually clean, less discoverable. Reverted here, but
  cheap to reinstate.
- **Single-editor container node** (Ruled out ①). The only design that produces
  one real toolbar.

## If it is ever worth doing

Scope for the container-node approach, from when it was investigated:

- **Nodes** — `LayoutContainerNode` / `LayoutItemNode` as `ElementNode`s, split
  client/server following `src/fields/Icon/lexical/nodes/`. The type-identity
  constraint documented in `IconNode.base.ts` applies: Lexical matches a
  serialized node's `type` to the registered class by identity, so one class
  shared across both bundles fails to load existing documents. Subclass a
  common base.
- **Feature** — `createServerFeature` + `createClientFeature` pair, mirroring
  `IconPickerFeature`.
- **Deletion guard** — nothing in Lexical enforces "always two columns". Needs
  `KEY_BACKSPACE_COMMAND`/`KEY_DELETE_COMMAND` handlers *and* a node transform
  that rebuilds a missing item; the transform is the real guarantee, since paste
  and undo bypass key handlers.
- **Renderer** — `src/components/RichText/index.tsx:229` maps the block slug to
  `<Columns {...node.fields} />` today; that becomes converters for the two node
  types. `Renderer/index.tsx` currently runs `highlightRichText` twice (once per
  column) and would collapse to one pass.
- **Migration** — the local `test` DB holds 27 documents mentioning the block
  (3 `pages`, 24 `_pages_versions`) in two shapes:

  ```jsonc
  // standalone, empty — no column fields at all
  { "blockType": "TwoColumnContentBlock", "id": "…" }

  // nested in rich text, populated
  { "id": "…", "blockType": "TwoColumnContentBlock",
    "contentLeft": { "root": {…} }, "contentRight": { "root": {…} } }
  ```

  Versions must be migrated too — Payload reads `_pages_versions` for drafts and
  history. The local DB is disposable, so the script can be developed against
  it; any other environment would need a dry run and a reversal path.

Open question if it is revisited: store a `templateColumns` value on the
container (the playground's approach) so 1/3–2/3 splits are possible later?
Cheap now, another migration afterwards.
