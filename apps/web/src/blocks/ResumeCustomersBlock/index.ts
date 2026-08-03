import type { Block } from 'payload'

import { ResumeBlockField } from '@/fields/ResumeBlock'
import { BlockSlug } from '@/types/blocks'

export const ResumeCustomersBlock: Block = ResumeBlockField({
  name: BlockSlug.ResumeCustomers,
  variant: 'primary',
})
