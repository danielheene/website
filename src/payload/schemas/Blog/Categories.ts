import { anyone } from '../../access/anyone'
import { slugField } from '../../fields/slug'
import { revalidateCategory } from './hooks/revalidateCategory'
import { createCollection } from '@/payload/utilities/schemaHelpers'

export const Categories = createCollection({
  slug: 'blogCategories',
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  admin: {
    group: 'blog',
  },
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateCategory],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
  ],
})
