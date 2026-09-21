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
 * Prunes entries whose skill was deleted from the collection, updates labels for renamed skills,
 * and appends any new published skills that have no saved position yet.
 */
export const sanitizeSkillSorting: FieldHook<
  PDFGeneratorSettings,
  SkillSorting,
  PDFGeneratorSettings
> = async ({ value }): Promise<SkillSorting> => {
  const skills = await fetchResumeSkills()

  const publishedSkillIds = new Set(skills.map(({ id }) => String(id)))

  return skillSortingKeys.reduce((skillSorting, configKey: keyof SkillSorting) => {
    if (configKey === 'skillTypeSortable') {
      const prevEntries: SkillTypeSortable[] = get(value, configKey, [])

      skillSorting[configKey] = [
        ...prevEntries,
        ...skillTypeSortables,
      ].filter(
        (entry: SkillTypeSortable, index, array) =>
          array.findIndex((skillType) => skillType.id === entry.id) === index,
      )

      return skillSorting
    }

    const prevEntries: SkillEntrySortable[] = get(value, configKey, [])
    const currentTypeSkills = skills.filter(({ type }) => type === configKey)
    const currentTypeMap = new Map(
      currentTypeSkills.map(({ id, content }) => [
        String(id),
        convertLexicalToPlaintext({
          data: content,
        }).trim(),
      ]),
    )

    const seen = new Set<string>()
    const merged: SkillEntrySortable[] = []

    for (const entry of prevEntries) {
      const strId = String(entry.id)
      if (seen.has(strId)) continue
      if (!publishedSkillIds.has(strId)) continue
      seen.add(strId)
      merged.push({
        id: entry.id,
        label: currentTypeMap.get(strId) ?? entry.label,
      })
    }

    for (const { id, content } of currentTypeSkills) {
      const strId = String(id)
      if (seen.has(strId)) continue
      seen.add(strId)
      merged.push({
        id,
        label: convertLexicalToPlaintext({
          data: content,
        }).trim(),
      })
    }

    skillSorting[configKey] = merged

    return skillSorting
  }, {} as SkillSorting)
}
