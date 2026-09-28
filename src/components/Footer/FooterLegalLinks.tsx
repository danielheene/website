import { cn } from 'tailwind-variants'

import { CMSLink } from '@/components/Link'
import type { NavEntry } from '@/fields/Link/lib/resolveLinkTarget'
import { fetchSiteSettingsCached } from '@/lib/fetchers'

interface FooterLegalLinksProps {
  entries?: NavEntry[] | null
  className?: string
}

export const FooterLegalLinks = async ({
  entries: entriesProp,
  className,
}: FooterLegalLinksProps) => {
  const settings = entriesProp !== undefined ? null : await fetchSiteSettingsCached()
  const entries = entriesProp ?? settings?.footer?.legalPages?.entries ?? []

  return (
    <nav
      className={cn([
        'order-1 flex flex-col gap-2 md:order-2 md:flex-row',
        'text-sm text-muted-foreground font-mono font-medium tracking-tight',
        className,
      ])}
    >
      {entries?.map(({ id, ...link }) => (
        <div
          key={id}
          className='not-first:before:content-["•"] not-first:before:mr-2 not-first:before:font-bold'
        >
          <CMSLink {...link} className="text-current/75 hover:text-current no-underline" />
        </div>
      ))}
    </nav>
  )
}
