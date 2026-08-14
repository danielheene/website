'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { CollectionSlug } from '@/types/collections'

/**
 * Runs an already-queued `GenerateResumeDocument` job immediately, skipping
 * its remaining `waitUntil` delay — the "Run now" action on
 * `ScheduledResumeGenerationWidget`.
 *
 * Re-checks the job's state first: another actor (a second click, the
 * `resume-generation` cron poll, an already-superseded job) may have started
 * or finished it since the widget last rendered, in which case this is a
 * no-op rather than an error.
 */
export const runResumeGenerationJobNow = async (jobId: string): Promise<void> => {
  const payload = await getPayload({
    config,
  })

  const job = await payload.findByID({
    collection: CollectionSlug.PayloadJobs,
    id: jobId,
    draft: false,
  })

  if (!job || job.processing || job.completedAt || job.hasError) {
    return
  }

  try {
    await payload.jobs.runByID({
      id: jobId,
    })
  } catch (error) {
    payload.logger.error(`Failed running job ${jobId} now: ${extractErrorMessage(error)}`)
  }
}
