import type { BasePayload, CollectionSlug as PayloadCollectionSlug } from 'payload'

import { CollectionSlug } from '@/types/collections'
import { QueueSlug } from '@/types/jobs-queue'

import {
  type DocumentTask,
  documentTaskKey,
  documentTaskStepNames,
  resolveDocumentRef,
} from './definitions'

type EnqueueDocumentTaskArgs = {
  payload: BasePayload
  task: DocumentTask
  collection: string
  /** The document as the caller has it; its slug or filename becomes the ref. */
  doc: {
    id: string | number
    slug?: string | null
    filename?: string | null
  }
  /** The steps to run; empty or omitted runs all of them. */
  steps?: string[]
}

/**
 * Steps of a still-queued job for the same document, which the new job supersedes; `null` when
 * that job runs every step (or there is none to merge).
 */
const pendingSteps = async (payload: BasePayload, key: string): Promise<string[] | null> => {
  const { docs } = await payload.find({
    collection: CollectionSlug.PayloadJobs,
    depth: 0,
    limit: 1,
    where: {
      and: [
        {
          concurrencyKey: {
            equals: key,
          },
        },
        {
          processing: {
            equals: false,
          },
        },
        {
          completedAt: {
            exists: false,
          },
        },
      ],
    },
  })

  // SAFETY: jobs under this key belong to this task and were queued below, with `steps: string[]`
  const input = docs[0]?.input as { steps?: string[] | null } | undefined

  return input ? (input.steps ?? []) : null
}

/**
 * Queues one document task. A job still waiting for the same document is superseded by this one,
 * so its steps are merged in first: a Jobs save asking for a skill tag's interval and a Skills
 * save asking for its type, moments apart, end up as one job doing both.
 */
export const enqueueDocumentTask = async ({
  payload,
  task,
  collection,
  doc,
  steps = [],
}: EnqueueDocumentTaskArgs) => {
  const id = String(doc.id)
  const ref = resolveDocumentRef(doc)

  const key = documentTaskKey(task, { collection, id, ref })
  const hasSteps = documentTaskStepNames(task).length > 0

  let mergedSteps = steps

  if (hasSteps && steps.length > 0) {
    const pending = await pendingSteps(payload, key)

    // an empty list means "every step", which absorbs whatever was asked for
    if (pending !== null) {
      mergedSteps = pending.length === 0 ? [] : [...new Set([...pending, ...steps])]
    }
  }

  // SAFETY: the input matches the schema `documentTaskInputSchema` gives every document task
  return payload.jobs.queue({
    task,
    queue: QueueSlug.HookHandler,
    input: {
      collection,
      id,
      ref,
      ...(hasSteps && { steps: mergedSteps }),
    },
  } as Parameters<BasePayload['jobs']['queue']>[0])
}

/** For callers holding only an id (a related document): looks the document up for its ref. */
export const enqueueDocumentTaskById = async ({
  id,
  ...args
}: Omit<EnqueueDocumentTaskArgs, 'doc'> & {
  id: string
}) => {
  const doc = await args.payload.findByID({
    // SAFETY: callers pass the slug of a configured collection (a hook's or a checked task's)
    collection: args.collection as PayloadCollectionSlug,
    id,
    depth: 0,
    disableErrors: true,
  })

  return enqueueDocumentTask({ ...args, doc: doc ?? { id } })
}
