'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { SEEDABLE_COLLECTIONS, type SeedableCollection } from '@/lib/seed/seedableCollection'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

const SEED_MODES = ['seed', 'clean'] as const

const isSeedableCollection = (value: string): value is SeedableCollection =>
  (SEEDABLE_COLLECTIONS as readonly string[]).includes(value)

const isSeedMode = (value: string): value is (typeof SEED_MODES)[number] =>
  (SEED_MODES as readonly string[]).includes(value)

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
  if (!isSeedableCollection(args.collection)) {
    throw new Error(`Unknown seedable collection: "${args.collection}"`)
  }
  if (!isSeedMode(args.mode)) {
    throw new Error(`Unknown seed mode: "${args.mode}"`)
  }

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
