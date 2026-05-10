'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { GlobalSlug } from '@/types/globals'
import type { PageHeaderData } from '@/types/payload'

/**
 * Fetches the header navigation data from Payload
 */
export const getPageHeaderData = async (): Promise<PageHeaderData> => {
  const payload = await getPayload({
    config,
  })

  return await payload.findGlobal({
    slug: GlobalSlug.SettingsPageHeader,
    draft: false,
  })
}

export const getCachedPageHeaderData = unstable_cache(getPageHeaderData, [], {
  tags: [
    GlobalSlug.SettingsPageHeader,
  ],
})
