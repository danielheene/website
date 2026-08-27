'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { type ScheduledJobActionProgress, scheduledJobChannel } from '@/lib/sse/channels'
import { CollectionSlug } from '@/types/collections'

/**
 * Cancels a still-pending `PayloadJob` from the scheduled-jobs widget's ✕
 * button. Mirrors `runScheduledJobNow`'s guard: a job that's already
 * processing, completed, or errored is left alone rather than cancelled out
 * from under it. Publishes to the same `scheduledJobChannel` as
 * `runScheduledJobNow` so the widget can show the outcome either way.
 */
export const cancelScheduledJob = async (jobId: string): Promise<void> => {
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

  const channel = scheduledJobChannel(jobId)

  try {
    await payload.jobs.cancelByID({
      id: jobId,
    })

    const progress: ScheduledJobActionProgress = {
      status: 'cancelled',
    }
    await publish(channel, progress)
  } catch (error) {
    const message = extractErrorMessage(error)

    const progress: ScheduledJobActionProgress = {
      status: 'error',
      message,
    }
    await publish(channel, progress)

    payload.logger.error(`Failed cancelling job ${jobId}: ${message}`)
  }
}
