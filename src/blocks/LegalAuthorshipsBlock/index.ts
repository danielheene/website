import { Block } from 'payload'

import { BlockGroup, BlockSlug } from '@/types/blocks'

export const LegalAuthorshipsBlock: Block = {
  slug: BlockSlug.LegalAuthorships,
  interfaceName: BlockSlug.LegalAuthorships,
  labels: {
    singular: 'Legal Authorship',
    plural: 'Legal Authorships',
  },
  admin: {
    group: BlockGroup.Legal,
    disableBlockName: true,
  },
  /**
   * Content-free block: the credits list is derived at render time from the
   * media assets actually referenced on the site, so there is nothing to edit
   * here. See `LegalAuthorshipsBlock/Renderer`.
   */
  fields: [
    {
      type: 'ui',
      name: 'authorshipsInfo',
      admin: {
        components: {
          Field: '@/blocks/LegalAuthorshipsBlock/AdminInfo',
        },
      },
    },
  ],
}
