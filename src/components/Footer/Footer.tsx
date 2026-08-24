import Link from 'next/link'

import parsePhoneNumber from 'libphonenumber-js'

import { FooterLegalLinks } from '@/components/Footer/FooterLegalLinks'
import { FooterNavGroups } from '@/components/Footer/FooterNavGroups'
import { Logo } from '@/components/Logo'
import { ServiceStatus } from '@/components/ServiceStatus'
import type { LinkFieldDataLean, NavEntry } from '@/fields/Link/lib/resolveLinkTarget'
import { cn } from '@/lib/cn'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'

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
    link: LinkFieldDataLean
  }[] = []

  if (email) {
    socialLinks.push({
      id: 'email',
      link: {
        linkType: 'custom',
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
        linkType: 'custom',
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
        linkType: 'custom',
        url,
        label: name,
        iconBefore: icon,
        iconOnly: true,
        newTab: true,
      },
    })
  })

  // `column1`/`column2`/`column3` come straight off `fetchSiteSettingsCached()`,
  // typed against the generated (unnarrowed) `NavEntries` — `reference.value`
  // there is `string | Page`, and `Page.content` recursively embeds more link
  // fields, so it can't be assigned to `FooterNavGroups`' lean prop type
  // without TypeScript trying (and failing) to unify two different expansions
  // of that recursion. `resolveRelations` has already depth-limited the real
  // data to what `NavEntry` describes; the cast just tells TypeScript that,
  // same as the `LinkFieldDataLean` casts in `RichText/serialize.tsx`.
  const navGroups = (
    [
      column1,
      column2,
      column3,
    ] as {
      isActive?: boolean | null
      title?: string | null
      entries?: NavEntry[] | null
    }[]
  ).filter(({ isActive }) => isActive === true)

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
            <FooterLegalLinks
              legalPages={
                legalPages as {
                  entries?: NavEntry[] | null
                }
              }
            />
          </div>
        </div>
      </section>
    </footer>
  )
}
