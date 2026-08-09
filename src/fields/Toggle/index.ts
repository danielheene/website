import { CheckboxField, deepMerge } from 'payload'

import { OmitDeep } from 'type-fest'

type ToggleFieldOverrides = Partial<
  OmitDeep<CheckboxField, 'type' | 'name' | 'label' | 'admin.components.Field'>
>

type ToggleFieldProps = {
  name: string
  tooltip?: string
  iconActive: string
  iconInactive: string
  overrides?: ToggleFieldOverrides
}

export const ToggleField = ({
  name,
  tooltip,
  iconActive,
  iconInactive,
  overrides = {},
}: ToggleFieldProps): CheckboxField => {
  return deepMerge<CheckboxField, Partial<CheckboxField>>(
    {
      type: 'checkbox',
      name,
      label: '',
      admin: {
        components: {
          Field: {
            path: '@/fields/Toggle/components/FieldComponent',
            clientProps: {
              tooltip,
              iconActive,
              iconInactive,
            },
          },
        },
      },
    },
    overrides,
  )
}
