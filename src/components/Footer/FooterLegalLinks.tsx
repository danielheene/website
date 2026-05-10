import type { PageFooterData } from '@/types/payload'

import { CMSLink } from '@/components/Link'
import { cn } from '@/lib/cn'

interface FooterLegalLinksProps extends Pick<PageFooterData, 'legalLinks'> {
  className?: string
}

export const FooterLegalLinks = ({ legalLinks, className }: FooterLegalLinksProps) => {
  const { title, entries } = legalLinks
  return (
    <nav className={cn('order-1 flex flex-col gap-2 md:order-2 md:flex-row', className)} aria-label={title}>
      {entries.map(({ link, id }) => (
        <div className={cn('not-first:before:content-["•"] before:mr-2 before:font-bold')} key={id}>
          <CMSLink {...link} className="text-current/75 hover:text-current" />
        </div>
      ))}
    </nav>
  )
}
