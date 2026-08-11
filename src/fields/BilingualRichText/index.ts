import type { GroupField, RowField, UIField } from 'payload'
import { deepMerge } from 'payload'

import type { RichTextEditorVariant, RichTextFieldOverrides } from '@/fields/RichText'
import { RichTextField } from '@/fields/RichText'

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
    ...(layout === 'row'
      ? {
          admin: {
            width: '45%',
          },
        }
      : {}),
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
      ...(layout === 'row'
        ? {
            width: '10%',
          }
        : {}),
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
