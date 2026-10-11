import type { TaskHandler } from 'payload'

import { subDays } from 'date-fns'

import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const HEARTBEAT_RETENTION_DAYS = 7

const run: TaskHandler<TaskSlug['HeartbeatCleanup']> = async ({ req: { payload } }) => {
  await payload.db.deleteMany({
    collection: CollectionSlug.PayloadJobs,
    where: {
      and: [
        {
          taskSlug: {
            equals: TaskSlug.HeartbeatPing,
          },
        },
        {
          updatedAt: {
            less_than: subDays(new Date(), HEARTBEAT_RETENTION_DAYS).toISOString(),
          },
        },
      ],
    },
  })

  return {
    output: {},
  }
}

export const handler = run
