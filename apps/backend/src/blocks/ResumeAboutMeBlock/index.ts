import type { Block } from 'payload'

import { BlockSlug } from '@website/types/blocks'
import { CollectionSlug } from '@website/types/collections'

import { ResumeBlockField } from '@/fields/ResumeBlock'

export const ResumeAboutMeBlock: Block = ResumeBlockField({
  name: BlockSlug.ResumeAboutMe,
  variant: 'default',
  additionalFields: [
    {
      type: 'upload',
      name: 'portrait',
      relationTo: [CollectionSlug.MediaImages],
    },
  ],
})
