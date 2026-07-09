import { Merge } from 'type-fest'

import { translate } from '@/lib/i18n'
import { SkillType, SkillTypeSortable } from '@/types/payload'
import { SKILL_TYPE } from '@/types/select-options'
//
// export type SkillTypeSortable = {
//   id: SkillType
//   label: string
// }
//
// export type SkillEntrySortable = {
//   id: string
//   label: string
//   caption?: string
// }
// //
// export type SkillSorting = Merge<
//   Record<'skillTypeSortable', SkillTypeSortable[]>,
//   Record<SkillType, SkillEntrySortable[]>
// >

export const skillSortingKeys = [
  'skillTypeSortable',
  ...(Object.values(SKILL_TYPE) as SkillType[]),
]

export const skillTypeSortables = Object.values(SKILL_TYPE).map((skillType) => ({
  id: skillType,
  label: translate('en', `skill.type.${skillType}`),
})) as SkillTypeSortable[]
