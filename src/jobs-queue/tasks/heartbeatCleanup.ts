import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
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
  handler: handlerPath('heartbeatCleanup.ts'),
}
