import { deepMerge, NumberField, NumberFieldClientProps } from 'payload'

interface DurationFieldProps {
  name: string
  label?: string
  description?: string
  width?: string
  overrides?: Partial<Omit<NumberFieldClientProps, 'type' | 'name' | 'label' | 'description'>>
}

export const DurationField = ({
  name,
  label,
  description,
  width,
  overrides,
}: DurationFieldProps): NumberField => {
  return deepMerge<NumberField, Partial<NumberField>>(
    {
      type: 'number',
      name,
      label,
      defaultValue: 0,
      admin: {
        description,
        step: 1000,
        width,
        components: {
          Field: {
            path: '@/fields/Duration/components/FieldComponent',
          },
        },
      },
    },
    overrides || {},
  )
}
