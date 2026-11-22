import type { ConcurrencyConfig, Field } from 'payload'

import {
  DOCUMENT_TASK_DEFINITIONS,
  type DocumentTask,
  documentTaskKey,
} from '@/lib/documentTasks/definitions'

/** What every document task receives: just enough to find the document and pick the work. */
export type DocumentTaskInput = {
  collection: string
  id: string
  /** Slug, filename or id; only used for the concurrency key. */
  ref?: string | null
  steps?: string[] | null
}

/** `collection`, `id`, `ref`, and `steps` when the task has any. */
export const documentTaskInputSchema = (task: DocumentTask): Field[] => {
  const { steps } = DOCUMENT_TASK_DEFINITIONS[task]

  return [
    {
      name: 'collection',
      type: 'text',
      required: true,
    },
    {
      name: 'id',
      type: 'text',
      required: true,
    },
    {
      name: 'ref',
      type: 'text',
    },
    ...(steps.length > 0
      ? [
          {
            name: 'steps',
            type: 'select',
            hasMany: true,
            options: steps.map(({ name, label }) => ({
              label,
              value: name,
            })),
          } satisfies Field,
        ]
      : []),
  ]
}

/**
 * One job per document at a time: a newer one replaces a queued one (whose steps
 * `enqueueDocumentTask` merged into it), and none starts while another runs.
 */
export const documentTaskConcurrency = (
  task: DocumentTask,
): ConcurrencyConfig<DocumentTaskInput> => ({
  key: ({ input }) => documentTaskKey(task, input),
  exclusive: true,
  supersedes: true,
})
