import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { GlobalSlug } from '@website/types/globals'

import { resolveRelations } from '@/lib/resolveRelation'

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
  revalidateTag(GlobalSlug.SiteSettings, 'max')
}
