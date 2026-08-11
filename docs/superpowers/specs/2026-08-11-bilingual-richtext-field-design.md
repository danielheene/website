# `BilingualRichTextField`: a reusable en/de rich-text group with AI translate buttons

Status: approved, ready for implementation plan
Date: 2026-08-11

## Motivation

`ResumeJobs`' `tasks` array hand-rolls a `group` field containing two
`RichTextField`s named `en` and `de` (`src/collections/ResumeJobs/index.ts`).
The `en` field carries a dead debug `beforeChange` hook (`console.log(html)`
over a `convertLexicalToHTML` call that's never used). This pattern —
"one field, two language variants, edited side by side" — is a plausible fit
for anywhere else on the site that needs bilingual rich text, and today it
can only be reproduced by copy-pasting the `ResumeJobs` shape by hand.

Separately, this codebase already has a proven "AI-generate into a field"
pattern: `src/lib/fetchAnthropicMetaDescription.ts` and
`fetchAnthropicImageAltText.ts` are `'use server'` functions calling
`@ai-sdk/anthropic` + `generateText`, wired to admin UI buttons via
`TextFieldWithLockAndGenerate` (see `src/fields/Meta/MetaDescriptionField/`
and `src/collections/MediaImages/components/AltField.tsx`). This design
extends that same pattern to translation between the two language fields.

## Goals

1. A reusable field factory, `BilingualRichTextField`, producing a `group`
   field with `en`/`de` `RichTextField` children, usable as a drop-in
   replacement for `ResumeJobs`' hand-rolled version and anywhere else on
   the site that needs the same shape.
2. A `layout: 'row' | 'column'` param controlling whether the two language
   fields sit side by side or stacked.
3. Two buttons, placed between the two fields regardless of layout, that
   translate one language's content into the other via Claude — reusing
   the existing `@ai-sdk/anthropic` pattern already in this codebase.
4. Refactor `ResumeJobs`' `tasks` array to use the new field, removing the
   dead debug hook.

## Non-goals

- Generic multi-locale support (N languages). This is fixed to exactly
  `en`/`de`, matching the only real use case in the codebase today.
- Preserving 100% Lexical fidelity through translation (tables, uploads,
  blocks). The HTML round-trip (below) preserves the formatting available
  in the `inline`/`caption`/`markdown` editor variants — the ones this
  field is meant for — but is not guaranteed lossless for the full `post`
  feature set (relationships, custom blocks, embedded uploads). If a
  caller passes `editorVariant: 'post'`, translation may drop or mangle
  block-level content; this is an accepted, documented limitation, not a
  bug to fix here.
- Swapping to DeepL or another translation provider. The translation call
  is isolated in one function (`fetchAnthropicTranslation`) specifically so
  that swap is a future, low-friction change — not part of this work.

## Design

### 1. Field factory — `src/fields/BilingualRichText/index.ts`

```ts
type BilingualRichTextFieldProps = {
  name: string
  layout?: 'row' | 'column' // default 'column'
  editorVariant?: RichTextEditorVariant // default 'inline', passed to both RichTextField calls
  label?: string | false
  required?: boolean
  overrides?: {
    en?: RichTextFieldOverrides
    de?: RichTextFieldOverrides
  }
}

export const BilingualRichTextField = ({
  name,
  layout = 'column',
  editorVariant = 'inline',
  label = false,
  required = false,
  overrides = {},
}: BilingualRichTextFieldProps): GroupField => { ... }
```

Returns a `group` field (`hideGutter: true`, matching every other group
factory in `src/fields/`) whose `fields` are, in order:

1. `RichTextField({ name: 'en', editorVariant, overrides: { label: 'English', required, ...overrides.en } })`
2. A `type: 'ui'` field (`name: '${name}TranslateControls'`) rendering
   `TranslateControls`.
3. `RichTextField({ name: 'de', editorVariant, overrides: { label: 'German', required, ...overrides.de } })`

When `layout === 'row'`, all three are wrapped in one native Payload `row`
field with explicit `admin.width`s (`en` 45%, controls 10%, `de` 45%) so
they render side by side. When `layout === 'column'`, they're returned as a
flat array in the same order with no `row` wrapper — Payload stacks
top-level group children vertically by default, so this is the same three
fields, just not grouped into a `row`. There is no second code path for
rendering the buttons — `TranslateControls` is the same `ui` field either
way; only its wrapping changes.

This mirrors the existing pattern of augmenting a native field with a
custom component (`ToggleField`, `SectionGroupField`) rather than building
a bespoke renderer — the two `RichTextField`s stay real, independently
editable Payload fields with full native Lexical toolbar/undo/paste
behavior; nothing about their rendering is reimplemented.

### 2. `TranslateControls` — `src/fields/BilingualRichText/components/TranslateControls.tsx`

`'use client'`, a `UIFieldClientComponent`. Computes sibling paths from its
own `path` prop (`path.split('.').slice(0, -1).join('.')` + `.en` / `.de`)
and reads/writes both language fields via two `useField` calls — the same
hook every other custom field component in this codebase uses.

Two icon-only buttons (`@/components/Button`, `variant="secondary"`,
`size="icon"`), stacked vertically, each with an `aria-label` (no visible
text needed given icon + label):

- **EN → DE**: disabled if `en` is empty or a translation is in flight.
- **DE → EN**: disabled if `de` is empty or a translation is in flight.

On click:

1. If the target field already has non-empty content, `window.confirm(...)`
   with a message naming the direction (e.g. "Replace the German content
   with a translation from English?"). Cancel aborts, no state changes.
2. Set local `isPending` (per-direction) to show a spinner/disabled state.
3. Call `fetchAnthropicTranslation({ value: sourceValue, sourceLanguage, targetLanguage, editorVariant })`.
4. On success, `setValue` on the target field with the returned Lexical
   JSON.
5. On failure (thrown error, e.g. Anthropic call failed), leave the target
   field untouched and surface the error via `toast.error(...)` from
   `@payloadcms/ui` (already used this way in
   `src/fields/SVGUpload/components/FieldComponent.client.tsx`), formatting
   the message with the existing `extractErrorMessage` helper
   (`src/lib/extractErrorMessage.ts`) rather than failing silently.
   (Correction: `src/components/Toasty/Toasty.tsx` is an unrelated Konami-code
   easter egg, not a toast-notification component — caught during planning.)
6. Clear `isPending` in a `finally`.

### 3. Translation — `src/lib/fetchAnthropicTranslation.ts` (`'use server'`)

Mirrors `fetchAnthropicMetaDescription.ts` structurally. HTML round-trip,
not plaintext, so formatting (bold/italic/lists/links, depending on
`editorVariant`) survives translation:

```ts
'use server'

export const fetchAnthropicTranslation = async ({
  value,          // SerializedEditorState (source Lexical JSON)
  sourceLanguage, // 'en' | 'de'
  targetLanguage, // 'en' | 'de'
  editorVariant,  // RichTextEditorVariant — used to build a matching headless editor for parsing the result
}): Promise<SerializedEditorState | null> => {
  const html = convertLexicalToHTML({ data: value, disableContainer: true })
  if (!html.trim()) return null

  const { text: translatedHtml } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: dedent`
      Translate the following ${LANGUAGE_LABEL[sourceLanguage]} HTML fragment
      into ${LANGUAGE_LABEL[targetLanguage]}. Preserve the HTML tags and
      structure exactly — translate only the text content. Keep the tone
      concise and professional, appropriate for a CV/résumé bullet point.
      Return only the translated HTML fragment, no explanation, no code
      fences, no surrounding <html>/<body> tags.
    `,
    prompt: html,
  })

  return parseHtmlToLexical({ html: translatedHtml, editorVariant })
}
```

`parseHtmlToLexical` (co-located helper in the same file):

1. Builds a headless editor via `createHeadlessEditor` (from
   `@payloadcms/richtext-lexical/lexical/headless`) configured with the
   same feature set the target `editorVariant` uses, so recognized nodes
   (bold, links, lists, etc.) match what the real field will render.
2. Parses `translatedHtml` into a DOM via `new JSDOM(translatedHtml)`
   (`jsdom` — see dependency change below).
3. Inside `editor.update(...)`, calls `$generateNodesFromDOM(editor, dom.window.document)`
   and inserts the resulting nodes into the headless editor's root.
4. Returns `editor.getEditorState().toJSON()`.
5. **Fallback**: if parsing throws (malformed HTML from the model, or a
   node type the headless editor doesn't recognize), catch it and instead
   build a single plain paragraph node directly from `translatedHtml`'s
   text content (strip tags) — so a bad round-trip degrades to plain
   translated text instead of failing the whole operation.

### 4. `jsdom` dependency change

`jsdom` is currently a `devDependency` (test tooling only). Runtime use in
`fetchAnthropicTranslation` requires it in `dependencies`. Move the entry
in `package.json`; no version change.

### 5. `ResumeJobs` refactor

Replace the `task` group in `src/collections/ResumeJobs/index.ts` (lines
~114–156) with:

```ts
BilingualRichTextField({
  name: 'task',
  layout: 'column',
  editorVariant: 'inline',
  required: true,
  label: false,
})
```

This removes the dead `beforeChange` hook and its stray `console.log(html)`
along with the hand-rolled group. Field names (`task.en`, `task.de`) stay
identical, so no data migration is needed — existing `tasks` array data
reads and writes the same way.

## Error handling summary

| Failure point | Behavior |
| --- | --- |
| Source field empty | Button disabled, no call made |
| `ANTHROPIC_API_KEY` missing / API call fails | Error thrown up to `TranslateControls`, surfaced via `toast.error(extractErrorMessage(error))`, target field untouched |
| Model returns malformed HTML | Caught in `parseHtmlToLexical`, falls back to a plain-text paragraph node instead of failing |
| Target field already has content | `window.confirm` gate before any call is made |

## Testing

- Unit test `BilingualRichTextField` (`src/fields/BilingualRichText/index.test.ts` or similar, Vitest) for both `layout` values: asserts the returned field shape (group → row-wrapped-or-flat → en/ui/de in order, correct `admin.width`s in row mode).
- Unit test `parseHtmlToLexical`'s fallback path by feeding it deliberately malformed HTML and asserting it returns a valid plain-paragraph `SerializedEditorState` instead of throwing.
- `fetchAnthropicTranslation` itself calls a real external API — follow the existing convention (`fetchAnthropicMetaDescription`/`fetchAnthropicImageAltText` have no direct unit tests either); rely on `parseHtmlToLexical`'s tests plus manual verification in the admin.

## Open items for the implementation plan

- Exact `Icon` names for the two translate buttons (pick from the existing
  icon set used elsewhere, e.g. `material-symbols` per the recent Lexical
  chrome cleanup).
- Whether `TranslateControls`' pending state should be per-direction (two
  independent spinners) or a single shared `isPending` disabling both
  buttons — recommend per-direction for a slightly better UX, final call
  left to implementation.
