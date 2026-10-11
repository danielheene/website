import type { TaskHandler } from 'payload'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { get } from 'lodash-es'

import { skillSortingKeys, skillTypeSortables } from '@/globals/PDFGeneratorSettings/skillSorting'
import { fetchResumeSkills } from '@/lib/fetchers'
import { GlobalSlug } from '@/types/globals'
import { TaskSlug } from '@/types/jobs-queue'
import { SkillEntrySortable, SkillSorting, SkillTypeSortable } from '@/types/payload'

type ResumeSkill = Awaited<ReturnType<typeof fetchResumeSkills>>[number]

const mergeSkillTypes = (prevEntries: SkillTypeSortable[]): SkillTypeSortable[] =>
  [...prevEntries, ...skillTypeSortables].filter(
    (entry, index, array) => array.findIndex((skillType) => skillType.id === entry.id) === index,
  )

/**
 * Update labels for existing entries from current skills, then append new ones.
 * Also prunes entries whose skill no longer exists in the collection at all.
 */
const mergeSkillEntries = (
  prevEntries: SkillEntrySortable[],
  currentTypeSkills: ResumeSkill[],
  publishedSkillIds: Set<string>,
): SkillEntrySortable[] => {
  const currentTypeMap = new Map(
    currentTypeSkills.map(({ id, content }) => [
      String(id),
      convertLexicalToPlaintext({ data: content }).trim(),
    ]),
  )

  const seen = new Set<string>()
  const merged: SkillEntrySortable[] = []

  for (const entry of prevEntries) {
    const skillId = String(entry.id)
    if (seen.has(skillId)) continue
    if (!publishedSkillIds.has(skillId)) continue
    seen.add(skillId)
    merged.push({
      id: entry.id,
      label: currentTypeMap.get(skillId) ?? entry.label,
    })
  }

  for (const { id } of currentTypeSkills) {
    const skillId = String(id)
    if (seen.has(skillId)) continue
    seen.add(skillId)
    merged.push({
      id,
      label: currentTypeMap.get(skillId) ?? '',
    })
  }

  return merged
}

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
      acc[configKey] = mergeSkillTypes(get(previousSkillSorting, configKey, []))
      return acc
    }

    acc[configKey] = mergeSkillEntries(
      get(previousSkillSorting, configKey, []),
      skills.filter(({ type }) => type === configKey),
      publishedSkillIds,
    )

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

export const handler = run
