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

  // Typed rather than inferred: these are hand-built `LinkFieldData` values
  // that never pass through the CMS, so an inferred `any[]` would let them
  // drift from the field's shape without `tsc` noticing — which is exactly
  // how they kept the removed `type`/`icon` keys through the link rework.
  const socialLinks: {
    id: string
    link: LinkFieldData
  }[] = []

  if (email) {
    socialLinks.push({
      id: 'email',
      link: {
        url: `mailto:${email}`,
        label: 'Email',
        iconBefore: 'mail',
        iconOnly: true,
        newTab: true,
      },
    })
  }

  if (telephone) {
    socialLinks.push({
      id: 'telephone',
      link: {
        url: parsePhoneNumber(telephone).getURI(),
        label: 'Telephone',
        iconBefore: 'phone',
        newTab: true,
        iconOnly: true,
      },
    })
  }

  sameAs.forEach(({ id, name, url, icon }) => {
    socialLinks.push({
      id,
      link: {
        url,
        label: name,
        iconBefore: icon,
        iconOnly: true,
        newTab: true,
      },
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
