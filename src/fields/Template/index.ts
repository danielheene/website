import { TextField } from 'payload'

import { Locale } from '@/lib/i18n'

import {
  TemplateFieldAnnotation,
  TemplateFieldAnnotationFunction,
  TemplateFieldData,
  TemplateFieldDataFunction,
} from './types'

type TemplateFieldProps = {
  name: string
  label?: string | false
  description?: string
  defaultValue?: string
  renderLocale?: Locale[]

  data?: TemplateFieldData | TemplateFieldDataFunction
  anntotation?: TemplateFieldAnnotation | TemplateFieldAnnotationFunction
}

export const TemplateField = ({
  name,
  label = false,
  description,
  defaultValue,
  data,
  anntotation,
  renderLocale = [
    'en',
  ],
}: TemplateFieldProps): TextField => {
  return {
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
  }
}
