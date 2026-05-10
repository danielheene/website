import type { ArrayField } from 'payload'

import { RichTextField } from '@/fields/RichText'
import { CollectionSlug } from '@/types/collections'

export const ProjectListField = (): ArrayField => ({
  name: 'projectList',
  type: 'array',
  interfaceName: 'ProjectList',
  admin: {
    isSortable: true,
    initCollapsed: false,
    components: {
      Label: false,
      RowLabel: '@/fields/ProjectList/RowLabel',
    },
  },
  fields: [
    {
      name: 'preHeading',
      type: 'text',
      required: true,
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: CollectionSlug.MediaImages,
      filterOptions: {
        mimeType: {
          contains: 'image',
        },
      },
    },
    RichTextField({
      name: 'content',
      editorVariant: 'caption',
    }),
  ],
})
