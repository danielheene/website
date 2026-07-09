import type { Block } from 'payload'
import { BlockSlug } from '@/types/blocks'
import { ResumeBlockField } from '@/fields/ResumeBlock'


export const ResumeExperienceBlock: Block = ResumeBlockField({
  name: BlockSlug['ResumeExperience'],
  variant: 'primary'
})
