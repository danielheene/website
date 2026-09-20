import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import { CMSLink } from '@/components/Link'
import { BlockData, BlockSlug } from '@/types/blocks'

type LinkGroupBlockRendererProps = {
  className?: string
} & BlockData<BlockSlug['LinkGroup']>

export const LinkGroupBlockRenderer = ({
  className,
  links,
}: LinkGroupBlockRendererProps): JSX.Element => {
  return (
    <ul
      className={cn([
        'flex gap-4',
        className,
      ])}
    >
      {links.map(({ id, link }) => (
        <li key={id}>
          <CMSLink {...link} />
        </li>
      ))}
    </ul>
  )
}
