import type { PostalAddressLeaf } from 'schema-dts'

import type { AddressData } from '@/types/payload'

type AddressFields = Pick<
  AddressData,
  'street' | 'number' | 'postCode' | 'place' | 'region' | 'countryCode'
>

type LocalizedAddress = {
  en?: AddressFields
  de?: AddressFields
}

const isLocalized = (address: AddressFields | LocalizedAddress): address is LocalizedAddress =>
  'en' in address || 'de' in address

/**
 * Maps the backend's address fields to `PostalAddress`. The fetchers reduce
 * localized fields to one language, but the static type of some still carries
 * both, so either shape is accepted. `locality` is the city district, which
 * schema.org has no property for.
 */
export const toPostalAddress = (
  address: AddressFields | LocalizedAddress | null | undefined,
): PostalAddressLeaf | undefined => {
  if (!address) return undefined

  const data = isLocalized(address) ? (address.en ?? address.de) : address

  if (!data) return undefined

  const postal: PostalAddressLeaf = {
    '@type': 'PostalAddress',
  }

  const street = [data.street, data.number].filter(Boolean).join(' ')

  if (street) postal.streetAddress = street

  if (data.postCode) postal.postalCode = data.postCode

  if (data.place) postal.addressLocality = data.place

  if (data.region) postal.addressRegion = data.region

  if (data.countryCode) postal.addressCountry = data.countryCode

  return Object.keys(postal).length > 1 ? postal : undefined
}
