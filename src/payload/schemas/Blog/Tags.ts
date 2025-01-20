import { anyone } from '../../access/anyone'
import { slugField } from '../../fields/slug'
import { revalidateTag } from './hooks/revalidateTag'
import { createCollection } from '@/payload/utilities/schemaHelpers'

export const Tags = createCollection({
  slug: 'blogTags',
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  admin: {
    group: 'blog',
  },
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateTag],
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
