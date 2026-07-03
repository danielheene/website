'use server'

import { FieldHook } from 'payload'

import { getSkillsCollectionData } from '@/lib/getSkillsCollectionData'
import { PDFBuilderSettings } from '@/types/payload'

import {
  SkillEntrySortable,
  SkillSorting,
  SkillTypeSortable,
  skillSortingKeys,
  skillTypeSortables,
} from '../shared'

export const sanitizeSkillTypeSortingValue: FieldHook<
  PDFBuilderSettings,
  SkillSorting,
  PDFBuilderSettings
> = async ({ value }) => {
  const skills = await getSkillsCollectionData()

  const sortingConfig: SkillSorting = skillSortingKeys.reduce((nextConfig, configKey) => {
    const prevEntries = Array.isArray(value[configKey]) ? value[configKey] : []

    if (configKey === 'SkillTypeSortable') {
      nextConfig[configKey] = [
        ...prevEntries,
        ...skillTypeSortables,
      ].filter(
        (entry: SkillTypeSortable, index, array) =>
          array.findIndex((skillType) => skillType.id === entry.id) === index,
      )
    }

    if (configKey !== 'SkillTypeSortable') {
      const prevEntries = Array.isArray(value[configKey]) ? value[configKey] : []
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
  }, {} as SkillSorting)

  return sortingConfig
}
