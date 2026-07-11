import { ExpandedBookmark } from '@react-pdf/types'
import { Merge } from 'type-fest'
import { z } from 'zod'

import {
  documentFooterSchema,
  documentHeaderSchema,
  documentSchema,
  documentSectionSchema,
  introductionSectionSchema,
  languageSectionSchema,
  skillSectionSchema,
  workExperienceSectionSchema,
} from '@pdf/schemas'

export const DocumentSectionType = {
  Introduction: 'introductionSection',
  WorkExperience: 'workExperienceSection',
  Skill: 'skillSection',
  Language: 'languageSection',
} as const

export type DocumentSectionType = {
  [key in keyof typeof DocumentSectionType]: (typeof DocumentSectionType)[key]
}

export type Bookmark =
  | string
  | Merge<
      ExpandedBookmark,
      {
        parent?: number
      }
    >

export type DocumentFooter = z.infer<typeof documentFooterSchema>
export type DocumentHeader = z.infer<typeof documentHeaderSchema>
export type IntroductionSection = z.infer<typeof introductionSectionSchema>
export type LanguageSection = z.infer<typeof languageSectionSchema>
export type SkillSection = z.infer<typeof skillSectionSchema>
export type WorkExperienceSection = z.infer<typeof workExperienceSectionSchema>

export type DocumentSection = z.infer<typeof documentSectionSchema>
export type DocumentData = z.infer<typeof documentSchema>
