import { Block } from 'payload'

import { BlockGroup, BlockSlug } from '@website/types/blocks'

export const LegalPublisherBlock: Block = {
  slug: BlockSlug.LegalPublisher,
  interfaceName: BlockSlug.LegalPublisher,
  labels: {
    singular: 'Legal Publisher',
    plural: 'Legal Publishers',
  },
  admin: {
    group: BlockGroup.Legal,
    disableBlockName: true,
  },
  fields: [
    {
      type: 'ui',
      name: 'Publisher',
      admin: {
        components: {
          Field: '@/blocks/LegalPublisherBlock/Renderer',
        },
      },
    },
  ],
}
