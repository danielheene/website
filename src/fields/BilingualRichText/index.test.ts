import type { FieldHook, RichTextField, RowField, UIField } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { enqueueAutoTranslate } from '@/fields/BilingualRichText/hooks/enqueueAutoTranslate'

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

  it('does not set required on the individual language fields when required is true', () => {
    // A one-sided save is exactly what enqueueAutoTranslate exists to
    // backfill — Payload's own per-field `required` would reject it before
    // that hook ever runs, so `required` is enforced via `validate` instead
    // (see the tests below) rather than the built-in flag.
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
    ).toBeUndefined()
    expect(
      (
        inner[2] as {
          required?: boolean
        }
      ).required,
    ).toBeUndefined()
  })

  it('does not attach a validate function to either field when required is false (the default)', () => {
    const field = BilingualRichTextField({
      name: 'task',
    })
    const inner = innerRowFields(field)

    expect((inner[0] as RichTextField).validate).toBeUndefined()
    expect((inner[2] as RichTextField).validate).toBeUndefined()
  })

  describe('required: true — at-least-one-language validate', () => {
    const field = BilingualRichTextField({
      name: 'task',
      required: true,
    })
    const inner = innerRowFields(field)
    const enValidate = (inner[0] as RichTextField).validate
    const deValidate = (inner[2] as RichTextField).validate

    // biome-ignore lint/suspicious/noExplicitAny: minimal stand-in for ValidateOptions — only siblingData is read
    const withSiblingData = (siblingData: Record<string, unknown>): any => ({
      siblingData,
    })

    it('passes when this field has content, regardless of the other language', () => {
      expect(
        enValidate?.(
          paragraph('Hello'),
          withSiblingData({
            de: paragraph(''),
          }),
        ),
      ).toBe(true)
    })

    it('passes when the other language has content and this field is empty', () => {
      expect(
        enValidate?.(
          paragraph(''),
          withSiblingData({
            de: paragraph('Hallo'),
          }),
        ),
      ).toBe(true)
    })

    it('fails when both languages are empty', () => {
      const result = enValidate?.(
        paragraph(''),
        withSiblingData({
          de: paragraph(''),
        }),
      )

      expect(result).not.toBe(true)
      expect(typeof result).toBe('string')
    })

    it('reads the correct sibling field for German (the other direction)', () => {
      expect(
        deValidate?.(
          paragraph(''),
          withSiblingData({
            en: paragraph('Hello'),
          }),
        ),
      ).toBe(true)

      const result = deValidate?.(
        paragraph(''),
        withSiblingData({
          en: paragraph(''),
        }),
      )
      expect(result).not.toBe(true)
    })
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
