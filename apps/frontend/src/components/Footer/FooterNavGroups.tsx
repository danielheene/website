import { CMSLink } from '@website/app-components/Link/index'
import type { NavEntry } from '@website/lib/fields/Link/lib/resolveLinkTarget'
import { cn } from 'tailwind-variants'

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
    <div className={cn('grid grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-20', className)}>
      {navGroups.map(({ title, entries }, groupKey) => (
        <div
          key={groupKey}
          className="col-span-1 lg:nth-last-[1]:-col-end-1 lg:nth-last-[2]:-col-end-2 lg:nth-last-[3]:-col-end-3"
        >
          <h3 className="mb-(--footer-header-gap) h-(--footer-header-height) font-mono text-lg font-medium text-primary xl:text-2xl">
            {title}
          </h3>
          <ul className="ml-1 text-sm">
            {entries?.map(({ id, ...link }) => (
              <li key={id} className="text-current/75 hover:text-current">
                <CMSLink
                  {...link}
                  className="font-pp-frama text-sm leading-none font-medium tracking-wider no-underline xl:text-lg"
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
