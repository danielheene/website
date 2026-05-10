import type { Block } from 'payload'

import { RichTextField } from '@/fields/RichText'
import { BlockGroup, BlockSlug } from '@/types/blocks'

export const TwoColumnContentBlock: Block = {
  slug: BlockSlug.TwoColumnContent,
  labels: {
    singular: 'Two-Column Content',
    plural: 'Two-Column Content',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/general-two-column-thumbnail.svg',
      icon: '/payload/blocks/general-two-column-icon.svg',
    },
  },
  fields: [
    {
      type: 'row',
      admin: {
        className: '*:mb-0',
      },
      fields: [
        RichTextField({
          name: 'contentLeft',
          editorVariant: 'markdown',
          overrides: {
            label: false,
            admin: {
              width: '50%',
            },
          },
        }),
        RichTextField({
          name: 'contentRight',
          editorVariant: 'markdown',
          overrides: {
            label: false,
            admin: {
              width: '50%',
            },
          },
        }),
      ],
    },
  ],
}
