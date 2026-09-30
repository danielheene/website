'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

type Args = {
  collection: string
  mode: 'seed' | 'clean'
  count?: number
}

/**
 * Queues a `SeedCollection` job. The worker (`scripts/start-worker.mjs`)
 * runs it; the caller only needs the id to open the `seed-task:<jobId>` SSE
 * subscription and does not wait for seeding/cleaning to finish here.
 */
export const enqueueSeedCollection = async (
  args: Args,
): Promise<{
  jobId: string
}> => {
  const payload = await getPayload({
    config,
  })

  const job = await payload.jobs.queue({
    task: TaskSlug.SeedCollection,
    queue: QueueSlug.Default,
    input: {
      collection: args.collection,
      mode: args.mode,
      count: args.count,
    },
  })

  return {
    jobId: String(job.id),
  }
}
