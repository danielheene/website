import type { Person, WithContext } from 'schema-dts'

import { getLanguageName } from '@/lib/languageNames'
import { isMediaImage } from '@/lib/typeGuards'
import type { UserConfigurationData } from '@/types/payload'

/**
 * Generates Person JSON-LD
 *
 * @example
 * ```
 * const personLd = generatePerson({
 *   name: 'Daniel Heene',
 *   jobTitle: 'Software Engineer',
 *   url: 'https://daniel.heene.io',
 *   email: 'daniel@heene.io',
 *   sameAs: ['https://github.com/danielheene', 'https://linkedin.com/in/danielheene'],
 *   knowsLanguage: ['German', 'English'],
 *   homeLocation: 'Germany',
 *   worksFor: {
 *     name: 'Self-Employed',
 *     url: 'https://daniel.heene.io'
 *   }
 * })
 * ```
 */
export function generatePersonSchema(
  data: UserConfigurationData,
): WithContext<Person> {
  const person: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
  }

  const hasPortraitObject =
    data.portrait &&
    typeof data.portrait === 'object' &&
    'regular' in data.portrait &&
    'duotone' in data.portrait

  const portraitUrl =
    hasPortraitObject && isMediaImage(data.portrait.regular)
      ? data.portrait.regular.url
      : hasPortraitObject && isMediaImage(data.portrait.duotone)
        ? data.portrait.duotone.url
        : null

  if (portraitUrl) {
    person.image = {
      '@type': 'ImageObject',
      url: portraitUrl,
    }
  }

  if (data.jobTitle) person.jobTitle = data.jobTitle
  if (data.url) person.url = data.url
  if (data.email) person.email = data.email
  if (data.telephone) person.telephone = data.telephone
  // if (data.description) person.description = data.description
  if (data.sameAs && Array.isArray(data.sameAs) && data.sameAs.length > 0) {
    person.sameAs = data.sameAs.map(({ url }) => url)
  }
  if (data.duns) person.duns = data.duns
  if (data.birthDate) person.birthDate = data.birthDate
  if (data.gender) person.gender = data.gender
  if (data.vatID) person.vatID = data.vatID
  if (data.taxID) person.taxID = data.taxID

  if (data.address) {
    person.address = {
      '@type': 'PostalAddress',
      ...data.address,
    }
  }

  if (
    data.languages &&
    Array.isArray(data.languages) &&
    data.languages.length > 0
  ) {
    person.knowsLanguage = data.languages.map(({ language }) => ({
      '@type': 'Language',
      name: getLanguageName(language),
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

  if (
    data.worksFor &&
    typeof data.worksFor === 'object' &&
    'name' in data.worksFor &&
    typeof data.worksFor.name === 'string'
  ) {
    person.worksFor = {
      '@type': 'Organization',
      name: data.worksFor.name,
      ...(data.worksFor.url && {
        url: data.worksFor.url,
      }),
      ...(data.worksFor.address && {
        address: {
          '@type': 'PostalAddress',
          ...data.worksFor.address,
        },
      }),
    }
  }

  return person
}
