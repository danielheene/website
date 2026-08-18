'use server'

import { FieldHook } from 'payload'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { get } from 'lodash-es'

import { fetchResumeSkills } from '@/lib/fetchers'
import {
  PDFGeneratorSettings,
  SkillEntrySortable,
  SkillSorting,
  SkillTypeSortable,
} from '@/types/payload'

import { skillSortingKeys, skillTypeSortables } from '../index'

/**
 * Sanitizes and synchronizes skill sorting configuration by merging saved entries with current skills.
 * Processes skill type sorting and individual skill entries, removing duplicates by ID.
 */
export const sanitizeSkillSorting: FieldHook<
  PDFGeneratorSettings,
  SkillSorting,
  PDFGeneratorSettings
> = async ({ value }): Promise<SkillSorting> => {
  const skills = await fetchResumeSkills()

  return skillSortingKeys.reduce((skillSorting, configKey: keyof SkillSorting) => {
    if (configKey === 'skillTypeSortable') {
      const prevEntries: SkillTypeSortable[] = get(value, configKey, [])
      /**
       * Merges previously saved skill type entries with predefined sortable types to maintain the
       * rendering order of skill type-based sections. Duplicates are removed based on unique IDs,
       * with the first occurrence being retained.
       */
      skillSorting[configKey] = [
        ...prevEntries,
        ...skillTypeSortables,
      ].filter(
        (entry: SkillTypeSortable, index, array) =>
          array.findIndex((skillType) => skillType.id === entry.id) === index,
      )
    }

    if (configKey !== 'skillTypeSortable') {
      const prevEntries: SkillEntrySortable[] = get(value, configKey, [])
      /**
       * Merges previously saved skill entries with current skills from the collection, filtered by
       * skill type. This maintains the rendering order of individual skills within a skill type-based
       * section. Duplicates are removed based on unique IDs, with the first occurrence being retained.
       */
      skillSorting[configKey] = [
        ...prevEntries,
        ...skills
          .filter(({ type }) => type === configKey)
          .map(({ id, content }) => ({
            id,
            label: convertLexicalToPlaintext({
              data: content,
            }).trim(),
          })),
      ].filter(
        (entry: SkillEntrySortable, index, array) =>
          array.findIndex(({ id }) => id === entry.id) === index,
      )
    }
    return skillSorting
  }, {} as SkillSorting)
}
