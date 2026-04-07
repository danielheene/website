import { BlockGroup, BlockSlug } from '@custom-types'
import type { Block } from 'payload'

import { RichTextField } from '@/fields/RichText'

export const TwoColumnContentBlock: Block = {
  slug: BlockSlug.TwoColumnContent,
  labels: {
    singular: 'Two-Column Content',
    plural: 'Two-Column Content',
  },
  imageURL: '/payload/blocks/general-two-column.svg',
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
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
          editorVariant: 'inline',
          overrides: {
            label: false,
            admin: {
              width: '50%',
            },
          },
        }),
        RichTextField({
          name: 'contentRight',
          editorVariant: 'inline',
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
