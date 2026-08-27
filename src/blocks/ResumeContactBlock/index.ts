import type { Block } from 'payload'

import { ResumeBlockField } from '@/fields/ResumeBlock'
import { BlockSlug } from '@/types/blocks'

export const ResumeContactBlock: Block = ResumeBlockField({
  name: BlockSlug.ResumeContact,
  variant: 'default',
})
