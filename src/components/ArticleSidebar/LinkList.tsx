import { cn } from 'tailwind-variants'

import { CMSLink } from '@/components/Link'
import { LinkGroupData } from '@/types/payload'

export interface LinkListProps {
  links: LinkGroupData
}

export const LinkList = ({ links }: LinkListProps) => (
  <ul className="flex flex-col gap-1 border-l border-border">
    {links.map(({ id, link }) => (
      <li key={id}>
        <CMSLink
          {...link}
          className={cn([
            '-ml-px pl-3! border-l py-1 text-sm leading-snug no-underline! transition-colors',
            'border-transparent text-muted-foreground hover:text-foreground',
          ])}
        />
      </li>
    ))}
  </ul>
)
