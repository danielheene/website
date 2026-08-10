import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { GlobalSlug } from '@/types/globals'

export const fetchSiteSettings = async (locale: Locale = 'en') => {
  const payload = await getPayload({
    config,
  })

  const data = await payload.findGlobal({
    slug: GlobalSlug.SiteSettings,
    draft: false,
  })

  return await resolveRelations(reduceDataToLocale(data, locale))
}

export const fetchSiteSettingsCached = async (locale: Locale = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(GlobalSlug.SiteSettings)
  return await fetchSiteSettings(locale)
}

export const revalidateSiteSettings = async (): Promise<void> => {
  revalidateTag(GlobalSlug.SiteSettings, 'max')
}
