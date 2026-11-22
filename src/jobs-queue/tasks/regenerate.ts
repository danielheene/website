import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { DOCUMENT_TASKS } from '@/lib/documentTasks/definitions'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Queues one document task for every document of a collection, with the steps forwarded:
 * started from the collection's list menu, or `bun run regenerate` on the CLI. One run per task
 * and collection at a time.
 */
export const regenerate: TaskConfig<TaskSlug['Regenerate']> = {
  slug: TaskSlug.Regenerate,
  label: 'Regenerate Collection',
  retries: 1,
  concurrency: {
    key: ({ input }) => `regenerate:${input.task}:${input.collection}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'task',
      type: 'select',
      required: true,
      options: [...DOCUMENT_TASKS],
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
    },
    {
      name: 'steps',
      type: 'text',
      hasMany: true,
    },
  ],
  outputSchema: [
    {
      name: 'queued',
      type: 'number',
    },
  ],
  handler: handlerPath('regenerate.ts'),
}
