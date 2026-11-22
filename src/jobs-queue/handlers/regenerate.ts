import type { TaskHandler } from 'payload'

import { enqueueCollectionTasks } from '@/lib/documentTasks/enqueueCollectionTasks'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['Regenerate']> = async ({ input, req: { payload } }) => ({
  output: {
    queued: await enqueueCollectionTasks({
      payload,
      task: input.task,
      collection: input.collection,
      steps: input.steps ?? [],
    }),
  },
})

export const handler = run
