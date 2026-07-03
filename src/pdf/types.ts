import { ExpandedBookmark } from '@react-pdf/types'
import { Merge } from 'type-fest'

import { IntroductionSectionData } from '@pdf/lib/buildIntroductionSection'
import { SkillSectionData } from '@pdf/lib/buildSkillSections'
import { WorkExperienceSectionData } from '@pdf/lib/buildWorkExperienceSection'

export enum DocumentSectionType {
  Introduction = 'introductionSection',
  WorkExperience = 'workExperienceSection',
  Skill = 'skillSection',
}

export type DocumentSection =
  | {
      type: `${DocumentSectionType.Introduction}`
      data: IntroductionSectionData
    }
  | {
      type: `${DocumentSectionType.WorkExperience}`
      data: WorkExperienceSectionData
    }
  | {
      type: `${DocumentSectionType.Skill}`
      data: SkillSectionData
    }

export type DocumentData = DocumentSection[]

export type Bookmark =
  | string
  | Merge<
      ExpandedBookmark,
      {
        parent?: number
      }
    >
