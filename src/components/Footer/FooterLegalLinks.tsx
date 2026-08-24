import { CMSLink } from '@/components/Link'
import type { NavEntry } from '@/fields/Link/lib/resolveLinkTarget'
import { cn } from '@/lib/cn'

interface FooterLegalLinksProps {
  legalPages?: {
    entries?: NavEntry[] | null
  }
  className?: string
}

export const FooterLegalLinks = ({ legalPages: { entries }, className }: FooterLegalLinksProps) => {
  return (
    <nav className={cn('order-1 flex flex-col gap-2 md:order-2 md:flex-row', className)}>
      {entries?.map(({ id, ...link }) => (
        <div className={cn('not-first:before:content-["•"] before:mr-2 before:font-bold')} key={id}>
          <CMSLink
            {...link}
            className="font-mono text-current/75 hover:text-current no-underline"
          />
        </div>
      ))}
    </nav>
  )
}
