import type { TaskHandler } from 'payload'

import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['HeartbeatPing']> = async () => {
  // CI's worker smoke test (`.github/workflows/ci.yml`) greps the worker's
  // stdout for this line to confirm the job runner actually executed a task.
  console.log('Ping')

  return {
    output: {},
  }
}

export const handler = run
