import type { TaskHandler } from 'payload'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { get } from 'lodash-es'

import { skillSortingKeys, skillTypeSortables } from '@/globals/PDFGeneratorSettings/skillSorting'
import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { fetchResumeSkills } from '@/lib/fetchers'
import { GlobalSlug } from '@/types/globals'
import { TaskSlug } from '@/types/jobs-queue'
import { SkillEntrySortable, SkillSorting, SkillTypeSortable } from '@/types/payload'

const run: TaskHandler<TaskSlug['SyncSkillSorting']> = async ({ req: { payload } }) => {
  const [{ skillSorting: previousSkillSorting }, skills] = await Promise.all([
    payload.findGlobal({
      slug: GlobalSlug.PDFGeneratorSettings,
      draft: false,
    }),
    fetchResumeSkills(),
  ])

  const publishedSkillIds = new Set(skills.map(({ id }) => String(id)))

  const skillSorting = skillSortingKeys.reduce((acc, configKey: keyof SkillSorting) => {
    if (configKey === 'skillTypeSortable') {
      const prevEntries: SkillTypeSortable[] = get(previousSkillSorting, configKey, [])

      acc[configKey] = [...prevEntries, ...skillTypeSortables].filter(
        (entry: SkillTypeSortable, index, array) =>
          array.findIndex((skillType) => skillType.id === entry.id) === index,
      )

      return acc
    }

    const prevEntries: SkillEntrySortable[] = get(previousSkillSorting, configKey, [])

    // Update labels for existing entries from current skills, then append new ones.
    // Also prune entries whose skill no longer exists in the collection at all.
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

    acc[configKey] = merged

    return acc
  }, {} as SkillSorting)

  await payload.updateGlobal({
    slug: GlobalSlug.PDFGeneratorSettings,
    data: {
      skillSorting,
    },
  })

  return {
    output: {},
  }
}

export const handler = wrapHandler(TaskSlug.SyncSkillSorting, run)
