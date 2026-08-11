import type { RowField, UIField } from 'payload'

import { describe, expect, it, vi } from 'vitest'

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

describe('BilingualRichTextField', () => {
  it('stacks en, translate controls, and de in column layout (the default)', () => {
    const field = BilingualRichTextField({
      name: 'task',
    })

    expect(field.type).toBe('group')
    expect(field.name).toBe('task')
    expect(field.fields).toHaveLength(3)
    expect(
      field.fields.map(
        (f) =>
          (
            f as {
              name: string
            }
          ).name,
      ),
    ).toEqual([
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
    expect(
      row.fields.map(
        (f) =>
          (
            f as {
              name: string
            }
          ).name,
      ),
    ).toEqual([
      'en',
      'taskTranslateControls',
      'de',
    ])
    expect(
      (
        row.fields[0] as {
          admin?: {
            width?: string
          }
        }
      ).admin?.width,
    ).toBe('45%')
    expect(
      (
        row.fields[1] as {
          admin?: {
            width?: string
          }
        }
      ).admin?.width,
    ).toBe('10%')
    expect(
      (
        row.fields[2] as {
          admin?: {
            width?: string
          }
        }
      ).admin?.width,
    ).toBe('45%')
  })

  it('marks both language fields required when required is true', () => {
    const field = BilingualRichTextField({
      name: 'task',
      required: true,
    })

    expect(
      (
        field.fields[0] as {
          required?: boolean
        }
      ).required,
    ).toBe(true)
    expect(
      (
        field.fields[2] as {
          required?: boolean
        }
      ).required,
    ).toBe(true)
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

  it('merges caller overrides.en onto the base English field overrides (caller wins)', () => {
    const field = BilingualRichTextField({
      name: 'task',
      overrides: {
        en: {
          label: 'English (custom)',
        },
      },
    })

    expect(
      (
        field.fields[0] as {
          label?: unknown
        }
      ).label,
    ).toBe('English (custom)')
    // German stays untouched
    expect(
      (
        field.fields[2] as {
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
      inlineField.fields[0] as {
        editor?: {
          features?: unknown[]
        }
      }
    ).editor
    const captionEditor = (
      captionField.fields[0] as {
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
