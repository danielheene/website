import type { Block } from 'payload'
import { BlockSlug } from '@/types/blocks'
import { ResumeBlockField } from '@/fields/ResumeBlock'


export const ResumeCustomersBlock: Block = ResumeBlockField({
  name: BlockSlug['ResumeCustomers'],
  variant: 'primary'
})
