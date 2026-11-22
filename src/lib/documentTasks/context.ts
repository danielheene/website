import type { RequestContext } from 'payload'

import type { DocumentTask } from './definitions'

/** Marks a document task's own write, so the hook that queues that task skips it. */
export const taskWriteContext = (task: DocumentTask): RequestContext => ({
  triggeredByTask: task,
})

export const isTriggeredByTask = (context: RequestContext | undefined, task: DocumentTask) =>
  context?.triggeredByTask === task
