'use server'

import { get } from 'lodash-es'

import { FieldHook } from 'payload'

import { getSkillsCollectionData } from '@/lib/getSkillsCollectionData'
import {
  PDFBuilderSettings,
  SkillEntrySortable,
  SkillSorting,
  SkillTypeSortable,
} from '@/types/payload'

import { skillSortingKeys, skillTypeSortables } from '../shared'

export const sanitizeSkillSorting: FieldHook<
  PDFBuilderSettings,
  SkillSorting,
  PDFBuilderSettings
> = async ({ value }) => {
  const skills = await getSkillsCollectionData()

  const sortingConfig: SkillSorting = skillSortingKeys.reduce(
    (nextConfig, configKey: keyof SkillSorting) => {
      if (configKey === 'skillTypeSortable') {
        const prevEntries = get(value, configKey, [])
        nextConfig[configKey] = [
          ...prevEntries,
          ...skillTypeSortables,
        ].filter(
          (entry: SkillTypeSortable, index, array) =>
            array.findIndex((skillType) => skillType.id === entry.id) === index,
        )
      }

      if (configKey !== 'skillTypeSortable') {
        const prevEntries: SkillEntrySortable[] = get(value, configKey, [])
        nextConfig[configKey] = [
          ...prevEntries,
          ...skills
            .filter((skill) => skill.type === configKey)
            .map((skill) => ({
              id: skill.id,
              label: skill.name,
              caption: skill.caption,
            })),
        ].filter(
          (entry: SkillEntrySortable, index, array) =>
            array.findIndex((skillTypeEntry) => skillTypeEntry.id === entry.id) === index,
        )
      }
      return nextConfig
    },
    {} as SkillSorting,
  )

  return sortingConfig
}
