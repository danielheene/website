import type { TaskHandler } from 'payload'

import { subDays } from 'date-fns'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['HeartbeatCleanup']> = async ({ req: { payload } }) => {
  console.log('Ping')

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
            less_than: subDays(new Date(), 7).toISOString(),
          },
        },
      ],
    },
  })

  return {
    output: {},
  }
}

export const handler = wrapHandler(TaskSlug.HeartbeatCleanup, run)
