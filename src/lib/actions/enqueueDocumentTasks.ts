'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { requireSession } from '@/lib/actions/requireSession'
import {
  type DocumentTask,
  documentTaskAppliesTo,
  isDocumentTask,
} from '@/lib/documentTasks/definitions'
import { enqueueDocumentTaskById } from '@/lib/documentTasks/enqueueDocumentTask'
import { isReferenceTracked } from '@/plugins/references/excludedCollections'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

type TaskArgs = {
  task: string
  collection: string
  steps: string[]
}

const checkTask = (task: string, collection: string): DocumentTask => {
  if (!isDocumentTask(task) || !documentTaskAppliesTo(task, collection, isReferenceTracked)) {
    throw new Error(`"${task}" does not apply to "${collection}"`)
  }

  return task
}

/** Queues a document task for one document (the edit view's menu). */
export const enqueueDocumentTaskAction = async ({
  id,
  ...args
}: TaskArgs & {
  id: string
}): Promise<{
  jobId: string
}> => {
  await requireSession()

  const task = checkTask(args.task, args.collection)
  const payload = await getPayload({ config })

  const job = await enqueueDocumentTaskById({
    payload,
    task,
    collection: args.collection,
    id,
    steps: args.steps,
  })

  return { jobId: String(job.id) }
}

/** Queues the `regenerate` task, which queues the document task for every document (the list view's menu). */
export const enqueueCollectionTaskAction = async (
  args: TaskArgs,
): Promise<{
  jobId: string
}> => {
  await requireSession()

  const task = checkTask(args.task, args.collection)
  const payload = await getPayload({ config })

  const job = await payload.jobs.queue({
    task: TaskSlug.Regenerate,
    queue: QueueSlug.Default,
    input: {
      task,
      collection: args.collection,
      steps: args.steps,
    },
  })

  return { jobId: String(job.id) }
}

/** Queues `syncSkillSorting` (the Skills list menu and the PDF Generator global). */
export const enqueueSyncSkillSortingAction = async (): Promise<{
  jobId: string
}> => {
  await requireSession()

  const payload = await getPayload({ config })

  const job = await payload.jobs.queue({
    task: TaskSlug.SyncSkillSorting,
    queue: QueueSlug.HookHandler,
    input: {},
  })

  return { jobId: String(job.id) }
}
