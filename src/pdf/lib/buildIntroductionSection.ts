import { z } from 'zod'

import { DocumentSectionType } from '@pdf/types'

const introductionSectionDataSchema = z.object({
  headline: z.string(),
  content: z.string(),
})

export type IntroductionSectionData = z.infer<typeof introductionSectionDataSchema>

export type IntroductionSection = {
  type: DocumentSectionType.Introduction
  data: IntroductionSectionData
}

interface BuildIntroductionSectionArgs {
  name: string
  jobTitle: string
  description: string
}

export const buildIntroductionSection = ({
  name,
  jobTitle,
  description,
}: BuildIntroductionSectionArgs): IntroductionSection => ({
  type: DocumentSectionType.Introduction,
  data: introductionSectionDataSchema.parse({
    headline: `${name}, ${jobTitle}`,
    content: description,
  }),
})
