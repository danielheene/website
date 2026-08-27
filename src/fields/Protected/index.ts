import { CheckboxField, deepMerge } from 'payload'

import { preserveProtected } from './hooks/preserveProtected'

type ProtectedFieldOverrides = Partial<
  Omit<
    CheckboxField,
    | 'name'
    | 'label'
    | 'type'
    | 'access'
    | 'required'
    | 'index'
    | 'defaultValue'
    | 'hooks.beforeChange'
    | 'admin.position'
    | 'admin.readOnly'
    | 'admin.components'
  >
>

type ProtectedFieldArgs = {
  name?: string
  overrides?: ProtectedFieldOverrides
}

export const ProtectedField = ({
  name = 'protected',
  overrides = {},
}: ProtectedFieldArgs = {}): CheckboxField => {
  return deepMerge<CheckboxField, ProtectedFieldArgs['overrides']>(
    {
      name,
      label: 'Protected',
      type: 'checkbox',
      access: {
        create: () => false,
        read: () => true,
        update: () => false,
      },
      required: true,
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        components: {
          Label: false,
          Field: '@/fields/Protected/components/FieldComponent',
        },
        disableBulkEdit: true,
      },
      hooks: {
        beforeChange: [
          preserveProtected,
        ],
      },
    },
    overrides,
  )
}
