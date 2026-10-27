import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { GlobalSlug } from '@website/types/globals'
import type { SiteSettings } from '@website/types/payload'

import { fetchGlobal } from '@/lib/payloadClient'
import { resolveRelations } from '@/lib/resolveRelation'

export const fetchSiteSettings = async (locale: BilingualLanguage = 'en') => {
  const data = await fetchGlobal<SiteSettings>(GlobalSlug.SiteSettings, {
    cacheTag: GlobalSlug.SiteSettings,
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
