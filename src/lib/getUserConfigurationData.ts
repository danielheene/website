'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { GlobalSlug } from '@/types/globals'
import type { UserConfigurationData } from '@/types/payload'

export const getUserConfigurationData =
  async (): Promise<UserConfigurationData> => {
    const payload = await getPayload({
      config,
    })

    return await payload.findGlobal({
      slug: GlobalSlug.SettingsUserConfiguration,
      draft: false,
    })
  }

export const getCachedUserConfigurationData = unstable_cache(
  getUserConfigurationData,
  [],
  {
    tags: [
      GlobalSlug.SettingsUserConfiguration,
    ],
  },
)
