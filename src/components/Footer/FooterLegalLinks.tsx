import { cn } from 'tailwind-variants'

import { CMSLink } from '@/components/Link'
import type { NavEntry } from '@/fields/Link/lib/resolveLinkTarget'
import { fetchSiteSettingsCached } from '@/lib/fetchers'

const ITEM_CLASS = 'not-first:before:mr-2 not-first:before:font-bold not-first:before:content-["•"]'

const LINK_CLASS =
  'inline-flex min-h-8 items-center text-current/75 no-underline hover:text-current md:min-h-6'

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
        <div key={id} className={ITEM_CLASS}>
          <CMSLink {...link} className={LINK_CLASS} />
        </div>
      ))}
      {/* the site's summary for language models, served by `app/llms.txt/route.ts` */}
      <div className={ITEM_CLASS}>
        <CMSLink linkType="custom" url="/llms.txt" text="llms.txt" className={LINK_CLASS} />
      </div>
    </nav>
  )
}
