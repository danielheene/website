import type { FieldHook, RowField, UIField } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { enqueueAutoTranslate } from '@/fields/BilingualRichText/hooks/enqueueAutoTranslate'

// The real `lexicalEditor()` (from `@payloadcms/richtext-lexical`) returns an
// opaque async resolver function that can't be introspected without a full
// sanitized Payload config (collections, i18n translations, etc). Replace it
// with an identity function so the `features` array `createRichTextEditor`
// builds per variant (see src/fields/RichText/index.ts:216-329) is directly
// visible on the returned field's `editor` property, which lets the
// editorVariant-propagation test below assert something real instead of a
// tautology.
vi.mock('@payloadcms/richtext-lexical', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@payloadcms/richtext-lexical')>()
  return {
    ...actual,
    lexicalEditor: (args: unknown) => args,
  }
})

const { BilingualRichTextField } = await import('./index')

const innerRowFields = (field: ReturnType<typeof BilingualRichTextField>): RowField['fields'] => {
  const row = field.fields[0] as RowField
  return row.fields
}

const fieldNames = (fields: RowField['fields']): string[] =>
  fields.map(
    (f) =>
      (
        f as {
          name: string
        }
      ).name,
  )

describe('BilingualRichTextField', () => {
  it('wraps en, translate controls, and de in a single row, both in column and row layout', () => {
    const columnField = BilingualRichTextField({
      name: 'task',
    })
    const rowField = BilingualRichTextField({
      name: 'task',
      layout: 'row',
    })

    for (const field of [
      columnField,
      rowField,
    ]) {
      expect(field.type).toBe('group')
      expect(field.name).toBe('task')
      expect(field.fields).toHaveLength(1)
      expect(field.fields[0].type).toBe('row')

      const inner = innerRowFields(field)
      expect(fieldNames(inner)).toEqual([
        'en',
        'taskTranslateControls',
        'de',
      ])
      expect(inner[0].type).toBe('richText')
      expect(inner[1].type).toBe('ui')
      expect(inner[2].type).toBe('richText')
    }
  })

  it('marks both language fields required when required is true', () => {
    const field = BilingualRichTextField({
      name: 'task',
      required: true,
    })
    const inner = innerRowFields(field)

    expect(
      (
        inner[0] as {
          required?: boolean
        }
      ).required,
    ).toBe(true)
    expect(
      (
        inner[2] as {
          required?: boolean
        }
      ).required,
    ).toBe(true)
  })

  it('points the translate-controls ui field at TranslateControls and forwards layout as a clientProp', () => {
    const rowField = BilingualRichTextField({
      name: 'task',
      layout: 'row',
    })
    const columnField = BilingualRichTextField({
      name: 'task',
      layout: 'column',
    })

    const rowControls = innerRowFields(rowField)[1] as UIField
    const columnControls = innerRowFields(columnField)[1] as UIField

    expect(rowControls.admin?.components?.Field).toEqual({
      path: '@/fields/BilingualRichText/components/TranslateControls',
      clientProps: {
        layout: 'row',
      },
    })
    expect(columnControls.admin?.components?.Field).toEqual({
      path: '@/fields/BilingualRichText/components/TranslateControls',
      clientProps: {
        layout: 'column',
      },
    })
  })

  it("wires enqueueAutoTranslate as the group field's afterChange hook", () => {
    const field = BilingualRichTextField({
      name: 'task',
    })

    // FieldHook, not GroupFieldAfterChangeHook — the group-specific hook
    // type doesn't exist in this payload version; enqueueAutoTranslate itself
    // is typed FieldHook<AnyDocWithID, BilingualValue> (see its own file).
    const afterChange = field.hooks?.afterChange as FieldHook[] | undefined
    expect(afterChange).toEqual([
      enqueueAutoTranslate,
    ])
  })

  it('merges caller overrides.en onto the base English field overrides (caller wins)', () => {
    const field = BilingualRichTextField({
      name: 'task',
      overrides: {
        en: {
          label: 'English (custom)',
        },
      },
    })
    const inner = innerRowFields(field)

    expect(
      (
        inner[0] as {
          label?: unknown
        }
      ).label,
    ).toBe('English (custom)')
    // German stays untouched
    expect(
      (
        inner[2] as {
          label?: unknown
        }
      ).label,
    ).toBe('German')
  })

  it("propagates a non-default editorVariant into the inner richText fields' editor config", () => {
    const inlineField = BilingualRichTextField({
      name: 'task',
      editorVariant: 'inline',
    })
    const captionField = BilingualRichTextField({
      name: 'task',
      editorVariant: 'caption',
    })

    // `lexicalEditor` is mocked to an identity function above, so `editor`
    // here is the raw `{ features, ... }` args createRichTextEditor built
    // for each variant (see src/fields/RichText/index.ts:216-329).
    // `captionFeatures` is a strict superset of `inlineFeatures`, so the
    // feature counts must differ. If a future edit dropped `editorVariant`
    // on its way to RichTextField, both sides would collapse to the same
    // default-variant ('inline') feature set and this would fail.
    const inlineEditor = (
      innerRowFields(inlineField)[0] as {
        editor?: {
          features?: unknown[]
        }
      }
    ).editor
    const captionEditor = (
      innerRowFields(captionField)[0] as {
        editor?: {
          features?: unknown[]
        }
      }
    ).editor

    expect(inlineEditor?.features).toBeDefined()
    expect(captionEditor?.features).toBeDefined()
    expect(captionEditor?.features?.length).toBeGreaterThan(inlineEditor?.features?.length ?? 0)
  })

  it('sets the group label when a label is passed', () => {
    const field = BilingualRichTextField({
      name: 'task',
      label: 'Task (bilingual)',
    })

    expect(field.label).toBe('Task (bilingual)')
  })
})
