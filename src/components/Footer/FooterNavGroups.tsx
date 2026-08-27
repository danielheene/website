import { cn } from 'tailwind-variants'

import { CMSLink } from '@/components/Link'
import type { NavEntry } from '@/fields/Link/lib/resolveLinkTarget'

interface FooterNavGroupsProps {
  navGroups: {
    isActive?: boolean | null
    title?: string | null
    entries?: NavEntry[] | null
  }[]
  className?: string
}

export const FooterNavGroups = ({ navGroups, className }: FooterNavGroupsProps) => {
  return (
    <div className={cn('grid gap-6 grid-cols-2 lg:grid-cols-3 lg:gap-20', className)}>
      {navGroups.map(({ title, entries }, groupKey) => (
        <div
          key={groupKey}
          className="col-span-1 lg:nth-last-[1]:-col-end-1 lg:nth-last-[2]:-col-end-2 lg:nth-last-[3]:-col-end-3"
        >
          <h3 className="mb-2 font-mono font-medium text-lg xl:text-2xl text-primary">{title}</h3>
          <ul className="text-sm ml-1">
            {entries?.map(({ id, ...link }) => (
              <li
                key={id}
                className="font-pp-frama font-medium xl:text-lg text-current/75 hover:text-current"
              >
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
