import { format, type UrlObject } from 'node:url'

import type { BasePayload } from 'payload'

import { resolveLinkProps } from '@/fields/Link/lib/resolveLinkProps'
import { reduceDataToBilingualLanguage } from '@/lib/i18n/reduceDataToBilingualLanguage'
import { GlobalSlug } from '@/types/globals'

import type { EmailSite, EmailSocialLink } from './site'

/**
 * The footer data from Site Settings (legal pages) and the Global User Settings (name, address,
 * and the email, phone and Referenced Profiles links in the site footer's order). Takes the Payload instance rather than using
 * the cached fetchers: those import the Payload config, which the auth email hooks are part of.
 */
export const getEmailSite = async (payload: BasePayload): Promise<EmailSite> => {
  const url = process.env.SERVER_URL

  const [siteSettings, userSettings] = await Promise.all([
    payload.findGlobal({
      slug: GlobalSlug.SiteSettings,
      depth: 1,
    }),
    payload.findGlobal({
      slug: GlobalSlug.GlobalUserSettings,
      depth: 0,
    }),
  ])

  const { footer } = reduceDataToBilingualLanguage(siteSettings, 'en')

  const { name, address, email, phoneNumber, sameAs } = reduceDataToBilingualLanguage(
    userSettings,
    'en',
  )

  const legalLinks = (footer?.legalPages?.entries ?? []).flatMap((entry) => {
    const href = resolveLinkProps(entry)?.href

    return href
      ? [
          {
            label: entry.text,
            // SAFETY: `url.format` accepts a string at run time as well; its typings split the
            // two shapes `resolveLinkProps` returns (a path or a `UrlObject`) into separate overloads
            href: new URL(format(href as UrlObject), url).toString(),
          },
        ]
      : []
  })

  // the same aliases the site footer uses for these two
  const contactLinks: EmailSocialLink[] = [
    ...(email
      ? [
          {
            icon: 'mail',
            label: 'Email',
            href: `mailto:${email}`,
          },
        ]
      : []),
    ...(phoneNumber?.uri
      ? [
          {
            icon: 'phone',
            label: 'Phone Number',
            href: phoneNumber.uri,
          },
        ]
      : []),
  ]

  const profileLinks = (sameAs ?? []).flatMap(({ icon, name: label, url: profileUrl }) =>
    icon && label && profileUrl
      ? [
          {
            icon,
            label,
            href: profileUrl,
          },
        ]
      : [],
  )

  const addressLines = [
    name,
    [address?.street, address?.number].filter(Boolean).join(' '),
    [address?.postCode, address?.place].filter(Boolean).join(' '),
    address?.countryName,
  ].filter((line): line is string => Boolean(line))

  return {
    name: process.env.SERVER_HOST,
    url,
    assetUrl: url,
    appUrl: url,
    address: addressLines,
    socialLinks: [...contactLinks, ...profileLinks],
    legalLinks,
  }
}
