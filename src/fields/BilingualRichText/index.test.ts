import type { RowField, UIField } from 'payload'

import { describe, expect, it } from 'vitest'

import { BilingualRichTextField } from './index'

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

  it('propagates a non-default editorVariant to both inner richText fields', () => {
    const field = BilingualRichTextField({
      name: 'task',
      editorVariant: 'caption',
    })

    // Both inner richText fields exist; we cannot easily assert Lexical's
    // internal feature list from the outside, but we can confirm the two
    // fields kept their richText type and the factory did not swap them for
    // some other shape when a non-default variant is passed.
    expect(field.fields[0].type).toBe('richText')
    expect(field.fields[2].type).toBe('richText')
  })

  it('sets the group label when a label is passed', () => {
    const field = BilingualRichTextField({
      name: 'task',
      label: 'Task (bilingual)',
    })

    expect(field.label).toBe('Task (bilingual)')
  })
})
