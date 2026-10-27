'use server'

import { type BilingualLanguage, translate } from '@website/lib/i18n'
import { SkillTypeSortable } from '@website/types/payload'

import { fetchPDFGeneratorSettings, fetchResumeSkills } from '@/lib/fetchers'
import { DocumentSectionType, SkillSection } from '@/pdf/types'

export const buildSkillSections = async (locale: BilingualLanguage): Promise<SkillSection[]> => {
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
        .map(({ content }) => ({
          content,
        })),
    },
  }))
}
