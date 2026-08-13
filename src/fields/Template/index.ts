import { deepMerge, TextField } from 'payload'

import { Locale } from '@/lib/i18n'

import {
  TemplateFieldAnnotation,
  TemplateFieldAnnotationFunction,
  TemplateFieldData,
  TemplateFieldDataFunction,
} from './types'

type TemplateFieldOverrides = Partial<Omit<TextField, 'name' | 'type'>>

type TemplateFieldProps = {
  name: string
  label?: string | false
  description?: string
  defaultValue?: string
  renderLocale?: Locale[]

  data?: TemplateFieldData | TemplateFieldDataFunction
  anntotation?: TemplateFieldAnnotation | TemplateFieldAnnotationFunction
  /**
   * Escape hatch for call sites that need a different client component —
   * the link label, for instance, sources `{title}` from live form state
   * rather than from server props.
   */
  overrides?: TemplateFieldOverrides
}

export const TemplateField = ({
  name,
  label = false,
  description,
  defaultValue,
  data,
  anntotation,
  overrides = {},
  renderLocale = [
    'en',
  ],
}: TemplateFieldProps): TextField =>
  deepMerge<TextField, TemplateFieldOverrides>(
    {
      type: 'text',
      name,
      label,
      defaultValue,
      admin: {
        description,
        components: {
          Description: '@/components/AdminPanel#MarkdownDescription',
          Field: {
            path: '@/fields/Template/Components/FieldComponent',
            serverProps: {
              customAnnotation: anntotation,
              customData: data,
              renderLocale,
            },
          },
        },
      },
    },
    overrides,
  )
