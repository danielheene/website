import type { FieldHookArgs } from 'payload'

import { fetchMapboxAddressData } from '@/lib/fetchMapboxAddressData'
import type { AddressData } from '@/types/payload'

export const resolveAddressData = async ({
  value,
  previousValue,
  req,
  context,
  path,
}: FieldHookArgs<any, AddressData, any>) => {
  if (context.skipResolveAddressData) return value

  const requiredGroups = [
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
  const fieldsChanged = requiredGroups.some((group) => {
    return group.some((key) => previousValue[key] !== value[key])
  })
  const fieldsAvailable = requiredGroups.every((group) => {
    return group.some((key) => Object.hasOwn(value, key) && value[key] !== '')
  })

  if (fieldsChanged && fieldsAvailable) {
    try {
      const locale = path.at(-1) as 'de' | 'en'
      return await fetchMapboxAddressData({
        locale,
        ...value,
      })
    } catch (error) {
      console.error('Error resolving address data:', error)
    }
  }

  return value
}
