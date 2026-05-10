import type { Block } from 'payload'

import { RichTextField } from '@/fields/RichText'
import { BlockGroup, BlockSlug } from '@/types/blocks'

export const OneColumnContentBlock: Block = {
  slug: BlockSlug.OneColumnContent,
  labels: {
    singular: 'One-Column Content',
    plural: 'One-Column Content',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/general-one-column-thumbnail.svg',
      icon: '/payload/blocks/general-one-column-icon.svg',
    },
  },
  fields: [
    RichTextField({
      name: 'content',
      editorVariant: 'markdown',
      overrides: {
        label: false,
      },
    }),
  ],
}
