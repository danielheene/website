import type { JSX } from 'react'

import { CMSLink } from '@/components/Link'
import { cn } from '@/lib/cn'
import type { LinkGroupBlock } from '@/types/payload'

type LinkGroupBlockRendererProps = {
  className?: string
} & LinkGroupBlock

export const LinkGroupBlockRenderer = ({
  className,
  links: { alignment, entries },
}: LinkGroupBlockRendererProps): JSX.Element => {
  return (
    <ul
      className={cn([
        'flex gap-4',
        alignment === 'left' && 'justify-start',
        alignment === 'center' && 'justify-center',
        alignment === 'right' && 'justify-end',
        alignment === 'list' && 'flex-col items-start',
        className,
      ])}
    >
      {entries.map(({ id, link }) => (
        <li key={id}>
          <CMSLink {...link} />
        </li>
      ))}
    </ul>
  )
}
