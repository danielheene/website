'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { type ScheduledJobActionProgress, scheduledJobChannel } from '@/lib/sse/channels'
import { CollectionSlug } from '@/types/collections'

export const runScheduledJobNow = async (jobId: string): Promise<void> => {
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
    await payload.jobs.runByID({
      id: jobId,
    })

    const progress: ScheduledJobActionProgress = {
      status: 'success',
    }
    await publish(channel, progress)
  } catch (error) {
    const message = extractErrorMessage(error)

    const progress: ScheduledJobActionProgress = {
      status: 'error',
      message,
    }
    await publish(channel, progress)

    payload.logger.error(`Failed running job ${jobId} now: ${message}`)
  }
}
