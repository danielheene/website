import { cn } from 'tailwind-variants'

import { CMSLink } from '@/components/Link'
import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'

interface FooterSocialLinksProps {
  className?: string
  socialLinks: {
    id: string
    link: LinkFieldDataLean
  }[]
}

export const FooterSocialLinks = ({ socialLinks, className }: FooterSocialLinksProps) => {
  return (
    <div className={cn('flex flex-col gap-2.5 lg:items-start', className)}>
      <p className="font-mono">Drop me a message:</p>
      <nav className="flex items-center gap-x-2.5">
        {socialLinks.map(({ link, id }) => (
          <CMSLink key={id} {...link} variant="outline" size="icon-lg" />
        ))}
      </nav>
    </div>
  )
}
