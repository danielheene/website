import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { GlobalSlug } from '@/types/globals'

export const fetchSiteSettings = async (locale: BilingualLanguage = 'en') => {
  const payload = await getPayload({
    config,
  })

  const data = await payload.findGlobal({
    slug: GlobalSlug.SiteSettings,
    draft: false,
  })

  return await resolveRelations(reduceDataToBilingualLanguage(data, locale))
}

export const fetchSiteSettingsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(GlobalSlug.SiteSettings)

  return await fetchSiteSettings(locale)
}

export const revalidateSiteSettings = async (): Promise<void> => {
  await revalidateCache({
    tags: [GlobalSlug.SiteSettings],
  })
}
