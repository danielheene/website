'use server'

import { DocumentSectionType, LanguageSection } from '@pdf/types'
import { getGlobalUserSettings } from '@/lib/getGlobalUserSettings'
import { Locale, translate } from '@/lib/i18n'

export const buildLanguageSection = async (locale: Locale): Promise<LanguageSection> => {
  const { languages } = await getGlobalUserSettings(locale)

  return {
    type: DocumentSectionType.Language,
    data: {
      headline: translate(locale, 'language.label.plural'),
      entries: languages.map(({ language, proficiency }) =>
        [
          `${translate(locale, `language.name.${language}`)}`,
          `[${translate(locale, `language.proficiency.${proficiency}`)}]`,
        ].join(' '),
      ),
    },
  }
}
