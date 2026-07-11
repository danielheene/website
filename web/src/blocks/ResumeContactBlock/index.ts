import type { Block } from 'payload'
import { BlockSlug } from '@/types/blocks'
import { ResumeBlockField } from '@/fields/ResumeBlock'


export const ResumeContactBlock: Block = ResumeBlockField({
  name: BlockSlug['ResumeContact'],
  variant: 'default'
})
