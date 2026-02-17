import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'
import { FooterNavigationData } from '@payload-types'

interface FooterNavGroupsProps extends Pick<FooterNavigationData, 'navGroups'> {
  className?: string
}

export const FooterNavGroups = ({ navGroups, className }: FooterNavGroupsProps) => {
  return (
    <div className={cn('grid gap-6 grid-cols-2 lg:grid-cols-3 lg:gap-20', className)}>
      {navGroups.map(({ title, entries }, groupKey) => (
        <div key={groupKey} className="col-span-1 lg:nth-last-[1]:-col-end-1 lg:nth-last-[2]:-col-end-2 lg:nth-last-[3]:-col-end-3">
          <h3 className="mb-2 font-mono font-medium text-lg text-primary">{title}</h3>
          <ul className="text-sm ml-1">
            {entries.map(({ link, id }) => (
              <li key={id} className="font-pp-frama font-medium text-current/75 hover:text-current">
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
