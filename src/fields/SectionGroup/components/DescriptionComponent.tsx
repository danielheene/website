import { Fragment } from 'react'
import { FieldDescriptionServerComponent } from 'payload'

import { get } from 'lodash-es'
import { cn } from 'tailwind-variants'

/**
 * Splits a string by newlines and joins the lines with `<br />` tags, so
 * that multi-line descriptions written with `dedent` render as line breaks
 * instead of being collapsed into a single line.
 */
const withLineBreaks = (value: string) =>
  value.split('\n').map((line, index, lines) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ))

export const DescriptionComponent: FieldDescriptionServerComponent = async ({
  field,
  className,
}) => {
  const description = get(field, 'admin.description')

  return typeof description === 'string' ? (
    <div className={cn('field-description block', className)}>{withLineBreaks(description)}</div>
  ) : null
}

export default DescriptionComponent
