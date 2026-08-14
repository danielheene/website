'use server'

import parsePhoneNumber from 'libphonenumber-js'

import { fetchGlobalUserSettings } from '@/lib/fetchers'
import type { Locale } from '@/lib/i18n'
import { DocumentHeader } from '@/pdf/types'

export const buildDocumentHeader = async (locale: Locale): Promise<DocumentHeader> => {
  const { portrait, address, telephone, email, url, sameAs } = await fetchGlobalUserSettings(locale)

  const phone = parsePhoneNumber(telephone)
  const github = sameAs?.find(({ url }) => url.includes('github'))

  const portraitUrl = portrait?.regular?.value?.url
  if (!portraitUrl) {
    throw new Error(
      'GlobalUserSettings.portrait is missing a "regular" image variant — set a portrait in the admin panel before generating a resume document.',
    )
  }

  return {
    portraitUrl,
    address: {
      street: `${address.street} ${address.number}`,
      city: `${address.postCode} ${address.place}`,
    },
    telephone: {
      label: phone.formatInternational(),
      href: phone.getURI() as `tel:${string}`,
    },
    email: {
      label: email,
      href: `mailto:${email}`,
    },
    website: {
      label: url?.replace(/^https?:\/\//, ''),
      href: url,
    },
    github: {
      label: github?.url.replace(/^https?:\/\//, ''),
      href: github?.url,
    },
  }
}
