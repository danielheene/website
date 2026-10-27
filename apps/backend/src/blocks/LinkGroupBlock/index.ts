import type { Block } from 'payload'

import { BlockGroup, BlockSlug } from '@website/types/blocks'

import { LinkGroupField } from '@/fields/LinkGroup'

export const LinkGroupBlock: Block = {
  slug: BlockSlug.LinkGroup,
  interfaceName: BlockSlug.LinkGroup,
  labels: {
    singular: 'Link Group',
    plural: 'Link Group',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/general-link-group-thumbnail.svg',
      icon: '/payload/blocks/general-link-group-icon.svg',
    },
  },
  fields: [LinkGroupField()],
}
