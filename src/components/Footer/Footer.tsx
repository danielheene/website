import type { FooterNavigationData, LinkFieldData } from '@payload-types'
import parsePhoneNumber from 'libphonenumber-js'
import Link from 'next/link'

import { FooterLegalLinks } from '@/components/Footer/FooterLegalLinks'
import { FooterNavGroups } from '@/components/Footer/FooterNavGroups'
import { ICON } from '@/components/Icon'
import { Logo } from '@/components/Logo'
import { ServiceStatus } from '@/components/ServiceStatus'
import { getCachedFooterNavigationData } from '@/lib/getFooterNavigationData'
import { getCachedUserMetaData } from '@/lib/getUserMetaData'
import { cn } from '@/utilities/cn'

import { FooterSocialLinks } from './FooterSocialLinks'
import { FooterThemeSwitcher } from './FooterThemeSwitcher'

interface FooterProps {
  className?: string
}

export const Footer = async ({ className = '' }: FooterProps) => {
  const { navGroups, legalLinks }: FooterNavigationData = await getCachedFooterNavigationData()
  const { telephone, email, sameAs } = await getCachedUserMetaData()

  const socialLinks: { id: string; link: LinkFieldData }[] = [
    {
      id: 'email',
      link: { type: 'mailto', address: email, label: 'Email', icon: ICON.MAIL, iconOnly: true, newTab: true },
    },
    {
      id: 'telephone',
      link: {
        type: 'custom',
        url: parsePhoneNumber(telephone).getURI(),
        label: 'Telephone',
        icon: ICON.CALL,
        newTab: true,
        iconOnly: true,
      },
    },
    ...sameAs.map(({ id, name, url, icon }) => {
      return {
        id,
        link: { type: 'custom', url, label: name, icon, iconOnly: true, newTab: true } as LinkFieldData,
      }
    }),
  ]

  return (
    <footer className={cn(['transition-colors', 'bg-background text-foreground', className])}>
      <section className="container">
        <div className="w-full pt-20 mt-20 border-t border-foreground/50">
          <div className="flex w-full flex-row justify-between items-center mb-4">
            <Link href="/">
              <Logo variant="inline" className="h-5 md:h-6 xl:h-7" blink />
            </Link>
            <FooterThemeSwitcher />
          </div>
          <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
            {socialLinks && <FooterSocialLinks socialLinks={socialLinks} className="w-full" />}
            {navGroups && <FooterNavGroups navGroups={navGroups} className="w-full" />}
          </div>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
            <ServiceStatus className="mr-auto" />
            {legalLinks && <FooterLegalLinks legalLinks={legalLinks} />}
          </div>
        </div>
      </section>
    </footer>
  )
}
