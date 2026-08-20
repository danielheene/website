import { CMSLink } from '@/components/Link'
import type { LinkGroupEntry } from '@/fields/Link/lib/resolveLinkTarget'
import { cn } from '@/lib/cn'

interface FooterLegalLinksProps {
  legalPages?: {
    entries?: LinkGroupEntry[] | null
  }
  className?: string
}

export const FooterLegalLinks = ({ legalPages: { entries }, className }: FooterLegalLinksProps) => {
  return (
    <nav className={cn('order-1 flex flex-col gap-2 md:order-2 md:flex-row', className)}>
      {entries.map(({ link, id }) => (
        <div className={cn('not-first:before:content-["•"] before:mr-2 before:font-bold')} key={id}>
          <CMSLink
            {...link}
            variant="link"
            size="lg"
            className="font-mono text-current/75 hover:text-current no-underline"
          />
        </div>
      ))}
    </nav>
  )
}
