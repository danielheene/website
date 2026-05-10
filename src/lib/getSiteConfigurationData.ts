'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { GlobalSlug } from '@/types/globals'
import type { SiteConfigurationData } from '@/types/payload'

export const getSiteConfigurationData =
  async (): Promise<SiteConfigurationData> => {
    const payload = await getPayload({
      config,
    })

    return await payload.findGlobal({
      slug: GlobalSlug.SettingsSiteConfiguration,
      draft: false,
    })
  }

export const getCachedSiteConfigurationData = unstable_cache(
  getSiteConfigurationData,
  [],
  {
    tags: [
      GlobalSlug.SettingsSiteConfiguration,
    ],
  },
)
