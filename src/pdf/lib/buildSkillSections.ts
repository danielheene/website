'use server'

import { fetchPDFGeneratorSettings, fetchResumeSkills } from '@/lib/fetchers'
import { type Locale, translate } from '@/lib/i18n'
import { DocumentSectionType, SkillSection } from '@/pdf/types'
import { SkillTypeSortable } from '@/types/payload'

export const buildSkillSections = async (locale: Locale): Promise<SkillSection[]> => {
  const skills = await fetchResumeSkills(locale)
  const { skillSorting } = await fetchPDFGeneratorSettings(locale)

  return skillSorting.skillTypeSortable.map((skillType: SkillTypeSortable) => ({
    type: DocumentSectionType.Skill,
    data: {
      headline: translate(locale, `skill.type.${skillType.id}`),
      entries: skills
        .filter(({ type }) => type === skillType.id)
        .sort(
          (a, b) =>
            skillSorting[skillType.id].findIndex((order) => order.id === a.id) -
            skillSorting[skillType.id].findIndex((order) => order.id === b.id),
        )
        .map(({ name, caption }) => ({
          name,
          caption,
        })),
    },
  }))
}
