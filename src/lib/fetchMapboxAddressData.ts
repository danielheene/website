'use server'

import { get } from 'lodash-es'

import type { AddressData } from '@/types/payload'

type Params = {
  locale: string
} & Pick<AddressData, 'street' | 'number' | 'place' | 'postCode' | 'countryCode' | 'countryName'>

export const fetchMapboxAddressData = async ({
  street,
  number,
  place,
  postCode,
  countryCode,
  countryName,
  locale,
}: Params): Promise<AddressData> => {
  const searchString = `${street} ${number}, ${postCode} ${place}, ${countryName || countryCode}`

  const searchParams = new URLSearchParams({
    q: searchString,
    autocomplete: 'true',
    access_token: process.env.MAPBOX_API_KEY,
    language: locale,
    limit: '1',
  })

  const data = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${searchParams.toString()}`,
  ).then((res) => res.json())

  return {
    location: get(data, 'features.0.geometry.coordinates'),
    street: get(data, 'features.0.properties.context.address.street_name', street),
    number: get(data, 'features.0.properties.context.address.address_number', number),
    postCode: get(data, 'features.0.properties.context.postcode.name', postCode),
    place: get(data, 'features.0.properties.context.place.name', place),
    countryCode: get(data, 'features.0.properties.context.country.country_code', countryCode),
    locality: get(data, 'features.0.properties.context.locality.name'),
    region: get(data, 'features.0.properties.context.region.name'),
    countryName: get(data, 'features.0.properties.context.country.name', countryName),
  }
}
