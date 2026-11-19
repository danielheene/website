import { fetchGlobalUserSettings } from '@/lib/fetchers'
import type { BilingualLanguage } from '@/lib/i18n'
import { DocumentHeader } from '@/pdf/types'

export const buildDocumentHeader = async (locale: BilingualLanguage): Promise<DocumentHeader> => {
  const { portrait, address, phoneNumber, email, url, sameAs } =
    await fetchGlobalUserSettings(locale)

  const github = sameAs?.find(({ url }) => url.includes('github'))

  const portraitUrl = portrait?.regular?.value?.url

  if (!portraitUrl) {
    throw new Error(
      'GlobalUserSettings.portrait is missing a "regular" image variant — set a portrait in the admin panel before generating a resume document.',
    )
  }

  const phoneNumberURI = phoneNumber?.uri

  if (!phoneNumberURI || !phoneNumber.formatted) {
    throw new Error(
      'GlobalUserSettings.phoneNumber is missing or invalid — set a valid phone number in the admin panel before generating a resume document.',
    )
  }

  return {
    portraitUrl,
    address: {
      street: `${address.street} ${address.number}`,
      city: `${address.postCode} ${address.place}`,
    },
    telephone: {
      label: phoneNumber.formatted,
      // SAFETY: getPhoneNumberURI only returns libphonenumber's `tel:` URI or '', and '' is rejected above.
      href: phoneNumberURI as `tel:${string}`,
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
