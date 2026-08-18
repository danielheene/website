'use server'

import { ZodSafeParseResult } from 'zod'

import { fetchGlobalUserSettings } from '@/lib/fetchers'
import { type BilingualLanguage, translate } from '@/lib/i18n'
import { buildDocumentFooter } from '@/pdf/lib/buildDocumentFooter'
import { buildDocumentHeader } from '@/pdf/lib/buildDocumentHeader'
import { buildIntroductionSection } from '@/pdf/lib/buildIntroductionSection'
import { buildLanguageSection } from '@/pdf/lib/buildLanguageSection'
import { buildSkillSections } from '@/pdf/lib/buildSkillSections'
import { buildWorkExperienceSection } from '@/pdf/lib/buildWorkExperienceSection'
import { documentSchema } from '@/pdf/schemas'
import { DocumentData } from '@/pdf/types'

interface GenerateResumeDocumentArgs {
  locale: BilingualLanguage
  fileName: string
  fileUrl: string
  creationDate: Date
}

export const buildResumeDocumentData = async (
  args: GenerateResumeDocumentArgs,
): Promise<ZodSafeParseResult<DocumentData>> => {
  const { fileName, fileUrl, creationDate } = args
  const locale: BilingualLanguage = args?.locale === 'de' ? 'de' : 'en'
  const language = locale === 'en' ? 'en_EN' : 'de_DE'

  const { name } = await fetchGlobalUserSettings(locale)

  return documentSchema.safeParse({
    isPreview: false,
    locale: locale,
    document: {
      author: name,
      title: translate(locale, 'document.title', {
        name,
      }),
      creationDate,
      language,
    },

    header: await buildDocumentHeader(locale),
    footer: await buildDocumentFooter({
      locale,
      fileName,
      fileUrl,
    }),
    sections: [
      await buildIntroductionSection(locale),
      await buildWorkExperienceSection(locale),
      await buildSkillSections(locale),
      await buildLanguageSection(locale),
    ].flat(),
  })
}
