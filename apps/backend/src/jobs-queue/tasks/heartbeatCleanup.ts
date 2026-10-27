import type { TaskConfig } from 'payload'

import { QueueSlug, TaskSlug } from '@website/types/jobs-queue'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'

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
