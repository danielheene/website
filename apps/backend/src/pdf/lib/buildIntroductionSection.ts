'use server'

import { BilingualLanguage } from '@website/lib/i18n'

import { fetchGlobalUserSettings } from '@/lib/fetchers'
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
