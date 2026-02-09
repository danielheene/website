import { CMSLink } from '@/components/Link'
import { FooterNavigationData } from '@payload-types'

type FooterNavGroupProps = FooterNavigationData['navGroups'][0] & { className?: string }

export const FooterNavGroup = ({ title, entries, className }: FooterNavGroupProps) => {
  return (
    <div className={className}>
      <h3 className="mb-4 font-bold">{title}</h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {entries.map(({ link }, i) => (
          <li key={i} className="font-medium hover:text-primary">
            <CMSLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  )
}
