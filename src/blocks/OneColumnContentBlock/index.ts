import { RichTextField } from '@/fields/RichText'
import { BlockGroup, BlockSlug } from '@custom-types'
import { Block } from 'payload'

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
      name: 'data',
      editorVariant: 'inline',
      overrides: {
        label: false,
      },
    }),
  ],
}
