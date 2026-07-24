'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { type GlobalData, GlobalSlug } from '@/types/globals'

export const fetchPDFGeneratorSettings = async (
  locale: Locale = 'en',
): Promise<GlobalData<GlobalSlug['PDFGeneratorSettings']>> => {
  const payload = await getPayload({
    config,
  })

  const data = await payload.findGlobal({
    slug: GlobalSlug.PDFGeneratorSettings,
    draft: false,
  })

  return reduceDataToLocale(data, locale)
}
