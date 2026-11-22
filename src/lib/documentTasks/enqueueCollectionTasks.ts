import type { BasePayload, CollectionSlug as PayloadCollectionSlug, Where } from 'payload'

import { TaskSlug } from '@/types/jobs-queue'

import type { DocumentTask } from './definitions'
import { enqueueDocumentTask } from './enqueueDocumentTask'

// documents a task can't do anything for, left out of a collection-wide run
const COLLECTION_FILTERS: Partial<Record<DocumentTask, Where>> = {
  // page thumbnails are rendered with pdf.js
  [TaskSlug.GenerateDocumentThumbnails]: {
    mimeType: {
      equals: 'application/pdf',
    },
  },
}

/**
 * Queues the document task for every document of a collection, forwarding the steps. All ids
 * are collected first, so documents the jobs change can't shift the pages being walked.
 */
export const enqueueCollectionTasks = async ({
  payload,
  task,
  collection,
  steps = [],
}: {
  payload: BasePayload
  task: DocumentTask
  collection: string
  steps?: string[]
}): Promise<number> => {
  const docs: { id: string | number; slug?: string | null; filename?: string | null }[] = []

  for (let page = 1; ; page++) {
    const result = await payload.find({
      // SAFETY: the action and the CLI only pass collections the task applies to
      collection: collection as PayloadCollectionSlug,
      depth: 0,
      limit: 100,
      page,
      sort: 'createdAt',
      where: COLLECTION_FILTERS[task] ?? {},
    })

    docs.push(...result.docs)

    if (!result.hasNextPage) break
  }

  for (const doc of docs) {
    await enqueueDocumentTask({ payload, task, collection, doc, steps })
  }

  payload.logger.info(`[regenerate] queued ${docs.length} ${task} jobs for ${collection}`)

  return docs.length
}
