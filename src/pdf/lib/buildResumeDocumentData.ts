'use server'

import { renderToBuffer } from '@react-pdf/renderer'

import { ZodSafeParseError, ZodSafeParseResult, z } from 'zod'
import { ZodParsedType } from 'zod/v3'

import { ResumeDocument } from '@pdf/index'
import { buildDocumentFooter } from '@pdf/lib/buildDocumentFooter'
import { buildDocumentHeader } from '@pdf/lib/buildDocumentHeader'
import { buildIntroductionSection } from '@pdf/lib/buildIntroductionSection'
import { buildLanguageSection } from '@pdf/lib/buildLanguageSection'
import { buildSkillSections } from '@pdf/lib/buildSkillSections'
import { buildWorkExperienceSection } from '@pdf/lib/buildWorkExperienceSection'
import { documentSchema } from '@pdf/schemas'
import { DocumentData } from '@pdf/types'
import { getUserConfigurationData } from '@/lib/getUserConfigurationData'
import { type Locale, translate } from '@/lib/i18n'

interface GenerateResumeDocumentArgs {
  locale: Locale
  fileName: string
  fileUrl: string
  creationDate: Date
}

export const buildResumeDocumentData = async (
  args: GenerateResumeDocumentArgs,
): Promise<ZodSafeParseResult<DocumentData>> => {
  const { fileName, fileUrl, creationDate } = args
  const locale: Locale = args?.locale === 'de' ? 'de' : 'en'
  const language = locale === 'en' ? 'en_EN' : 'de_DE'

  const { name } = await getUserConfigurationData(locale)

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
