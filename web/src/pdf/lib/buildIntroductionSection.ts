'use server'

import { DocumentSectionType, IntroductionSection } from '@pdf/types'
import { getGlobalUserSettings } from '@/lib/getGlobalUserSettings'
import { Locale } from '@/lib/i18n'

export const buildIntroductionSection = async (locale: Locale): Promise<IntroductionSection> => {
  const { name, jobTitle } = await getGlobalUserSettings(locale)
  const description = ''

  return {
    type: DocumentSectionType.Introduction,
    data: {
      headline: `${name}, ${jobTitle}`,
      content: description,
    },
  }
}
