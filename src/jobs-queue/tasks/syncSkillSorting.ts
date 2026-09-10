import config from '@payload-config'
import { getPayload, TaskConfig } from 'payload'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { get } from 'lodash-es'

import { skillSortingKeys, skillTypeSortables } from '@/globals/PDFGeneratorSettings'
import { fetchResumeSkills } from '@/lib/fetchers'
import { GlobalSlug } from '@/types/globals'
import { TaskSlug } from '@/types/jobs-queue'
import { SkillEntrySortable, SkillSorting, SkillTypeSortable } from '@/types/payload'

/**
 * Reconciles the PDF Builder's persisted skill sorting order against the current
 * Resume Skills collection, merging in any skill (or skill type) that has no
 * saved position yet, and writes the result back to the {@link GlobalSlug.PDFGeneratorSettings}
 * global.
 *
 * This used to run as an `afterRead` hook on the `skillSorting` field, which
 * meant every admin panel load recomputed and returned a merged value that
 * usually differed from what was actually persisted — Payload's admin form
 * then saw a "modified" document on a bare read, permanently enabling the
 * Save button. Doing the reconciliation here instead, triggered only when
 * skills actually change (see `enqueueSyncSkillSorting`), keeps the field's
 * persisted value and its as-read value identical, so opening the settings
 * view no longer dirties the form.
 */
export const syncSkillSorting: TaskConfig<TaskSlug['SyncSkillSorting']> = {
  slug: TaskSlug.SyncSkillSorting,
  label: 'Sync Skill Sorting',
  retries: 2,
  // A burst of skill edits (bulk create, rapid saves) would otherwise queue
  // one job per change; `supersedes` collapses them into whichever job runs
  // last, since only the end state matters for reconciliation.
  concurrency: {
    key: () => TaskSlug.SyncSkillSorting,
    supersedes: true,
  },
  handler: async () => {
    'use server'

    const payload = await getPayload({
      config,
    })

    const [{ skillSorting: previousSkillSorting }, skills] = await Promise.all([
      payload.findGlobal({
        slug: GlobalSlug.PDFGeneratorSettings,
        draft: false,
      }),
      fetchResumeSkills(),
    ])

    const skillSorting = skillSortingKeys.reduce((acc, configKey: keyof SkillSorting) => {
      if (configKey === 'skillTypeSortable') {
        const prevEntries: SkillTypeSortable[] = get(previousSkillSorting, configKey, [])

        acc[configKey] = [
          ...prevEntries,
          ...skillTypeSortables,
        ].filter(
          (entry: SkillTypeSortable, index, array) =>
            array.findIndex((skillType) => skillType.id === entry.id) === index,
        )

        return acc
      }

      const prevEntries: SkillEntrySortable[] = get(previousSkillSorting, configKey, [])

      acc[configKey] = [
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
  },
}
