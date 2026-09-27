'use server'

import { get } from 'lodash-es'

import type { AddressData } from '@/types/payload'

type Params = {
  locale: string
  location: [
    number,
    number,
  ]
}

export const fetchMapboxCoordinatesData = async ({
  locale,
  location,
}: Params): Promise<AddressData> => {
  const searchParams = new URLSearchParams({
    longitude: location[0].toString(),
    latitude: location[1].toString(),
    autocomplete: 'true',
    access_token: process.env.MAPBOX_API_KEY,
    language: locale,
    limit: '1',
  })

  const data = await fetch(
    `https://api.mapbox.com/search/geocode/v6/reverse?${searchParams.toString()}`,
  ).then((res) => res.json())

  return {
    location: get(data, 'features.0.geometry.coordinates'),
    street: get(data, 'features.0.properties.context.address.street_name'),
    number: get(data, 'features.0.properties.context.address.address_number'),
    postCode: get(data, 'features.0.properties.context.postcode.name'),
    place: get(data, 'features.0.properties.context.place.name'),
    countryCode: get(data, 'features.0.properties.context.country.country_code'),
    locality: get(data, 'features.0.properties.context.locality.name'),
    region: get(data, 'features.0.properties.context.region.name'),
    countryName: get(data, 'features.0.properties.context.country.name'),
  }
}
