import { BlockGroup, BlockSlug } from '@custom-types'
import type { Block } from 'payload'

import { RichTextField } from '@/fields/RichText'

export const OneColumnContentBlock: Block = {
  slug: BlockSlug.OneColumnContent,
  labels: {
    singular: 'One-Column Content',
    plural: 'One-Column Content',
  },
  imageURL: '/payload/blocks/general-one-column.svg',
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
  },
  fields: [
    RichTextField({
      name: 'content',
      editorVariant: 'inline',
      overrides: {
        label: false,
      },
    }),
  ],
}
