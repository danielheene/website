import { GlobalSlug } from '@custom-types'
import config from '@payload-config'
import { SettingsHeaderGlobalData } from '@payload-types'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getHeaderData = async (): Promise<SettingsHeaderGlobalData> => {
  const payload = await getPayload({ config })

  return await payload.findGlobal({
    slug: GlobalSlug.SettingsHeader,
    draft: false,
  })
}

export const getCachedHeaderData = unstable_cache(getHeaderData, [], {
  tags: [`${GlobalSlug.SettingsHeader}`],
})
