import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

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
