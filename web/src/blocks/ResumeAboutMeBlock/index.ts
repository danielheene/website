import type { Block } from 'payload'
import { BlockSlug } from '@/types/blocks'
import { ResumeBlockField } from '@/fields/ResumeBlock'
import { CollectionSlug } from '@/types/collections'


export const ResumeAboutMeBlock: Block = ResumeBlockField({
  name: BlockSlug['ResumeAboutMe'],
  variant: 'default',
  additionalFields: [
    {
      type: 'upload',
      name: 'portrait',
      relationTo: [CollectionSlug.MediaImages]
    }
  ]
})
