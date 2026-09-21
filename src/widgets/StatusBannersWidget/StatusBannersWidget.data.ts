'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import { QueueSlug } from '@/types/jobs-queue'
import type { PayloadJob } from '@/types/payload'

/**
 * Returns all pending jobs whose `waitUntil` is in the past — i.e. they
 * should have been picked up by the queue worker but haven't been yet.
 * Heartbeat jobs are excluded (they're internal liveness signals).
 */
export const fetchStaleJobs = async (): Promise<PayloadJob[]> => {
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug.PayloadJobs,
    draft: false,
    where: {
      and: [
        {
          completedAt: {
            exists: false,
          },
        },
        {
          hasError: {
            not_equals: true,
          },
        },
        {
          processing: {
            not_equals: true,
          },
        },
        {
          queue: {
            not_equals: QueueSlug.Heartbeat,
          },
        },
        {
          waitUntil: {
            less_than: new Date().toISOString(),
          },
        },
      ],
    },
  })

  return docs.filter(
    ({ id, waitUntil, taskSlug, workflowSlug }) => id && waitUntil && (taskSlug ?? workflowSlug),
  )
}
