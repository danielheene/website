import type { GroupFieldDescriptionServerComponent } from 'payload'
import { Fragment } from 'react'
import ReactMarkdown from 'react-markdown'

import { cn } from '@repo/utils/cn'

export const MarkdownDescription: GroupFieldDescriptionServerComponent = async ({
  field: { admin: { description } = {} } = {
    admin: {},
  },
}) => {
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
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    </div>
  ) : null
}
