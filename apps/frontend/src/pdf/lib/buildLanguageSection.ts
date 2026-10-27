'use server'

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { BilingualLanguage, translate } from '@website/lib/i18n'
import { IS_BOLD, paragraph, root, text } from '@website/lib/seed/lexical'

import { fetchGlobalUserSettings } from '@/lib/fetchers'
import { DocumentSectionType, LanguageSection } from '@/pdf/types'

export const buildLanguageSection = async (locale: BilingualLanguage): Promise<LanguageSection> => {
  const { languages } = await fetchGlobalUserSettings(locale)

  return {
    type: DocumentSectionType.Language,
    data: {
      headline: translate(locale, 'language.label.plural'),
      entries: languages.map(
        ({ language, proficiency }) =>
          // `@website/lib/seed/lexical` builders produce the exact JSON shape Lexical
          // persists (see its module doc), but their TS types stay loose since
          // they're meant for fixture generation — cast to the real
          // `SerializedEditorState` shape the PDF schema expects.
          root([
            paragraph([
              text(translate(locale, `language.name.${language}`), IS_BOLD),
              text(': '),
              text(translate(locale, `language.proficiency.${proficiency}`)),
            ]),
          ]) as unknown as SerializedEditorState,
      ),
    },
  }
}
