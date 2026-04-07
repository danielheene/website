import type { AddressData } from '@payload-types'
import { set } from 'lodash-es'
import type { FieldHookArgs } from 'payload'

import { fetchAddressData } from '@/lib/fetchAddressData'

export const resolveAddressDataForOtherLocale = async ({
  value,
  path,
  originalDoc,
  collection,
  global,
  req,
  data,
  context: { otherLocale, skipResolveAddressData },
}: FieldHookArgs<any, AddressData, any>) => {
  if (skipResolveAddressData) return
  if (!otherLocale) return

  const locale = otherLocale as 'de' | 'en'
  const address = await fetchAddressData({ locale, ...value })

  const requestInit = {
    data: set(data, path.join('.'), address),
    context: {
      skipResolveAddressData: true,
    },
    locale,
    req,
  }

  if (collection) {
    await req.payload.update({
      collection: collection.slug,
      where: {
        id: {
          equals: originalDoc.id,
        },
      },
      ...requestInit,
    })
  }
  if (global) {
    await req.payload.updateGlobal({
      slug: global.slug,
      ...requestInit,
    })
  }
}
