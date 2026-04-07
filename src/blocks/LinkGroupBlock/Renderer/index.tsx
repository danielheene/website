import type { LinkGroupBlock } from '@payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'

type LinkGroupBlockRendererProps = { className?: string } & LinkGroupBlock

export const LinkGroupBlockRenderer = ({ className, links: { alignment, entries } }: LinkGroupBlockRendererProps) => {
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
