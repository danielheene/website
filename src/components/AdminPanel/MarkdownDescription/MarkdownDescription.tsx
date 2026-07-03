import type { GroupFieldDescriptionServerComponent } from 'payload'
import { Fragment } from 'react'
import ReactMarkdown from 'react-markdown'

import { cn } from '@/lib/cn'

export const DescriptionWithNewline: GroupFieldDescriptionServerComponent = async ({
  field: { admin: { description } = {} } = {
    admin: {},
  },
}) => {
  return typeof description === 'string' ? (
    <div className={cn('field-description field-description--margin-bottom')}>
      <ReactMarkdown>{description}</ReactMarkdown>
    </div>
  ) : null
}
