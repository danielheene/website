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
