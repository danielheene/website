import { z } from 'zod'

import { DocumentSectionType } from '@pdf/types'
import { type Locale, translate } from '@/lib/i18n'
import type { CollectionData, CollectionSlug } from '@/types/collections'
import type { SkillType } from '@/types/payload'

const skillSectionDataSchema = z.object({
  headline: z.string(),
  entries: z.array(
    z.object({
      name: z.string(),
      caption: z.string().optional(),
    }),
  ),
})

export type SkillSectionData = z.infer<typeof skillSectionDataSchema>

export type SkillSection = {
  type: DocumentSectionType.Skill
  data: SkillSectionData
}

interface BuildSkillSectionsArgs {
  locale: Locale
  skills: CollectionData<CollectionSlug.ResumeSkills>[]
  skillTypeOrder: SkillType[]
}

export const buildSkillSections = ({
  locale,
  skills,
  skillTypeOrder,
}: BuildSkillSectionsArgs): SkillSection[] =>
  skillTypeOrder.map((skillType) => ({
    type: DocumentSectionType.Skill,
    data: skillSectionDataSchema.parse({
      headline: translate(locale, `skill.type.${skillType}`),
      entries: skills
        .filter(({ type }) => type === skillType)
        .map(({ name, caption }) => ({
          name,
          caption,
        })),
    }),
  }))
