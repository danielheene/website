import { CMSLink } from '@/components/Link'
import { cn } from '@/lib/cn'
import type { LinkFieldData } from '@/types/payload'

interface FooterSocialLinksProps {
  className?: string
  socialLinks: {
    id: string
    link: LinkFieldData
  }[]
}

export const FooterSocialLinks = ({ socialLinks, className }: FooterSocialLinksProps) => {
  return (
    <div className={cn('flex flex-col justify-between gap-1 lg:items-start', className)}>
      <p className="max-w-9/12 text-sm font-mono text-muted-foreground">
        You can also reach out to me via:
      </p>
      <nav className="flex items-center gap-x-1">
        {socialLinks.map(({ link, id }) => (
          <CMSLink key={id} {...link} size="lg" variant="link" />
        ))}
      </nav>
    </div>
  )
}
