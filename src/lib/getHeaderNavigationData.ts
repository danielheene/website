'use server'

import { GlobalSlug } from '@custom-types'
import config from '@payload-config'
import { HeaderNavigationData } from '@payload-types'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getHeaderNavigationData = async (): Promise<HeaderNavigationData> => {
  const payload = await getPayload({ config })

  return await payload.findGlobal({
    slug: GlobalSlug.SettingsHeaderNavigation,
    draft: false,
  })
}

export const getCachedHeaderNavigationData = unstable_cache(getHeaderNavigationData, [], {
  tags: [GlobalSlug.SettingsHeaderNavigation],
})
