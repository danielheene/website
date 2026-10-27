import type { TaskConfig } from 'payload'

import { QueueSlug, TaskSlug } from '@website/types/jobs-queue'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'

export const heartbeatPing: TaskConfig<TaskSlug['HeartbeatPing']> = {
  slug: TaskSlug.HeartbeatPing,
  label: 'Heartbeat Ping',
  schedule: [
    {
      cron: '* * * * *',
      queue: QueueSlug.Heartbeat,
    },
  ],
  handler: handlerPath('heartbeatPing.ts'),
}
