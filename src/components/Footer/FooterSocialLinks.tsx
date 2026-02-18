import type { FooterNavigationData } from '@payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'

interface FooterSocialLinksProps extends Pick<FooterNavigationData, 'socialLinks'> {
  className?: string
}

export const FooterSocialLinks = ({ socialLinks, className }: FooterSocialLinksProps) => {
  const { entries, title } = socialLinks
  return (
    <div className={cn('flex flex-col justify-between gap-3 lg:items-start', className)}>
      <p className="max-w-9/12 text-sm text-muted-foreground">You can also reach out to me via:</p>
      {/** biome-ignore lint/a11y/useSemanticElements: <TODO> */}
      <ul className="flex items-center gap-x-4" aria-label={title} role="navigation">
        {entries.map(({ link, id }) => (
          <li key={id} className="text-current/75 hover:text-current">
            <CMSLink {...link} className="text-3xl" />
          </li>
        ))}
      </ul>
    </div>
  )
}
