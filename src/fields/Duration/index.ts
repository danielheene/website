import { deepMerge, NumberField, NumberFieldClientProps } from 'payload'

interface DurationFieldProps {
  name: string
  label?: string
  description?: string
  width?: string
  defaultValue?: number
  overrides?: Partial<Omit<NumberFieldClientProps, 'type' | 'name' | 'label' | 'description'>>
}

export const DurationField = ({
  name,
  label,
  description,
  width,
  defaultValue = 0,
  overrides,
}: DurationFieldProps): NumberField => {
  return deepMerge<NumberField, Partial<NumberField>>(
    {
      type: 'number',
      name,
      label,
      defaultValue,
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
