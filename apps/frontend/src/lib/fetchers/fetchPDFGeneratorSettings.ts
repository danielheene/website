import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { type BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { type GlobalData, GlobalSlug } from '@website/types/globals'

import { fetchGlobal } from '@/lib/payloadClient'

export const fetchPDFGeneratorSettings = async (
  locale: BilingualLanguage = 'en',
): Promise<GlobalData<GlobalSlug['PDFGeneratorSettings']>> => {
  const data = await fetchGlobal<GlobalData<GlobalSlug['PDFGeneratorSettings']>>(
    GlobalSlug.PDFGeneratorSettings,
    {
      cacheTag: GlobalSlug.PDFGeneratorSettings,
    },
  )

  return reduceDataToBilingualLanguage(data, locale)
}

export const fetchPDFGeneratorSettingsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(GlobalSlug.PDFGeneratorSettings)

  return await fetchPDFGeneratorSettings(locale)
}

export const revalidatePDFGeneratorSettings = async (): Promise<void> => {
  revalidateTag(GlobalSlug.PDFGeneratorSettings, 'max')
}
