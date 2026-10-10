import type { TaskHandler } from 'payload'

import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['HeartbeatPing']> = async () => {
  return {
    output: {},
  }
}

export const handler = run
