'use server'

import { after } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

type Args = {
  collection: string
  mode: 'seed' | 'clean'
  count?: number
}

/**
 * Queues a `SeedCollection` job and immediately triggers it to run, rather
 * than waiting for the next `autoRun` poll on `QueueSlug.Default`.
 *
 * The run is kicked off via `after()` so it keeps executing once this
 * action's response has already gone back to the client with the job id —
 * the caller only needs the id to open the `seed-task:<jobId>` SSE
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

  after(async () => {
    try {
      await payload.jobs.runByID({
        id: job.id,
      })
    } catch (error) {
      payload.logger.error(`Failed running job ${job.id}: ${extractErrorMessage(error)}`)
    }
  })

  return {
    jobId: String(job.id),
  }
}
