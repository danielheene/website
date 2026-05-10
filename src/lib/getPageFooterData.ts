'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { GlobalSlug } from '@/types/globals'
import type { PageFooterData } from '@/types/payload'

export const getPageFooterData =
  async (): Promise<PageFooterData> => {
    const payload = await getPayload({
      config,
    })

    return await payload.findGlobal({
      slug: GlobalSlug.SettingsPageFooter,
      draft: false,
    })
  }

export const getCachedPageFooterData = unstable_cache(
  getPageFooterData,
  [],
  {
    tags: [
      GlobalSlug.SettingsPageFooter,
    ],
  },
)
