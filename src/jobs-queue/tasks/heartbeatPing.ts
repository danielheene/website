import { TaskConfig } from 'payload'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

export const heartbeatPing: TaskConfig<TaskSlug['HeartbeatPing']> = {
  slug: TaskSlug.HeartbeatPing,
  label: 'Heartbeat ping',
  schedule: [
    {
      cron: '* * * * *',
      queue: QueueSlug.Heartbeat,
    },
  ],
  handler: async () => {
    console.log('Ping')
    return {
      output: {},
    }
  },
}
