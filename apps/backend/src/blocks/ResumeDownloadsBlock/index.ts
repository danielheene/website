import type { Block } from 'payload'

import { BlockSlug } from '@website/types/blocks'

import { ResumeBlockField } from '@/fields/ResumeBlock'

export const ResumeDownloadsBlock: Block = ResumeBlockField({
  name: BlockSlug.ResumeDownloads,
  variant: 'primary',
})
