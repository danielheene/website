'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { CollectionSlug } from '@/types/collections'

/**
 * Reschedules a stale job by updating its `waitUntil` to now, making it
 * immediately eligible for the next queue poll. Only acts on jobs that are
 * still pending (not processing, not completed, not errored).
 */
export const rescheduleJob = async (
  jobId: string,
): Promise<{
  ok: boolean
  error?: string
}> => {
  const payload = await getPayload({
    config,
  })

  const job = await payload.findByID({
    collection: CollectionSlug.PayloadJobs,
    id: jobId,
    draft: false,
  })

  if (!job || job.processing || job.completedAt || job.hasError) {
    return {
      ok: false,
      error: 'Job is no longer pending',
    }
  }

  try {
    await payload.update({
      collection: CollectionSlug.PayloadJobs,
      id: jobId,
      data: {
        waitUntil: new Date().toISOString(),
      },
    })

    return {
      ok: true,
    }
  } catch (error) {
    const message = extractErrorMessage(error)
    payload.logger.error(`Failed rescheduling job ${jobId}: ${message}`)
    return {
      ok: false,
      error: message,
    }
  }
}
