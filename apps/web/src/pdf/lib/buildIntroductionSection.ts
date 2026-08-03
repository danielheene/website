'use server'

import { fetchGlobalUserSettings } from '@/lib/fetchers'
import { Locale } from '@/lib/i18n'
import { DocumentSectionType, IntroductionSection } from '@/pdf/types'

export const buildIntroductionSection = async (locale: Locale): Promise<IntroductionSection> => {
  const { name, jobTitle } = await fetchGlobalUserSettings(locale)
  const description = ''

  return {
    type: DocumentSectionType.Introduction,
    data: {
      headline: `${name}, ${jobTitle}`,
      content: description,
    },
  }
}
