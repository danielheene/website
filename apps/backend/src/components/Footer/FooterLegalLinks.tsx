import { CMSLink } from '@website/app-components/Link/index'
import type { NavEntry } from '@website/lib/fields/Link/lib/resolveLinkTarget'
import { cn } from 'tailwind-variants'

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
        'font-mono text-sm font-medium tracking-tight text-muted-foreground',
        className,
      ])}
    >
      {entries?.map(({ id, ...link }) => (
        <div
          key={id}
          className='not-first:before:mr-2 not-first:before:font-bold not-first:before:content-["•"]'
        >
          <CMSLink {...link} className="text-current/75 no-underline hover:text-current" />
        </div>
      ))}
    </nav>
  )
}
