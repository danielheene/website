import type { AddressData } from '@/types/payload'
import { isEqual } from 'lodash-es'
import type { FieldHookArgs } from 'payload'

import { fetchMapboxAddressData } from '@/lib/fetchMapboxAddressData'
import { fetchMapboxCoordinatesData } from '@/lib/fetchMapboxCoordinatesData'

export const syncAddressDataBetweenLocale = async ({
  value,
  previousValue,
  previousSiblingDoc,
  siblingData,
  path,
}: FieldHookArgs<any, AddressData, AddressData>) => {
  const siblingLatLongChanged = !isEqual(previousSiblingDoc.location, siblingData.location)
  const ownDataHasChanged = !isEqual(previousValue, value)

  if (siblingLatLongChanged) {
    try {
      const locale = path.at(-1) as 'de' | 'en'
      return await fetchMapboxCoordinatesData({ locale, location: siblingData.location })
    } catch (error) {
      console.error('Error fetching coordinates data:', error)
    }
  }

  if (ownDataHasChanged) {
    try {
      const locale = path.at(-1) as 'de' | 'en'
      return await fetchMapboxAddressData({ locale, ...value })
    } catch (error) {
      console.error('Error fetching address data:', error)
    }
  }

  return value
}
