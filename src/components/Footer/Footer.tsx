import Link from 'next/link'

import parsePhoneNumber from 'libphonenumber-js'

import { FooterLegalLinks } from '@/components/Footer/FooterLegalLinks'
import { FooterNavGroups } from '@/components/Footer/FooterNavGroups'
import { Logo } from '@/components/Logo'
import { ServiceStatus } from '@/components/ServiceStatus'
import { cn } from '@/lib/cn'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import type { LinkFieldData } from '@/types/payload'

import { FooterSocialLinks } from './FooterSocialLinks'
import { FooterThemeSwitcher } from './FooterThemeSwitcher'

export const Footer = async () => {
  const {
    footer: { column1, column2, column3, legalPages },
  } = await fetchSiteSettingsCached()
  const { telephone, email, sameAs } = await fetchGlobalUserSettingsCached()

  const socialLinks = []

  if (email) {
    socialLinks.push({
      id: 'email',
      link: {
        type: 'custom',
        url: `mailto:${email}`,
        label: 'Email',
        icon: 'mail',
        iconOnly: true,
        newTab: true,
      },
    })
  }

  if (telephone) {
    socialLinks.push({
      id: 'telephone',
      link: {
        type: 'custom',
        url: parsePhoneNumber(telephone).getURI(),
        label: 'Telephone',
        icon: 'phone',
        newTab: true,
        iconOnly: true,
      },
    })
  }

  sameAs.forEach(({ id, name, url, icon }) => {
    socialLinks.push({
      id,
      link: {
        type: 'custom',
        url,
        label: name,
        icon,
        iconOnly: true,
        newTab: true,
      } as LinkFieldData,
    })
  })

  const navGroups = [
    column1,
    column2,
    column3,
  ].filter(({ isActive }) => isActive === true)

  return (
    <footer
      className={cn([
        'transition-constants',
        'bg-background text-foreground',
      ])}
    >
      <section className="container">
        <div className="w-full pt-20 mt-20 border-t border-foreground/50">
          <div className="flex w-full flex-row justify-between items-center mb-4">
            <Link href="/">
              <Logo variant="inline" className="h-5 md:h-6 xl:h-7" blink />
            </Link>
            <FooterThemeSwitcher />
          </div>
          <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
            <FooterSocialLinks socialLinks={socialLinks} className="w-full" />
            <FooterNavGroups navGroups={navGroups} className="w-full" />
          </div>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
            <ServiceStatus className="mr-auto" />
            <FooterLegalLinks legalPages={legalPages} />
          </div>
        </div>
      </section>
    </footer>
  )
}
