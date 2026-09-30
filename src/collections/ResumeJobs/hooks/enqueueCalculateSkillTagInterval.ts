import { CollectionAfterChangeHook } from 'payload'

import { difference, get, union } from 'lodash-es'

import { isUnpublishedDraftSave } from '@/collections/shared/isUnpublishedDraftSave'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'
import { ResumeJobData } from '@/types/payload'

/**
 * Collection hook that triggers skill tag interval recalculation after resume job data changes.
 *
 * This hook executes after a ResumeJobData document is modified and determines which skill tags
 * need their intervals recalculated based on the nature of the changes. It enqueues background
 * jobs to update the skill tag intervals accordingly.
 *
 * When job dates (startDate or endDate) are modified, all skill tags from both the previous
 * and current document states are marked for recalculation, as date changes affect the entire
 * timeline of all associated tags.
 *
 * When only the skill tags themselves change (additions or removals) without date modifications,
 * only the tags that differ between states are marked for recalculation, optimizing processing
 * by avoiding unnecessary updates to unchanged tags.
 *
 * For each affected tag, a CalculateSkillTagInterval task is queued to asynchronously update
 * the skill tag's interval data.
 *
 * @type {CollectionAfterChangeHook<ResumeJobData>}
 */
export const enqueueCalculateSkillTagInterval: CollectionAfterChangeHook<ResumeJobData> = async ({
  previousDoc,
  doc,
  req,
}) => {
  /**
   * Jobs are drafts-enabled, so an admin `Save` usually persists an
   * unpublished draft. Every consumer reads published data only, so the
   * interval would be recomputed from exactly the same input — skip it.
   *
   * The same draft save would also enqueue a full resume-PDF regeneration
   * through `generateResumeDocumentHook`, which runs as an `afterOperation`
   * hook on the same request and already honors this context flag.
   *
   * `req.context` is shared across every document in a bulk update, and
   * `afterOperation` only runs once the whole operation finishes — so the
   * flag must only end up `true` if every document touched by this request
   * was an unpublished draft save. A real change always forces it back to
   * `false`, and a later draft save never re-sets a flag a real change
   * already cleared.
   */
  if (isUnpublishedDraftSave(doc, previousDoc)) {
    if (req.context && req.context.skipGenerateResumeDocumentHook !== false) {
      req.context.skipGenerateResumeDocumentHook = true
    }
    return doc
  }

  if (req.context) req.context.skipGenerateResumeDocumentHook = false

  const jobDatesChanged =
    previousDoc?.startDate !== doc.startDate || previousDoc?.endDate !== doc.endDate

  const prevTags = get(previousDoc, 'skillTags', []).map(({ value }) => value as string)
  const nextTags = get(doc, 'skillTags', []).map(({ value }) => value as string)

  /**
   * When job dates have changed, includes all tags from both states (union of previous and next tags).
   * When job dates have not changed, includes only tags that differ between states (symmetric difference).
   * This represents tags that need to be updated or reconciled based on the change scenario.
   */
  const changedTags = jobDatesChanged
    ? union(prevTags, nextTags)
    : union(difference(prevTags, nextTags), difference(nextTags, prevTags))

  for (const changedTag of changedTags) {
    await req.payload.jobs.queue({
      task: TaskSlug.CalculateSkillTagInterval,
      input: {
        skillTagId: changedTag,
      },
      queue: QueueSlug.HookHandler,
    })
  }
}
