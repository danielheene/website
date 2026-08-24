import { deepMerge, TextField } from 'payload'

import dedent from 'dedent'

import { BilingualLanguage } from '@/lib/i18n'

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
  renderLocale?: BilingualLanguage[]
  data?: TemplateFieldData | TemplateFieldDataFunction
  anntotation?: TemplateFieldAnnotation | TemplateFieldAnnotationFunction
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
        description: dedent.withOptions({
          alignValues: true,
          escapeSpecialCharacters: true,
        })(description),
        components: {
          Description: '@/fields/SectionGroup/components/DescriptionComponent',
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
