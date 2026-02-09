'use server'

import { GlobalSlug } from '@custom-types'
import config from '@payload-config'
import { SiteMetaData } from '@payload-types'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getSiteMetaData = async (): Promise<SiteMetaData> => {
  const payload = await getPayload({ config })

  return await payload.findGlobal({
    slug: GlobalSlug.SettingsSiteMeta,
    draft: false,
  })
}

export const getCachedSiteMetaData = unstable_cache(getSiteMetaData, [], {
  tags: [GlobalSlug.SettingsSiteMeta],
})
