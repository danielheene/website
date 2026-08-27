import type { Block } from 'payload'

import { ResumeBlockField } from '@/fields/ResumeBlock'
import { BlockSlug } from '@/types/blocks'

export const ResumeDownloadsBlock: Block = ResumeBlockField({
  name: BlockSlug.ResumeDownloads,
  variant: 'primary',
})
