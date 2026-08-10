import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { GlobalSlug } from '@/types/globals'

export const fetchGlobalUserSettings = async (locale: Locale = 'en') => {
  const payload = await getPayload({
    config,
  })

  const data = await payload.findGlobal({
    slug: GlobalSlug.GlobalUserSettings,
    draft: false,
  })

  return await resolveRelations(reduceDataToLocale(data, locale))
}

export const fetchGlobalUserSettingsCached = async (locale: Locale = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(GlobalSlug.GlobalUserSettings)
  return await fetchGlobalUserSettings(locale)
}

export const revalidateGlobalUserSettings = async (): Promise<void> => {
  revalidateTag(GlobalSlug.GlobalUserSettings, 'max')
}
