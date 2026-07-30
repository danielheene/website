'use server'

import { fetchGlobalUserSettings } from '@/lib/fetchers'
import { Locale, translate } from '@/lib/i18n'
import { DocumentSectionType, LanguageSection } from '@/pdf/types'

export const buildLanguageSection = async (locale: Locale): Promise<LanguageSection> => {
  const { languages } = await fetchGlobalUserSettings(locale)

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
