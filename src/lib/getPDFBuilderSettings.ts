'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'

import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { type GlobalData, GlobalSlug } from '@/types/globals'

export const getPDFBuilderSettings = async (
  locale: Locale = 'en',
): Promise<GlobalData<GlobalSlug['SettingsPDFBuilder']>> => {
  const payload = await getPayload({
    config,
  })

  const data = await payload.findGlobal({
    slug: GlobalSlug['SettingsPDFBuilder'],
    draft: false,
  })

  return reduceDataToLocale(data, locale)
}

export const getCachedPDFBuilderSettings = unstable_cache(getPDFBuilderSettings, [], {
  tags: [
    GlobalSlug['SettingsPDFBuilder'],
  ],
})
