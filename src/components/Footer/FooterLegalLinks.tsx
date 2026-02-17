import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'
import { FooterNavigationData } from '@payload-types'

interface FooterLegalLinksProps extends Pick<FooterNavigationData, 'legalLinks'> {
  className?: string
}

export const FooterLegalLinks = ({ legalLinks, className }: FooterLegalLinksProps) => {
  const { title, entries } = legalLinks
  return (
    <ul className={cn('order-1 flex flex-col gap-2 md:order-2 md:flex-row', className)} aria-label={title} role="navigation">
      {entries.map(({ link, id }) => (
        <li key={id}>
          <CMSLink {...link} className="text-current/75 hover:text-current" />
        </li>
      ))}
    </ul>
  )
}
