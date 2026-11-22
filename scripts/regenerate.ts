/**
 *    Queues a document task for every document of a collection, like the list view's menu.
 *
 *    Usage:
 *      bun run regenerate <task> <collection> [step ...]
 *
 *    Examples:
 *      bun run regenerate generateMeta posts title
 *      bun run regenerate processImage images sizes blur
 *      bun run regenerate syncReferences pages
 *
 *    Without steps every step runs. The worker runs the queued jobs.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import {
  DOCUMENT_TASKS,
  documentTaskAppliesTo,
  isDocumentTask,
} from '@/lib/documentTasks/definitions'
import { enqueueCollectionTasks } from '@/lib/documentTasks/enqueueCollectionTasks'
import { isReferenceTracked } from '@/plugins/references/excludedCollections'

const [task = '', collection = '', ...steps] = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith('-'))

if (!isDocumentTask(task) || !documentTaskAppliesTo(task, collection, isReferenceTracked)) {
  console.error(`Usage: regenerate <${DOCUMENT_TASKS.join('|')}> <collection> [step ...]`)
  process.exit(1)
}

const payload = await getPayload({
  config,
})

const queued = await enqueueCollectionTasks({ payload, task, collection, steps })

payload.logger.info(`Queued ${queued} ${task} jobs for ${collection}`)

process.exit(0)
