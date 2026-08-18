'use server'

import { fetchGlobalUserSettings } from '@/lib/fetchers'
import { BilingualLanguage } from '@/lib/i18n'
import { DocumentSectionType, IntroductionSection } from '@/pdf/types'

export const buildIntroductionSection = async (
  locale: BilingualLanguage,
): Promise<IntroductionSection> => {
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
