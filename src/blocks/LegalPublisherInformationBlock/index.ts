import { Block } from 'payload'

import { BlockGroup, BlockSlug } from '@/types/blocks'

export const LegalPublisherInformationBlock: Block = {
  slug: BlockSlug.LegalPublisherInformation,
  interfaceName: BlockSlug.LegalPublisherInformation,
  labels: {
    singular: 'Publisher Information',
    plural: 'Publisher Information',
  },
  admin: {
    group: BlockGroup.Legal,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/legal-publisher-information-thumbnail.svg',
      icon: '/payload/blocks/legal-publisher-information-icon.svg',
    },
  },
  fields: [
    {
      type: 'ui',
      name: 'adminInfo',
      admin: {
        components: {
          Field: '@/blocks/LegalPublisherInformationBlock/AdminInfo',
        },
      },
    },
  ],
}
