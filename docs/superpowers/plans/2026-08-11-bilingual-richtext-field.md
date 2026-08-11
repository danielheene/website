# BilingualRichTextField Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `BilingualRichTextField` Payload field factory — a `group` with `en`/`de` `RichTextField` children, a `row`/`column` layout switch, and two AI-translate buttons between the fields — then refactor `ResumeJobs`' hand-rolled Tasks group to use it.

**Architecture:** Two new server-side units (an HTML↔Lexical parser and a Claude-backed translation function) feed a client `ui`-field component (`TranslateControls`) that sits between two ordinary `RichTextField`s inside a `group` field factory. All three richText/ui fields stay real, independent Payload fields — nothing about their native rendering is reimplemented, matching how `ToggleField` and `SectionGroupField` already augment native fields in this codebase.

**Tech Stack:** Payload 3.87 (Lexical rich text), `@ai-sdk/anthropic` + `ai`'s `generateText` (already used for `fetchAnthropicMetaDescription`/`fetchAnthropicImageAltText`), `@payloadcms/richtext-lexical`'s HTML converters and its `@lexical/*` proxy exports, `jsdom` for server-side HTML parsing, Vitest + `@testing-library/react` for tests.

## Global Constraints

- Design source: `docs/superpowers/specs/2026-08-11-bilingual-richtext-field-design.md`.
- Fixed to exactly two languages, `en`/`de` — no generic multi-locale support.
- Translation round-trips through HTML (`convertLexicalToHTML` → Claude → HTML → Lexical), not plaintext, so bold/italic/underline/strikethrough/link formatting survives. Guaranteed to work for the `inline`/`caption` `RichTextField` editor variants; headings/lists/tables/blocks from `markdown`/`post` variants are an accepted, documented limitation, not a bug to fix here.
- Overwrite guard: if the target language field already has content, gate the translate action behind `window.confirm(...)` before calling anything.
- Errors surface via `toast.error(extractErrorMessage(error))` from `@payloadcms/ui` / `src/lib/extractErrorMessage.ts` — never fail silently, never use `src/components/Toasty/Toasty.tsx` (that's an unrelated Konami-code easter egg, not a toast system).
- The Claude call is isolated in one function (`fetchAnthropicTranslation`) so swapping providers later (e.g. DeepL) is a small, contained change.
- Code style (Biome, `biome.json`): 2-space indent, single quotes, **no semicolons**, trailing commas everywhere, import order auto-organized by `pnpm format` — write new files matching this, don't hand-format.
- Follow existing `src/fields/<Name>/` conventions: factory in `index.ts`, custom admin components in `components/`, `deepMerge` from `'payload'` for merging overrides onto a base field shape.

## File Structure

- `src/fields/RichText/index.ts` — **modify**: export the two currently-private types (`RichTextEditorVariant`, `RichTextFieldOverrides`) so `BilingualRichTextField` can reuse them instead of redefining.
- `src/lib/lexical/parseHtmlToLexical.ts` — **create**: HTML → Lexical `SerializedEditorState` parser (headless editor + jsdom), with a plain-paragraph fallback on parse failure.
- `src/lib/fetchAnthropicTranslation.ts` — **create**: `'use server'` function, mirrors `fetchAnthropicMetaDescription.ts`; Lexical → HTML → Claude → `parseHtmlToLexical`.
- `src/fields/BilingualRichText/components/TranslateControls.tsx` — **create**: client `ui`-field component rendering the two translate buttons, wired to `useField` on both sibling language fields.
- `src/fields/BilingualRichText/index.ts` — **create**: `BilingualRichTextField` factory composing `en`/`de` `RichTextField`s + the `TranslateControls` `ui` field, in `row` or `column` layout.
- `src/collections/ResumeJobs/index.ts` — **modify**: replace the hand-rolled `task` group (and its dead debug `beforeChange` hook) with `BilingualRichTextField(...)`.
- `package.json` — **modify**: move `jsdom` from `devDependencies` to `dependencies` (needed at runtime by `parseHtmlToLexical`, not just in tests).

Task order follows the dependency chain: parser → translation function → UI component → field factory → collection refactor. Each task is independently testable before the next one consumes it.

---

### Task 1: `parseHtmlToLexical` — HTML → Lexical parser with a plain-text fallback

**Files:**
- Create: `src/lib/lexical/parseHtmlToLexical.ts`
- Test: `src/lib/lexical/parseHtmlToLexical.test.ts`
- Modify: `package.json` (move `jsdom` from `devDependencies` to `dependencies`)

**Interfaces:**
- Produces: `parseHtmlToLexical(html: string): SerializedEditorState` (`SerializedEditorState` from `@payloadcms/richtext-lexical/lexical`, re-exporting `lexical` core) — used by Task 2's `fetchAnthropicTranslation`.

- [ ] **Step 1: Move `jsdom` to a real runtime dependency**

In `package.json`, remove this line from the `devDependencies` block:

```json
    "jsdom": "^30.0.1",
```

(it currently sits between `"husky"` and `"lint-staged"`, around line 140)

Add it to the `dependencies` block, alphabetically between `"isomorphic-dompurify"` and `"libphonenumber-js"` (around line 82):

```json
    "isomorphic-dompurify": "^3.22.0",
    "jsdom": "^30.0.1",
    "libphonenumber-js": "^1.13.10",
```

Run: `pnpm install`
Expected: lockfile updates, no version change (same `^30.0.1`), install succeeds.

- [ ] **Step 2: Write the failing tests**

Create `src/lib/lexical/parseHtmlToLexical.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { parseHtmlToLexical } from './parseHtmlToLexical'

type MinimalNode = {
  type: string
  text?: string
  format?: number
  children?: MinimalNode[]
}

const firstParagraph = (result: ReturnType<typeof parseHtmlToLexical>): MinimalNode => {
  const root = result.root as unknown as { children: MinimalNode[] }
  return root.children[0]
}

describe('parseHtmlToLexical', () => {
  it('parses a paragraph with bold text into matching Lexical nodes', () => {
    const paragraph = firstParagraph(parseHtmlToLexical('<p>Hello <strong>world</strong></p>'))

    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children?.map((node) => node.text)).toEqual([
      'Hello ',
      'world',
    ])
    const boldNode = paragraph.children?.[1]
    expect((boldNode?.format ?? 0) & 1).toBe(1) // IS_BOLD bit
  })

  it('falls back to a plain-text paragraph when the HTML uses node types that are not registered', () => {
    // No TableNode/TableRowNode/TableCellNode is registered on the headless
    // editor built inside parseHtmlToLexical, so this forces the parse to
    // fail and the fallback path to run.
    const paragraph = firstParagraph(
      parseHtmlToLexical('<table><tr><td>unsupported cell content</td></tr></table>'),
    )

    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children?.[0]?.text).toContain('unsupported cell content')
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm exec vitest run src/lib/lexical/parseHtmlToLexical.test.ts`
Expected: FAIL — `Cannot find module './parseHtmlToLexical'` (file doesn't exist yet).

- [ ] **Step 4: Implement `parseHtmlToLexical`**

Create `src/lib/lexical/parseHtmlToLexical.ts`:

```ts
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { $getRoot, $insertNodes } from '@payloadcms/richtext-lexical/lexical'
import { createHeadlessEditor } from '@payloadcms/richtext-lexical/lexical/headless'
import { $generateNodesFromDOM } from '@payloadcms/richtext-lexical/lexical/html'
import { LinkNode } from '@payloadcms/richtext-lexical/lexical/link'
import { JSDOM } from 'jsdom'

/**
 * Builds a minimal single-paragraph Lexical value directly from plain text,
 * bypassing the editor entirely. Used as a fallback when `html` can't be
 * parsed back into registered Lexical nodes.
 */
const buildPlainParagraphValue = (text: string): SerializedEditorState =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: 0,
              style: '',
              mode: 'normal',
              detail: 0,
              version: 1,
              text,
            },
          ],
        },
      ],
    },
  }) as SerializedEditorState

/** Strips HTML tags and collapses whitespace, for the plain-text fallback. */
const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Parses an HTML fragment into a Lexical `SerializedEditorState` using a
 * headless editor (`@lexical/headless`) and `@lexical/html`'s DOM-based
 * parser, backed by `jsdom` for a server-side `Document`.
 *
 * Supports paragraphs, text formatting (bold/italic/underline/strikethrough),
 * and links — the node types available in the `inline`/`caption`
 * `RichTextField` editor variants. If parsing fails (a node type outside
 * that set, or malformed input), falls back to a single plain-text
 * paragraph built from `html` with tags stripped, so a bad round-trip
 * degrades instead of throwing.
 */
export const parseHtmlToLexical = (html: string): SerializedEditorState => {
  try {
    const editor = createHeadlessEditor({
      nodes: [
        LinkNode,
      ],
    })

    const dom = new JSDOM(html)

    editor.update(
      () => {
        const root = $getRoot()
        root.clear()
        const nodes = $generateNodesFromDOM(editor, dom.window.document)
        root.select()
        $insertNodes(nodes)
      },
      {
        discrete: true,
      },
    )

    return editor.getEditorState().toJSON()
  } catch {
    return buildPlainParagraphValue(stripHtml(html))
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/lib/lexical/parseHtmlToLexical.test.ts`
Expected: PASS (2 tests). If the "unsupported node types" test doesn't hit the fallback (i.e. `$generateNodesFromDOM` degrades gracefully instead of throwing for `<table>`), adjust the test's HTML to whatever input the failing run shows does throw, and re-run — the fallback branch itself doesn't change either way.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/lexical/parseHtmlToLexical.ts src/lib/lexical/parseHtmlToLexical.test.ts
git commit -m "feat(lexical): add HTML-to-Lexical parser with a plain-text fallback

Promotes jsdom to a runtime dependency (it was test-only before) so
this can parse HTML into Lexical nodes on the server, per @lexical/html's
own documented headless pattern.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UcdpbgbgqjopEztYdGQkk5"
```

---

### Task 2: `fetchAnthropicTranslation` — Claude-backed translation server action

**Files:**
- Create: `src/lib/fetchAnthropicTranslation.ts`
- Test: `src/lib/fetchAnthropicTranslation.test.ts`

**Interfaces:**
- Consumes: `parseHtmlToLexical(html: string): SerializedEditorState` (Task 1).
- Produces: `fetchAnthropicTranslation({ value, sourceLanguage, targetLanguage }): Promise<SerializedEditorState | null>`, `type BilingualLanguage = 'en' | 'de'`, `BILINGUAL_LANGUAGE_LABEL: Record<BilingualLanguage, string>` — all consumed by Task 3's `TranslateControls`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/fetchAnthropicTranslation.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.fn()

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: () => (model: string) => ({
    modelId: model,
  }),
}))

const { fetchAnthropicTranslation } = await import('./fetchAnthropicTranslation')

const paragraphDocument = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: text
      ? [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                type: 'text',
                format: 0,
                style: '',
                mode: 'normal',
                detail: 0,
                version: 1,
                text,
              },
            ],
          },
        ]
      : [],
  },
})

describe('fetchAnthropicTranslation', () => {
  it('returns null without calling the model when the source is empty', async () => {
    const result = await fetchAnthropicTranslation({
      value: paragraphDocument('') as never,
      sourceLanguage: 'en',
      targetLanguage: 'de',
    })

    expect(result).toBeNull()
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('sends the source HTML to the model and parses the translated result back into Lexical', async () => {
    generateTextMock.mockResolvedValue({
      text: '<p>Hallo Welt</p>',
    })

    const result = await fetchAnthropicTranslation({
      value: paragraphDocument('Hello world') as never,
      sourceLanguage: 'en',
      targetLanguage: 'de',
    })

    expect(generateTextMock).toHaveBeenCalledTimes(1)
    const [call] = generateTextMock.mock.calls
    expect(call[0].prompt).toContain('Hello world')
    expect(call[0].system).toContain('English')
    expect(call[0].system).toContain('German')

    const root = result?.root as unknown as { children: Array<{ children: Array<{ text: string }> }> }
    expect(root.children[0].children[0].text).toBe('Hallo Welt')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run src/lib/fetchAnthropicTranslation.test.ts`
Expected: FAIL — `Cannot find module './fetchAnthropicTranslation'`.

- [ ] **Step 3: Implement `fetchAnthropicTranslation`**

Create `src/lib/fetchAnthropicTranslation.ts`:

```ts
'use server'

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import dedent from 'dedent'

import { parseHtmlToLexical } from '@/lib/lexical/parseHtmlToLexical'

export type BilingualLanguage = 'en' | 'de'

export const BILINGUAL_LANGUAGE_LABEL: Record<BilingualLanguage, string> = {
  en: 'English',
  de: 'German',
}

type FetchAnthropicTranslationArgs = {
  value: SerializedEditorState
  sourceLanguage: BilingualLanguage
  targetLanguage: BilingualLanguage
}

/**
 * Translates a Lexical rich-text value from one language to another via
 * Claude, round-tripping through HTML so formatting (bold/italic/links)
 * survives translation. Returns `null` if the source field is empty.
 */
export const fetchAnthropicTranslation = async ({
  value,
  sourceLanguage,
  targetLanguage,
}: FetchAnthropicTranslationArgs): Promise<SerializedEditorState | null> => {
  const html = convertLexicalToHTML({
    data: value,
    disableContainer: true,
  })

  if (!html.trim()) return null

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const { text: translatedHtml } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: dedent`
      Translate the following ${BILINGUAL_LANGUAGE_LABEL[sourceLanguage]} HTML fragment
      into ${BILINGUAL_LANGUAGE_LABEL[targetLanguage]}. Preserve the HTML tags and
      structure exactly - translate only the text content. Keep the tone
      concise and professional, appropriate for a CV/résumé bullet point.
      Return only the translated HTML fragment, no explanation, no code
      fences, no surrounding <html>/<body> tags.
    `,
    prompt: html,
  })

  return parseHtmlToLexical(translatedHtml)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/lib/fetchAnthropicTranslation.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/fetchAnthropicTranslation.ts src/lib/fetchAnthropicTranslation.test.ts
git commit -m "feat: add fetchAnthropicTranslation server action

Mirrors the existing fetchAnthropicMetaDescription/fetchAnthropicImageAltText
pattern. Round-trips Lexical content through HTML so formatting survives
translation, via the new parseHtmlToLexical helper.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UcdpbgbgqjopEztYdGQkk5"
```

---

### Task 3: `TranslateControls` — client `ui`-field component

**Files:**
- Create: `src/fields/BilingualRichText/components/TranslateControls.tsx`
- Test: `src/fields/BilingualRichText/components/TranslateControls.test.tsx`

**Interfaces:**
- Consumes: `fetchAnthropicTranslation`, `BilingualLanguage`, `BILINGUAL_LANGUAGE_LABEL` (Task 2); `extractErrorMessage(error: unknown): string` (existing, `src/lib/extractErrorMessage.ts`); `Button` (existing, `src/components/Button`); `Icon` (existing, `src/components/Icon`).
- Produces: `TranslateControls: UIFieldClientComponent`, default-exported and named-exported — consumed by Task 4's field factory via its `admin.components.Field` path string `@/fields/BilingualRichText/components/TranslateControls`.

- [ ] **Step 1: Write the failing tests**

Create `src/fields/BilingualRichText/components/TranslateControls.test.tsx`:

```tsx
// @vitest-environment jsdom
import type { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state: Record<string, { value: unknown; setValue: ReturnType<typeof vi.fn> }> = {}

const toastErrorMock = vi.fn()
const fetchAnthropicTranslationMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  fieldBaseClass: 'field-type',
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
  useField: ({ path }: { path: string }) => state[path],
}))

vi.mock('@/lib/fetchAnthropicTranslation', () => ({
  fetchAnthropicTranslation: (...args: unknown[]) => fetchAnthropicTranslationMock(...args),
  BILINGUAL_LANGUAGE_LABEL: {
    en: 'English',
    de: 'German',
  },
}))

const { TranslateControls } = await import('./TranslateControls')

type Props = ComponentProps<typeof TranslateControls>

const paragraph = (text: string) => ({
  root: {
    children: text
      ? [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text,
              },
            ],
          },
        ]
      : [],
  },
})

const setField = (path: string, value: unknown) => {
  state[path] = {
    value,
    setValue: vi.fn(),
  }
}

const renderControls = () =>
  render(<TranslateControls {...({ path: 'task.translateControls' } as Props)} />)

beforeEach(() => {
  toastErrorMock.mockReset()
  fetchAnthropicTranslationMock.mockReset()
  setField('task.en', paragraph('Hello'))
  setField('task.de', paragraph(''))
})

describe('TranslateControls', () => {
  it('disables the EN→DE button when English is empty', () => {
    setField('task.en', paragraph(''))
    renderControls()

    expect(screen.getByLabelText('Translate English to German')).toBeDisabled()
  })

  it('translates English into German and sets the result', async () => {
    fetchAnthropicTranslationMock.mockResolvedValue(paragraph('Hallo'))
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    await waitFor(() => {
      expect(state['task.de'].setValue).toHaveBeenCalledWith(paragraph('Hallo'))
    })
    expect(fetchAnthropicTranslationMock).toHaveBeenCalledWith({
      value: paragraph('Hello'),
      sourceLanguage: 'en',
      targetLanguage: 'de',
    })
  })

  it('asks for confirmation before overwriting existing German content, and aborts on cancel', () => {
    setField('task.de', paragraph('Bereits vorhanden'))
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(fetchAnthropicTranslationMock).not.toHaveBeenCalled()
  })

  it('surfaces a toast and leaves the field untouched when translation fails', async () => {
    fetchAnthropicTranslationMock.mockRejectedValue(new Error('boom'))
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('boom')
    })
    expect(state['task.de'].setValue).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run src/fields/BilingualRichText/components/TranslateControls.test.tsx`
Expected: FAIL — `Cannot find module './TranslateControls'`.

- [ ] **Step 3: Implement `TranslateControls`**

Create `src/fields/BilingualRichText/components/TranslateControls.tsx`:

```tsx
'use client'

import { useCallback, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { fieldBaseClass, toast, useField } from '@payloadcms/ui'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import {
  BILINGUAL_LANGUAGE_LABEL,
  BilingualLanguage,
  fetchAnthropicTranslation,
} from '@/lib/fetchAnthropicTranslation'

const isEmptyValue = (value: SerializedEditorState | undefined): boolean => {
  const children = (value?.root as { children?: unknown[] } | undefined)?.children
  if (!children || children.length === 0) return true
  if (children.length > 1) return false
  const [onlyChild] = children as Array<{ children?: unknown[] }>
  return !onlyChild.children || onlyChild.children.length === 0
}

/** Swaps the last path segment for `name`, e.g. `task.controls` -> `task.en`. */
const siblingPath = (path: string, name: string): string => {
  const segments = path.split('.')
  segments[segments.length - 1] = name
  return segments.join('.')
}

export const TranslateControls: UIFieldClientComponent = ({ path }) => {
  const { value: enValue, setValue: setEnValue } = useField<SerializedEditorState>({
    path: siblingPath(path, 'en'),
  })
  const { value: deValue, setValue: setDeValue } = useField<SerializedEditorState>({
    path: siblingPath(path, 'de'),
  })

  const [isTranslatingToDe, setIsTranslatingToDe] = useState(false)
  const [isTranslatingToEn, setIsTranslatingToEn] = useState(false)

  const translate = useCallback(
    async (
      sourceLanguage: BilingualLanguage,
      targetLanguage: BilingualLanguage,
      sourceValue: SerializedEditorState | undefined,
      targetValue: SerializedEditorState | undefined,
      setTargetValue: (value: SerializedEditorState) => void,
      setIsTranslating: (value: boolean) => void,
    ) => {
      if (!sourceValue || isEmptyValue(sourceValue)) return

      if (!isEmptyValue(targetValue)) {
        const confirmed = window.confirm(
          `Replace the ${BILINGUAL_LANGUAGE_LABEL[targetLanguage]} content with a translation from ${BILINGUAL_LANGUAGE_LABEL[sourceLanguage]}?`,
        )
        if (!confirmed) return
      }

      setIsTranslating(true)
      try {
        const translated = await fetchAnthropicTranslation({
          value: sourceValue,
          sourceLanguage,
          targetLanguage,
        })
        if (translated) setTargetValue(translated)
      } catch (error) {
        toast.error(extractErrorMessage(error))
      } finally {
        setIsTranslating(false)
      }
    },
    [],
  )

  return (
    <div
      className={cn([
        fieldBaseClass,
        'bilingual-rich-text-translate-controls',
        'flex flex-col gap-1.5 items-center justify-center',
      ])}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label={`Translate ${BILINGUAL_LANGUAGE_LABEL.en} to ${BILINGUAL_LANGUAGE_LABEL.de}`}
        disabled={isEmptyValue(enValue) || isTranslatingToDe}
        onClick={() =>
          translate('en', 'de', enValue, deValue, setDeValue, setIsTranslatingToDe)
        }
      >
        <Icon name="material-symbols:arrow-right-alt-rounded" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label={`Translate ${BILINGUAL_LANGUAGE_LABEL.de} to ${BILINGUAL_LANGUAGE_LABEL.en}`}
        disabled={isEmptyValue(deValue) || isTranslatingToEn}
        onClick={() =>
          translate('de', 'en', deValue, enValue, setEnValue, setIsTranslatingToEn)
        }
      >
        <Icon name="material-symbols:arrow-left-alt-rounded" />
      </Button>
    </div>
  )
}

export default TranslateControls
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/fields/BilingualRichText/components/TranslateControls.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/fields/BilingualRichText/components/TranslateControls.tsx src/fields/BilingualRichText/components/TranslateControls.test.tsx
git commit -m "feat(fields): add TranslateControls ui-field component

Two icon buttons between a bilingual field's en/de RichTextFields,
each calling fetchAnthropicTranslation and setting the sibling field's
value. Confirms before overwriting existing content, surfaces failures
via toast.error.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UcdpbgbgqjopEztYdGQkk5"
```

---

### Task 4: `BilingualRichTextField` — the field factory

**Files:**
- Modify: `src/fields/RichText/index.ts:155-156` (add `export` to `RichTextEditorVariant` and `RichTextFieldOverrides`)
- Create: `src/fields/BilingualRichText/index.ts`
- Test: `src/fields/BilingualRichText/index.test.ts`

**Interfaces:**
- Consumes: `RichTextField`, `RichTextEditorVariant`, `RichTextFieldOverrides` (from `src/fields/RichText`, this task); `TranslateControls` (Task 3, referenced only by its component path string, not imported).
- Produces: `BilingualRichTextField({ name, layout?, editorVariant?, label?, required?, overrides? }): GroupField` — consumed by Task 5's `ResumeJobs` refactor.

- [ ] **Step 1: Export the two RichText types**

In `src/fields/RichText/index.ts`, change:

```ts
type RichTextEditorVariant = 'inline' | 'caption' | 'markdown' | 'post'
type RichTextFieldOverrides = Partial<Omit<PayloadRichTextField, 'name' | 'type' | 'editor'>>
```

to:

```ts
export type RichTextEditorVariant = 'inline' | 'caption' | 'markdown' | 'post'
export type RichTextFieldOverrides = Partial<Omit<PayloadRichTextField, 'name' | 'type' | 'editor'>>
```

- [ ] **Step 2: Write the failing tests**

Create `src/fields/BilingualRichText/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { GroupField, RowField, UIField } from 'payload'

import { BilingualRichTextField } from './index'

describe('BilingualRichTextField', () => {
  it('stacks en, translate controls, and de in column layout (the default)', () => {
    const field = BilingualRichTextField({
      name: 'task',
    })

    expect(field.type).toBe('group')
    expect(field.name).toBe('task')
    expect(field.fields).toHaveLength(3)
    expect(field.fields.map((f) => (f as { name: string }).name)).toEqual([
      'en',
      'taskTranslateControls',
      'de',
    ])
    expect(field.fields[0].type).toBe('richText')
    expect(field.fields[1].type).toBe('ui')
    expect(field.fields[2].type).toBe('richText')
  })

  it('wraps en, translate controls, and de in a row when layout is "row"', () => {
    const field = BilingualRichTextField({
      name: 'task',
      layout: 'row',
    })

    expect(field.fields).toHaveLength(1)
    const row = field.fields[0] as RowField
    expect(row.type).toBe('row')
    expect(row.fields.map((f) => (f as { name: string }).name)).toEqual([
      'en',
      'taskTranslateControls',
      'de',
    ])
    expect((row.fields[0] as { admin?: { width?: string } }).admin?.width).toBe('45%')
    expect((row.fields[1] as { admin?: { width?: string } }).admin?.width).toBe('10%')
    expect((row.fields[2] as { admin?: { width?: string } }).admin?.width).toBe('45%')
  })

  it('marks both language fields required when required is true', () => {
    const field = BilingualRichTextField({
      name: 'task',
      required: true,
    })

    expect((field.fields[0] as { required?: boolean }).required).toBe(true)
    expect((field.fields[2] as { required?: boolean }).required).toBe(true)
  })

  it('points the translate-controls ui field at the TranslateControls component', () => {
    const field = BilingualRichTextField({
      name: 'task',
    })

    const controls = field.fields[1] as UIField
    expect(controls.admin?.components?.Field).toBe(
      '@/fields/BilingualRichText/components/TranslateControls',
    )
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm exec vitest run src/fields/BilingualRichText/index.test.ts`
Expected: FAIL — `Cannot find module './index'`.

- [ ] **Step 4: Implement `BilingualRichTextField`**

Create `src/fields/BilingualRichText/index.ts`:

```ts
import type { GroupField, RowField, UIField } from 'payload'
import { deepMerge } from 'payload'

import { RichTextField } from '@/fields/RichText'
import type { RichTextEditorVariant, RichTextFieldOverrides } from '@/fields/RichText'

type BilingualRichTextFieldOverrides = {
  en?: RichTextFieldOverrides
  de?: RichTextFieldOverrides
}

type BilingualRichTextFieldProps = {
  name: string
  layout?: 'row' | 'column'
  editorVariant?: RichTextEditorVariant
  label?: string | false
  required?: boolean
  overrides?: BilingualRichTextFieldOverrides
}

export const BilingualRichTextField = ({
  name,
  layout = 'column',
  editorVariant = 'inline',
  label = false,
  required = false,
  overrides = {},
}: BilingualRichTextFieldProps): GroupField => {
  const baseOverrides = (language: 'English' | 'German'): RichTextFieldOverrides => ({
    label: language,
    required,
    ...(layout === 'row' ? { admin: { width: '45%' } } : {}),
  })

  const enField = RichTextField({
    name: 'en',
    editorVariant,
    overrides: deepMerge<RichTextFieldOverrides, RichTextFieldOverrides>(
      baseOverrides('English'),
      overrides.en ?? {},
    ),
  })

  const deField = RichTextField({
    name: 'de',
    editorVariant,
    overrides: deepMerge<RichTextFieldOverrides, RichTextFieldOverrides>(
      baseOverrides('German'),
      overrides.de ?? {},
    ),
  })

  const translateControls: UIField = {
    type: 'ui',
    name: `${name}TranslateControls`,
    admin: {
      ...(layout === 'row' ? { width: '10%' } : {}),
      components: {
        Field: '@/fields/BilingualRichText/components/TranslateControls',
      },
    },
  }

  const fields: GroupField['fields'] =
    layout === 'row'
      ? [
          {
            type: 'row',
            fields: [
              enField,
              translateControls,
              deField,
            ],
          } satisfies RowField,
        ]
      : [
          enField,
          translateControls,
          deField,
        ]

  return {
    type: 'group',
    name,
    label,
    admin: {
      hideGutter: true,
    },
    fields,
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/fields/BilingualRichText/index.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/fields/RichText/index.ts src/fields/BilingualRichText/index.ts src/fields/BilingualRichText/index.test.ts
git commit -m "feat(fields): add BilingualRichTextField factory

Composes en/de RichTextFields with TranslateControls between them,
in a group field. Supports row (side-by-side) and column (stacked,
default) layouts. Exports RichTextEditorVariant/RichTextFieldOverrides
from RichText so this factory can type against them.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UcdpbgbgqjopEztYdGQkk5"
```

---

### Task 5: Refactor `ResumeJobs` to use `BilingualRichTextField`

**Files:**
- Modify: `src/collections/ResumeJobs/index.ts:1-9, 98-159`

**Interfaces:**
- Consumes: `BilingualRichTextField` (Task 4).

- [ ] **Step 1: Remove the now-unused import and the dead debug hook**

In `src/collections/ResumeJobs/index.ts`, remove this import (no longer used anywhere in the file after this task):

```ts
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
```

Add this import instead:

```ts
import { BilingualRichTextField } from '@/fields/BilingualRichText'
```

- [ ] **Step 2: Replace the hand-rolled `task` group**

Replace this block (currently the second top-level field, spanning the `tasks` array's `task` group):

```ts
    {
      type: 'group',
      admin: {
        hideGutter: true,
      },
      fields: [
        {
          type: 'array',
          name: 'tasks',
          label: 'Tasks',
          labels: {
            singular: 'Task',
            plural: 'Tasks',
          },
          defaultValue: [],
          fields: [
            {
              type: 'group',
              name: 'task',
              label: false,
              admin: {
                hideGutter: true,
              },
              fields: [
                RichTextField({
                  name: 'en',
                  editorVariant: 'inline',
                  overrides: {
                    label: 'English',
                    required: true,
                    hooks: {
                      beforeChange: [
                        async ({ value, siblingData, data, previousValue }) => {
                          // if (value === previousValue) {
                          const html = convertLexicalToHTML({
                            disableContainer: true,
                            data: value,
                          })
                          console.log(html)
                          // }
                          // if (!value) {
                          //   throw new Error('English task is required')
                          // }
                        },
                      ],
                    },
                  },
                }),
                RichTextField({
                  name: 'de',
                  editorVariant: 'inline',
                  overrides: {
                    label: 'German',
                    required: true,
                  },
                }),
              ],
            },
          ],
        },
      ],
    },
```

with:

```ts
    {
      type: 'group',
      admin: {
        hideGutter: true,
      },
      fields: [
        {
          type: 'array',
          name: 'tasks',
          label: 'Tasks',
          labels: {
            singular: 'Task',
            plural: 'Tasks',
          },
          defaultValue: [],
          fields: [
            BilingualRichTextField({
              name: 'task',
              layout: 'column',
              editorVariant: 'inline',
              required: true,
              label: false,
            }),
          ],
        },
      ],
    },
```

Note: the `RichTextField` import at the top of the file is still used elsewhere in `ResumeJobs`? Check with a quick search after editing — if this was the only usage, remove the now-unused `import { RichTextField } from '@/fields/RichText'` too; if other fields in this collection still call it directly, leave it.

- [ ] **Step 3: Regenerate Payload's types and import map**

Run: `pnpm generate`
Expected: succeeds, updates `src/types/payload.ts` (field shape is unchanged — `task.en`/`task.de` — so no type diff is expected there) and registers the new `TranslateControls` component path in Payload's admin import map (required for the admin UI to resolve `@/fields/BilingualRichText/components/TranslateControls`). This needs a working `DATABASE_URL`/Doppler env per `README.md`; if it's not available in this environment, note that explicitly instead of skipping the step silently — the import map registration is required before the field is usable in the admin.

- [ ] **Step 4: Verify the full test suite and lint still pass**

Run: `pnpm test`
Expected: PASS — no existing test in the repo references the old `ResumeJobs` task-group shape directly, so this should be a clean pass covering the new files from Tasks 1-4 plus everything pre-existing.

Run: `pnpm exec biome check src/collections/ResumeJobs/index.ts src/fields/BilingualRichText src/fields/RichText/index.ts src/lib/fetchAnthropicTranslation.ts src/lib/lexical/parseHtmlToLexical.ts`
Expected: no new errors on the files this plan touched. (Per `AGENTS.md`, `pnpm lint` may still report pre-existing failures elsewhere on `main` — that's expected and out of scope here.)

- [ ] **Step 5: Commit**

```bash
git add src/collections/ResumeJobs/index.ts src/types/payload.ts app/\(payload\)/admin/importMap.js
git commit -m "refactor(resume-jobs): use BilingualRichTextField for Tasks

Replaces the hand-rolled en/de group with the new reusable field,
dropping the dead debug beforeChange hook (stray console.log(html)
left over from an earlier investigation). Field names (task.en,
task.de) are unchanged, so no data migration is needed.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UcdpbgbgqjopEztYdGQkk5"
```

(Adjust the `importMap.js` path in the `git add` above to whatever `pnpm generate` actually touched — check `git status` before committing.)

## Manual verification (after Task 5)

Automated tests cover the field factory's shape and the translate/parse logic in isolation. Two things only a human can verify in the real admin UI:

1. Open a `ResumeJobs` document in the Payload admin, add a task, type English text, click the EN→DE button, and confirm German text appears (a real Claude call — needs `ANTHROPIC_API_KEY` configured).
2. Add `BilingualRichTextField({ name: 'x', layout: 'row' })` to a scratch field temporarily (or just inspect the two `row`-layout automated test assertions) to confirm the row layout actually renders en/controls/de side by side with sane proportions in the browser — the automated test only checks the field config shape, not the rendered CSS.

## Self-review notes

- **Spec coverage**: all five design sections (factory API, `TranslateControls`, `fetchAnthropicTranslation`, `jsdom` dependency change, `ResumeJobs` refactor) map to Tasks 1-5. The spec's two "open items" (icon names, per-direction vs. shared pending state) are resolved in Task 3: `material-symbols:arrow-right-alt-rounded`/`arrow-left-alt-rounded`, per-direction `isTranslatingToDe`/`isTranslatingToEn`.
- **Type consistency checked**: `BilingualLanguage`/`BILINGUAL_LANGUAGE_LABEL` (Task 2) are the same names imported in Task 3; `RichTextEditorVariant`/`RichTextFieldOverrides` (Task 4 Step 1) match the names imported in Task 4 Step 4; `parseHtmlToLexical(html: string)` (Task 1) matches its call site in Task 2 Step 3.
- **Known uncertainty flagged, not hidden**: Task 1 Step 5 explicitly tells the implementer what to do if the malformed-HTML fixture doesn't trigger the fallback branch as expected, rather than asserting it definitely will — this is real risk (unverified against a live run) called out at the point where TDD would surface it.
