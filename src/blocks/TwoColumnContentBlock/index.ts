import { RichTextField } from '@/fields/RichText'
import { BlockGroup, BlockSlug } from '@custom-types'
import { Block } from 'payload'

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
    components: {
      Block: `@/blocks/${BlockSlug.TwoColumnContent}/BlockComponent`,
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        RichTextField({
          name: 'left',
          editorVariant: 'inline',
          overrides: {
            label: false,
            admin: { width: '50%' },
          },
        }),
        RichTextField({
          name: 'right',
          editorVariant: 'inline',
          overrides: {
            label: false,
            admin: { width: '50%' },
          },
        }),
      ],
    },
  ],
}

export { TwoColumnContentRenderer } from './TwoColumnContentRenderer'
