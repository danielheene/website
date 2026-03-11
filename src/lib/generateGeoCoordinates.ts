import { get } from 'lodash-es'
import { UserMetaData } from '@payload-types'

type Params = {
  locale: string,
} & Pick<UserMetaData['address'], 'street' | 'countryCode' | 'number' | 'place' | 'postCode'>

export const generateGeoCoordinates = async (params: Params): Promise<UserMetaData['address']> => {

  const searchParams = new URLSearchParams({
    street: params.street,
    address_number: params.number,
    postcode: params.postCode,
    place: params.place,
    country: params.countryCode,
    access_token: process.env.MAPBOX_API_KEY,
    language: params.locale,
    limit: '1',
  })

  const data = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${searchParams.toString()}`).then(res => res.json())

  return {
    location: get(data, 'features.0.geometry.coordinates'),
    street: get(data, 'features.0.properties.context.address.street_name', params.street),
    number: get(data, 'features.0.properties.context.address.address_number', params.number),
    postCode: get(data, 'features.0.properties.context.postcode.name', params.postCode),
    place: get(data, 'features.0.properties.context.place.name', params.place),
    countryCode: get(data, 'features.0.properties.context.country.country_code', params.countryCode),
    locality: get(data, 'features.0.properties.context.locality.name'),
    region: get(data, 'features.0.properties.context.region.name'),
    countryName: get(data, 'features.0.properties.context.country.name'),
  }
}
