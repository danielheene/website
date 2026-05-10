import type { GroupFieldDescriptionServerComponent } from 'payload'
import { Fragment } from 'react'

import { cn } from '@/lib/cn'

export const DescriptionWithNewline: GroupFieldDescriptionServerComponent = async ({
  field: { admin: { description } = {} } = { admin: {} },
}) => {
  return typeof description === 'string' ? (
    <div className={cn('field-description field-description--margin-bottom')}>
      {description.split('\n').map((line, index) => (
        <Fragment key={index}>
          {line}
          <br />
        </Fragment>
      ))}
    </div>
  ) : null
}
