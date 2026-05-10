import type { TextField } from 'payload'

interface MetaDescriptionFieldProps {
  slugPath: string
}

export const MetaDescriptionField = ({
  slugPath,
}: MetaDescriptionFieldProps): TextField => ({
  name: 'description',
  label: 'Description',
  type: 'text',
  defaultValue: '',
  admin: {
    disableListColumn: true,
    disableBulkEdit: true,
    disableListFilter: true,
    disableGroupBy: true,
    components: {
      Field: {
        path: '@/fields/Meta/MetaDescriptionField/FieldComponent',
        serverProps: {
          slugPath,
        },
      },
    },
  },
})
