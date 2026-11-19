import { Block } from 'payload'

import { BlockGroup, BlockSlug } from '@/types/blocks'

export const LegalAttributionsBlock: Block = {
  slug: BlockSlug.LegalAttributions,
  interfaceName: BlockSlug.LegalAttributions,
  labels: {
    singular: 'Attributions',
    plural: 'Attributions',
  },
  admin: {
    group: BlockGroup.Legal,
    disableBlockName: true,
  },
  /**
   * Content-free block: the credits list is derived at render time from the
   * media assets actually referenced on the site, so there is nothing to edit
   * here. See `LegalAttributionsBlock/Renderer`.
   */
  fields: [
    {
      type: 'ui',
      name: 'adminInfo',
      admin: {
        components: {
          Field: '@/blocks/LegalAttributionsBlock/AdminInfo',
        },
      },
    },
  ],
}
