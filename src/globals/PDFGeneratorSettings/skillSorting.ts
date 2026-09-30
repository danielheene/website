import { translate } from '@/lib/i18n'
import type { SkillSorting, SkillType, SkillTypeSortable } from '@/types/payload'
import { SKILL_TYPE } from '@/types/select-options'

export const skillSortingKeys: (keyof SkillSorting & string)[] = [
  'skillTypeSortable',
  ...(Object.values(SKILL_TYPE) as SkillType[]),
]

export const skillTypeSortables = Object.values(SKILL_TYPE).map((skillType) => ({
  id: skillType,
  label: translate('en', `skill.type.${skillType}`),
})) as SkillTypeSortable[]
