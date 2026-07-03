'use server'

import config from '@payload-config'
import parsePhoneNumber from 'libphonenumber-js'

import { getPayload } from 'payload'

import { DocumentHeader } from '@pdf/types'
import type { Locale } from '@/lib/i18n'
import { isMediaImage } from '@/lib/typeGuards'
import { CollectionSlug } from '@/types/collections'
import type { GlobalData, GlobalSlug } from '@/types/globals'

interface BuildDocumentHeaderDataArgs {
  locale: Locale
  userData: GlobalData<GlobalSlug.SettingsUserConfiguration>
}

export const buildDocumentHeaderData = async ({
  userData,
}: BuildDocumentHeaderDataArgs): Promise<DocumentHeader> => {
  const { portrait, address, telephone, email, url, sameAs } = userData

  const payload = await getPayload({
    config,
  })

  return {
    portraitUrl: isMediaImage(portrait.regular)
      ? portrait.regular.url
      : await payload
          .findByID({
            collection: CollectionSlug.MediaImages,
            id: portrait.regular,
          })
          .then((media) => media.url),
    address: {
      street: `${address.street} ${address.number}`,
      city: `${address.postCode} ${address.place}`,
    },
    telephone: {
      label: parsePhoneNumber(telephone).formatInternational(),
      href: parsePhoneNumber(telephone).getURI() as `tel:${string}`,
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
      label: sameAs?.find(({ url }) => url.includes('github'))?.url.replace(/^https?:\/\//, ''),
      href: sameAs?.find(({ url }) => url.includes('github'))?.url,
    },
  }
}
