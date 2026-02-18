'use server'

import { GlobalSlug } from '@custom-types'
import config from '@payload-config'
import type { FooterNavigationData } from '@payload-types'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getFooterNavigationData = async (): Promise<FooterNavigationData> => {
  const payload = await getPayload({ config })

  return await payload.findGlobal({
    slug: GlobalSlug.SettingsFooterNavigation,
    draft: false,
  })
}

export const getCachedFooterNavigationData = unstable_cache(getFooterNavigationData, [], {
  tags: [GlobalSlug.SettingsFooterNavigation],
})
