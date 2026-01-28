import type { Person, WithContext } from 'schema-dts'

export interface PersonData {
  name: string
  jobTitle?: string
  url?: string
  image?: string
  email?: string
  telephone?: string
  description?: string
  sameAs?: string[]
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
}

export function generatePerson(data: PersonData): WithContext<Person> {
  const person: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
  }

  if (data.jobTitle) person.jobTitle = data.jobTitle
  if (data.url) person.url = data.url
  if (data.email) person.email = data.email
  if (data.telephone) person.telephone = data.telephone
  if (data.description) person.description = data.description
  if (data.sameAs && data.sameAs.length > 0) person.sameAs = data.sameAs

  if (data.image) {
    person.image = {
      '@type': 'ImageObject',
      url: data.image,
    }
  }

  if (data.address) {
    person.address = {
      '@type': 'PostalAddress',
      ...data.address,
    }
  }

  return person
}
