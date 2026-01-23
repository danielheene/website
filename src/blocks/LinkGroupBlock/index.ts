import { LinkGroupField } from '@/fields/LinkGroup'
import { BlockGroup, BlockSlug } from '@custom-types'
import { Block } from 'payload'

export const LinkGroupBlock: Block = {
  slug: BlockSlug.LinkGroup,
  labels: {
    singular: 'Link Group',
    plural: 'Link Group',
  },
  imageURL: '/payload/blocks/general-link-group.svg',
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
  },
  fields: [LinkGroupField()],
}
