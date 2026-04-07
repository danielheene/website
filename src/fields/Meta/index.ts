import type { GroupField } from 'payload'

export const MetaField = (): GroupField => ({
  name: 'meta',
  type: 'group',
  label: false,
  fields: [
    {
      name: 'serp',
      type: 'ui',
      admin: {
        components: {
          Field: '@/fields/Meta/SerpField',
        },
      },
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      defaultValue: '',
      virtual: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      defaultValue: '',
      admin: {
        components: {
          Field: '@/fields/Meta/DescriptionField',
        },
      },
    },
  ],
})
