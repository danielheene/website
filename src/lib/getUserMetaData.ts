'use server'

import { GlobalSlug } from '@custom-types'
import config from '@payload-config'
import { UserMetaData } from '@payload-types'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getUserMetaData = async (): Promise<UserMetaData> => {
  const payload = await getPayload({ config })

  return await payload.findGlobal({
    slug: GlobalSlug.SettingsUserMeta,
    draft: false,
  })
}

export const getCachedUserMetaData = unstable_cache(getUserMetaData, [], {
  tags: [GlobalSlug.SettingsUserMeta],
})
