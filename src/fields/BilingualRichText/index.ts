import type { NamedGroupField, RichTextFieldValidation, UIField } from 'payload'
import { deepMerge } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { cn } from 'tailwind-variants'

import { enqueueAutoTranslate } from '@/fields/BilingualRichText/hooks/enqueueAutoTranslate'
import type { RichTextEditorVariant, RichTextFieldOverrides } from '@/fields/RichText'
import { RichTextField } from '@/fields/RichText'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'

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
 * At least one side must be filled in, but never both individually — a
 * one-sided save is exactly what `enqueueAutoTranslate` (this field's
 * `afterChange` hook) exists to backfill, so rejecting it here would defeat
 * that feature. `otherFieldName` is the sibling in the same `en`/`de` row:
 * `siblingData` at this nesting level is the group's other language field.
 */
const requireEitherLanguage =
  (otherFieldName: 'en' | 'de'): RichTextFieldValidation =>
  (value, { siblingData }) => {
    const otherValue = (siblingData as Record<string, SerializedEditorState | undefined>)[
      otherFieldName
    ]

    if (!isEmptyValue(value as SerializedEditorState | undefined) || !isEmptyValue(otherValue)) {
      return true
    }

    return 'Enter English or German content — the other language can be filled in automatically.'
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
 *
 * `required` means *at least one* language must have content, not both —
 * see `requireEitherLanguage`. A one-sided save is exactly the case
 * `enqueueAutoTranslate` exists to backfill, so this deliberately does not
 * reject it.
 */
export const BilingualRichTextField = ({
  name,
  layout = 'column',
  editorVariant = 'inline',
  label = false,
  required = false,
  overrides = {},
}: BilingualRichTextFieldProps): NamedGroupField => {
  const baseOverrides = (
    language: 'English' | 'German',
    otherFieldName: 'en' | 'de',
  ): RichTextFieldOverrides => ({
    label: language,
    ...(required
      ? {
          validate: requireEitherLanguage(otherFieldName),
        }
      : {}),
  })

  const enField = RichTextField({
    name: 'en',
    editorVariant,
    overrides: deepMerge<RichTextFieldOverrides, RichTextFieldOverrides>(
      baseOverrides('English', 'de'),
      overrides.en ?? {},
    ),
  })

  const deField = RichTextField({
    name: 'de',
    editorVariant,
    overrides: deepMerge<RichTextFieldOverrides, RichTextFieldOverrides>(
      baseOverrides('German', 'en'),
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
