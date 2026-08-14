'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import { WorkflowSlug } from '@/types/jobs-queue'

export type PendingResumeGenerationJob = {
  id: string
  createdAt: string
  waitUntil: string
}

/**
 * Finds the most recently created `GenerateResumeDocument` job that hasn't
 * finished yet — i.e. it's still scheduled (`waitUntil` in the future or
 * already due) or actively processing, and hasn't completed or errored.
 *
 * Mirrors the "is a job still pending" conditions in
 * `calculateEarliestPossibleScheduleTime` (enqueueGenerateResumeDocument.ts),
 * simplified to what the widget needs: nothing to show once a job is done.
 */
export const fetchPendingResumeGenerationJob =
  async (): Promise<PendingResumeGenerationJob | null> => {
    const payload = await getPayload({
      config,
    })

    const {
      docs: [job],
    } = await payload.find({
      collection: CollectionSlug.PayloadJobs,
      draft: false,
      sort: '-createdAt',
      limit: 1,
      where: {
        and: [
          {
            workflowSlug: {
              equals: WorkflowSlug.GenerateResumeDocument,
            },
          },
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
        ],
      },
    })

    if (!job?.id || !job?.waitUntil || !job?.createdAt) {
      return null
    }

    return {
      id: String(job.id),
      createdAt: job.createdAt,
      waitUntil: job.waitUntil,
    }
  }
