import { CollectionAfterChangeHook } from 'payload'

import { difference, get, union } from 'lodash-es'

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
      queue: QueueSlug.Default,
    })
  }
}
