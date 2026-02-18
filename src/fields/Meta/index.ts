import type { GroupField } from 'payload'

export const MetaField = (): GroupField => ({
  name: 'meta',
  label: 'Meta',
  type: 'group',
  admin: {
    readOnly: true,
    components: {
      Field: '@/fields/Meta/FieldComponent',
    },
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
    },
    {
      name: 'keywords',
      label: 'Keywords',
      type: 'text',
    },
  ],
})
