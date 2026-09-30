import type { TaskHandler } from 'payload'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['HeartbeatPing']> = async () => {
  console.log('Ping')
  return {
    output: {},
  }
}

export const handler = wrapHandler(TaskSlug.HeartbeatPing, run)
