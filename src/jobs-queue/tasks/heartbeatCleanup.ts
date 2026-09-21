import { TaskConfig } from 'payload'

import { subDays } from 'date-fns'

import { CollectionSlug } from '@/types/collections'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

export const heartbeatCleanup: TaskConfig<TaskSlug['HeartbeatCleanup']> = {
  slug: TaskSlug.HeartbeatCleanup,
  label: 'Heartbeat Cleanup',
  schedule: [
    {
      cron: '0 4 * * *',
      queue: QueueSlug.Heartbeat,
    },
  ],
  handler: async ({ req: { payload } }) => {
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
  },
}
