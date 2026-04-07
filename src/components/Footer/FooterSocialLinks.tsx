import type { LinkFieldData } from '@payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'

interface FooterSocialLinksProps {
  className?: string
  socialLinks: { id: string; link: LinkFieldData }[]
}

export const FooterSocialLinks = ({ socialLinks, className }: FooterSocialLinksProps) => {
  return (
    <div className={cn('flex flex-col justify-between gap-3 lg:items-start', className)}>
      <p className="max-w-9/12 text-sm text-muted-foreground">You can also reach out to me via:</p>
      <nav className="flex items-center gap-x-4">
        {socialLinks.map(({ link, id }) => (
          <CMSLink key={id} {...link} className="block text-3xl leading-px text-current/75 hover:text-current" />
        ))}
      </nav>
    </div>
  )
}
