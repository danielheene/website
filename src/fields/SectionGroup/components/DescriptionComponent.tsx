import { Fragment } from 'react'
import { FieldDescriptionServerComponent } from 'payload'

import { get } from 'lodash-es'

import { cn } from '@/lib/cn'

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

export const DescriptionComponent: FieldDescriptionServerComponent = async ({ field }) => {
  const description = get(field, 'admin.description')

  return typeof description === 'string' ? (
    <div className={cn('field-description field-description--margin-bottom block')}>
      <div
        className={cn([
          'prose prose-neutral w-full block max-w-none leading-snug',
          'prose-headings:text-(--theme-elevation-400) prose-p:leading-[1.4]',
          'prose-p:text-sans prose-p:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-strong:text-sans prose-strong:text-(--theme-elevation-400) prose-strong:font-medium prose-p:leading-[1.3]',
          'prose-ol:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-ul:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-li:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-table:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-thead:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-th:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-tr:text-(--theme-elevation-400) prose-p:leading-[1.3]',
          'prose-td:text-(--theme-elevation-400) prose-p:leading-[1.3]',
        ])}
      >
        {withLineBreaks(description)}
      </div>
    </div>
  ) : null
}

export default DescriptionComponent
