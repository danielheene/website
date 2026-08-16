import type { NamedGroupField, UIField } from 'payload'
import { deepMerge } from 'payload'

import { enqueueAutoTranslate } from '@/fields/BilingualRichText/hooks/enqueueAutoTranslate'
import type { RichTextEditorVariant, RichTextFieldOverrides } from '@/fields/RichText'
import { RichTextField } from '@/fields/RichText'
import { cn } from '@/lib/cn'

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

/**
 * A reusable Payload group field with side-by-side English and German
 * rich-text editors and two AI-translate buttons between them.
 *
 * The translation round-trips through HTML via Claude. Formatting available
 * in the `inline` and `caption` variants (bold, italic, underline,
 * strikethrough) survives. Two documented limitations to be aware of:
 *
 * - **Blocks/tables** from the `markdown` and `post` variants may not
 *   round-trip cleanly — the HTML converter emits them, but the headless
 *   parser doesn't register nodes for them, so they degrade to plain-text
 *   paragraphs via the fallback path.
 * - **Links** are NOT preserved by translation in any variant. This
 *   codebase's `LinkFeature` extends Lexical's default link node with a
 *   custom `fields` payload (type/doc/newTab/appearance — see
 *   `src/fields/Link/index.ts`) that the headless parser cannot recreate
 *   from an HTML `<a>` alone. If your content contains links, translate
 *   manually rather than through this button.
 */
export const BilingualRichTextField = ({
  name,
  layout = 'column',
  editorVariant = 'inline',
  label = false,
  required = false,
  overrides = {},
}: BilingualRichTextFieldProps): NamedGroupField => {
  const baseOverrides = (language: 'English' | 'German'): RichTextFieldOverrides => ({
    label: language,
    required,
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
      components: {
        Field: {
          path: '@/fields/BilingualRichText/components/TranslateControls',
          clientProps: {
            layout,
          },
        },
      },
    },
  }

  return {
    type: 'group',
    name,
    label,
    admin: {
      hideGutter: true,
    },
    hooks: {
      afterChange: [
        enqueueAutoTranslate,
      ],
    },
    fields: [
      {
        type: 'row',
        admin: {
          className: cn([
            '[&.field-type.row>.render-fields]:flex [&.field-type.row>.render-fields]:flex-col',
            '[&.field-type.row>.render-fields]:justify-between [&.field-type.row>.render-fields]:gap-y- 0',
            layout === 'row' && [
              '[&.field-type.row>.render-fields]:md:grid',
              '[&.field-type.row>.render-fields]:md:grid-cols-[1fr_max-content_1fr]',
            ],
          ]),
        },
        fields: [
          enField,
          translateControls,
          deField,
        ],
      },
    ],
  }
}
