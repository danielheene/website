import type { AddressData } from '@payload-types'
import type { FieldHookArgs } from 'payload'

import { fetchAddressData } from '@/lib/fetchAddressData'

export const resolveAddressData = async ({ value, previousValue, req, context }: FieldHookArgs<any, AddressData, any>) => {
  if (context.skipResolveAddressData) return value

  const requiredGroups = [['street'], ['postCode', 'place'], ['countryCode', 'countryName']]
  const fieldsChanged = requiredGroups.some((group) => group.some((key) => previousValue[key] !== value[key]))
  const fieldsAvailable = requiredGroups.every((group) => {
    return group.some((key) => Object.hasOwn(value, key) && value[key] !== '')
  })

  if (fieldsChanged && fieldsAvailable) {
    const locale = req.locale === 'de' ? 'de' : 'en'
    context.otherLocale = req.locale === 'de' ? 'en' : 'de'

    return await fetchAddressData({ locale, ...value })
  }
  return value
}
