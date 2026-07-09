import type { Block } from 'payload'
import { BlockSlug } from '@/types/blocks'
import { ResumeBlockField } from '@/fields/ResumeBlock'

export const ResumeProjectsBlock: Block = ResumeBlockField({
  name: BlockSlug['ResumeProjects'],
  variant: 'default'
})
