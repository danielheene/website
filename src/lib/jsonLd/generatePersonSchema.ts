import type { PersonLeaf } from 'schema-dts'

import { translate } from '@/lib/i18n'
import { GlobalData, GlobalSlug } from '@/types/globals'

import { jsonLdIds } from './ids'
import { isImageLike, toImageObject } from './imageObject'
import { toPostalAddress } from './postalAddress'

/**
 * The site owner as a `Person`, the entity every other node's author and
 * publisher points at. Birth date and gender are deliberately left out.
 */
export function generatePersonSchema(
  data: GlobalData<GlobalSlug['GlobalUserSettings']>,
  siteUrl: string,
): PersonLeaf {
  const person: PersonLeaf = {
    '@type': 'Person',
    '@id': jsonLdIds(siteUrl).person,
    name: data.name,
  }

  if (data.firstName) person.givenName = data.firstName

  if (data.lastName) person.familyName = data.lastName

  // The portrait fields are polymorphic uploads: the image is their `value`.
  const portrait = [data.portrait?.regular?.value, data.portrait?.duotone?.value].find(isImageLike)
  const image = portrait && toImageObject(portrait, siteUrl)

  if (image) person.image = image

  if (data.jobTitle) person.jobTitle = data.jobTitle

  person.url = data.url || siteUrl

  if (data.email) person.email = data.email

  if (data.phoneNumber?.value) person.telephone = data.phoneNumber.value

  const sameAs = (data.sameAs ?? []).map(({ url }) => url).filter(Boolean)

  if (sameAs.length > 0) person.sameAs = sameAs

  if (data.duns) person.duns = data.duns

  if (data.vatID) person.vatID = data.vatID

  if (data.taxID) person.taxID = data.taxID

  const address = toPostalAddress(data.address)

  if (address) person.address = address

  if (Array.isArray(data.languages) && data.languages.length > 0) {
    person.knowsLanguage = data.languages
      .filter(({ language }) => language)
      .map(({ language }) => ({
        '@type': 'Language',
        name: translate('en', `language.name.${language}`),
        alternateName: language,
      }))
  }

  if (data.birthPlace) {
    person.birthPlace = {
      '@type': 'Place',
      name: data.birthPlace,
    }
  }

  if (data.homeLocation) {
    person.homeLocation = {
      '@type': 'Place',
      name: data.homeLocation,
    }
  }

  if (data.worksFor?.name) {
    const employerAddress = toPostalAddress(data.worksFor.address)

    person.worksFor = {
      '@type': 'Organization',
      name: data.worksFor.name,
      ...(data.worksFor.url && {
        url: data.worksFor.url,
      }),
      ...(employerAddress && {
        address: employerAddress,
      }),
    }
  }

  return person
}
