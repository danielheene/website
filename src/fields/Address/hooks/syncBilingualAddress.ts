import type { FieldHookArgs } from 'payload'

import { isEqual } from 'lodash-es'

import { fetchMapboxAddressData } from '@/lib/fetchMapboxAddressData'
import { fetchMapboxCoordinatesData } from '@/lib/fetchMapboxCoordinatesData'
import type { AddressData } from '@/types/payload'

type BilingualAddress = {
  en: AddressData
  de: AddressData
}

const ADDRESS_TEXT_KEYS: (keyof AddressData)[] = [
  'street',
  'number',
  'postCode',
  'place',
  'countryCode',
  'countryName',
]

const REQUIRED_GROUPS: (keyof AddressData)[][] = [
  [
    'street',
  ],
  [
    'postCode',
    'place',
  ],
  [
    'countryCode',
    'countryName',
  ],
]

function hasRequiredFields(data: AddressData): boolean {
  return REQUIRED_GROUPS.every((group) =>
    group.some((key) => Object.hasOwn(data, key) && data[key] !== ''),
  )
}

function addressTextChanged(prev: AddressData, next: AddressData): boolean {
  return ADDRESS_TEXT_KEYS.some((key) => prev[key] !== next[key])
}

export const syncBilingualAddress = async ({
  value,
  previousValue,
  // biome-ignore lint/suspicious/noExplicitAny: Payload FieldHookArgs parent/sibling doc types are not worth narrowing here
}: FieldHookArgs<any, BilingualAddress, any>): Promise<BilingualAddress> => {
  if (!value || !previousValue) return value

  const enChanged = addressTextChanged(previousValue.en ?? {}, value.en ?? {})
  const deChanged = addressTextChanged(previousValue.de ?? {}, value.de ?? {})
  const locationChanged = !isEqual(previousValue.en?.location, value.en?.location)

  // If coordinates changed (e.g. point field edited directly), reverse-geocode both locales
  if (locationChanged && value.en?.location) {
    try {
      const [en, de] = await Promise.all([
        fetchMapboxCoordinatesData({
          locale: 'en',
          location: value.en.location,
        }),
        fetchMapboxCoordinatesData({
          locale: 'de',
          location: value.en.location,
        }),
      ])
      return {
        en,
        de,
      }
    } catch (error) {
      console.error('Error reverse-geocoding address:', error)
    }
    return value
  }

  // Use whichever locale changed as the source of truth for both
  const sourceLocale = enChanged ? 'en' : deChanged ? 'de' : null
  if (!sourceLocale) return value

  const source = value[sourceLocale]
  if (!hasRequiredFields(source)) return value

  try {
    const [en, de] = await Promise.all([
      fetchMapboxAddressData({
        locale: 'en',
        ...source,
      }),
      fetchMapboxAddressData({
        locale: 'de',
        ...source,
      }),
    ])
    return {
      en,
      de,
    }
  } catch (error) {
    console.error('Error syncing bilingual address:', error)
  }

  return value
}
