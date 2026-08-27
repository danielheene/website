import type { Block } from 'payload'

import { ResumeBlockField } from '@/fields/ResumeBlock'
import { BlockSlug } from '@/types/blocks'

export const ResumeExperienceBlock: Block = ResumeBlockField({
  name: BlockSlug.ResumeExperience,
  variant: 'primary',
})
