import type { Block } from 'payload'

import { ResumeBlockField } from '@/fields/ResumeBlock'
import { BlockSlug } from '@/types/blocks'

export const ResumeProjectsBlock: Block = ResumeBlockField({
  name: BlockSlug.ResumeProjects,
  variant: 'default',
})
