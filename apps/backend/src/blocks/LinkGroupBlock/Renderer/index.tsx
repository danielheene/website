import type { JSX } from 'react'

import { CMSLink } from '@website/app-components/Link/index'
import { BlockData, BlockSlug } from '@website/types/blocks'
import { cn } from 'tailwind-variants'

type LinkGroupBlockRendererProps = {
  className?: string
} & BlockData<BlockSlug['LinkGroup']>

export const LinkGroupBlockRenderer = ({
  className,
  links,
}: LinkGroupBlockRendererProps): JSX.Element => {
  return (
    <ul className={cn(['flex gap-4', className])}>
      {(links ?? []).map(({ id, link }) => (
        <li key={id}>
          <CMSLink {...link} />
        </li>
      ))}
    </ul>
  )
}
