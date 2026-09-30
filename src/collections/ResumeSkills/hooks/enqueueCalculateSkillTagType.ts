import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { difference, get, union } from 'lodash-es'

import { isUnpublishedDraftSave } from '@/collections/shared/isUnpublishedDraftSave'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'
import type { ResumeSkillData } from '@/types/payload'

const queueForTags = async (req: PayloadRequest, skillTagIds: string[]) => {
  for (const skillTagId of skillTagIds) {
    await req.payload.jobs.queue({
      task: TaskSlug.CalculateSkillTagType,
      input: {
        skillTagId,
      },
      queue: QueueSlug.HookHandler,
    })
  }
}

/**
 * Re-resolves the type of every skill tag a skill change can affect (see
 * `calculateSkillTagType`).
 *
 * A changed skill type, publish state or trash state moves every tag the skill
 * had before or has now; otherwise only the tags added or removed need it.
 * Unpublished draft saves are skipped, as the task reads published skills only.
 */
export const enqueueCalculateSkillTagType: CollectionAfterChangeHook<ResumeSkillData> = async ({
  previousDoc,
  doc,
  req,
}) => {
  if (isUnpublishedDraftSave(doc, previousDoc)) return doc

  const everyTagAffected =
    previousDoc?.type !== doc.type ||
    previousDoc?._status !== doc._status ||
    Boolean(previousDoc?.deletedAt) !== Boolean(doc.deletedAt)

  const prevTags = get(previousDoc, 'skillTags', []).map(({ value }) => String(value))
  const nextTags = get(doc, 'skillTags', []).map(({ value }) => String(value))

  const changedTags = everyTagAffected
    ? union(prevTags, nextTags)
    : union(difference(prevTags, nextTags), difference(nextTags, prevTags))

  await queueForTags(req, changedTags)

  return doc
}

/**
 * A permanent delete (e.g. emptying the trash) never reaches `afterChange`, so
 * the tags the deleted skill carried are re-resolved from here.
 */
export const enqueueCalculateSkillTagTypeAfterDelete: CollectionAfterDeleteHook<
  ResumeSkillData
> = async ({ doc, req }) => {
  await queueForTags(
    req,
    get(doc, 'skillTags', []).map(({ value }) => String(value)),
  )

  return doc
}
