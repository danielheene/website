import type { TextField } from 'payload'

export const MetaDescriptionField = (): TextField => ({
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
      Field: '@/fields/Meta/MetaDescriptionField/FieldComponent',
    },
  },
})
