import { BlockGroup, BlockSlug } from '@custom-types'
import type { Block } from 'payload'

import { LinkGroupField } from '@/fields/LinkGroup'

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
