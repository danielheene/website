import type { UIField } from 'payload'

interface MetaSerpFieldProps {
  slugPath: string
}

export const MetaSerpField = ({ slugPath }: MetaSerpFieldProps): UIField => ({
  name: 'serp',
  type: 'ui',
  admin: {
    disableListColumn: true,
    disableBulkEdit: true,
    components: {
      Field: {
        path: '@/fields/Meta/MetaSerpField/FieldComponent',
        serverProps: {
          slugPath,
        },
      },
    },
  },
})
