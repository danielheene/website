import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { GlobalSlug } from '@website/types/globals'
import type { GlobalUserSettings } from '@website/types/payload'

import { fetchGlobal } from '@/lib/payloadClient'
import { resolveRelations } from '@/lib/resolveRelation'

export const fetchGlobalUserSettings = async (locale: BilingualLanguage = 'en') => {
  const data = await fetchGlobal<GlobalUserSettings>(GlobalSlug.GlobalUserSettings, {
    cacheTag: GlobalSlug.GlobalUserSettings,
  })

  return await resolveRelations(reduceDataToBilingualLanguage(data, locale))
}

export const fetchGlobalUserSettingsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(GlobalSlug.GlobalUserSettings)

  return await fetchGlobalUserSettings(locale)
}

export const revalidateGlobalUserSettings = async (): Promise<void> => {
  revalidateTag(GlobalSlug.GlobalUserSettings, 'max')
}
