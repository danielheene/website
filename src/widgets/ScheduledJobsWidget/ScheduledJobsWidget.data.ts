'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import { QueueSlug, WorkflowSlug } from '@/types/jobs-queue'
import { PayloadJob } from '@/types/payload'

/**
 * Finds every `PayloadJob` that hasn't finished yet — i.e. it's still
 * scheduled (`waitUntil` in the future or already due) or actively
 * processing, and hasn't completed or errored.
 *
 * `GenerateResumeDocument` jobs are surfaced first since they're the most
 * common thing an admin checks in on; the rest sort soonest-due first.
 *
 * `HeartbeatQueue` jobs are excluded — they're an internal liveness signal,
 * not work an admin needs to review.
 */
export const fetchScheduledJobs = async (): Promise<PayloadJob[] | null> => {
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug.PayloadJobs,
    draft: false,
    sort: '-createdAt',
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
          queue: {
            not_equals: QueueSlug.Heartbeat,
          },
        },
      ],
    },
  })

  return docs
    .filter(({ id, waitUntil, createdAt }) => id && waitUntil && createdAt)
    .sort((a, b) => {
      if (a.workflowSlug === WorkflowSlug.GenerateResumeDocument) return -1
      return new Date(b.waitUntil).getTime() - new Date(a.waitUntil).getTime()
    })
}
