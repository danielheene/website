import type {
  BasePayload,
  CollectionSlug as PayloadCollectionSlug,
  DataFromCollectionSlug,
} from 'payload'

import { taskWriteContext } from '@/lib/documentTasks/context'
import type { DocumentTask } from '@/lib/documentTasks/definitions'
import { resolveOwnMediaUrl } from '@/lib/resolveOwnMediaUrl'

const hasDrafts = (payload: BasePayload, collection: PayloadCollectionSlug) =>
  Boolean(payload.collections[collection]?.config.versions?.drafts)

/**
 * The document as the admin shows it: its newest version, which may be a draft on top of the
 * published one. `null` once it is deleted.
 */
export const loadLatestDocument = async <TSlug extends PayloadCollectionSlug>(
  payload: BasePayload,
  collection: TSlug,
  id: string,
): Promise<DataFromCollectionSlug<TSlug> | null> =>
  payload.findByID({
    collection,
    id,
    depth: 0,
    draft: hasDrafts(payload, collection),
    disableErrors: true,
  })

/**
 * Options for writing onto the version `loadLatestDocument` returned: a draft stays a draft
 * (saving the published document would bury the newer draft), a published document stays
 * published. Marked as the task's own write, so its hook doesn't queue it again.
 */
export const latestWriteOptions = (
  payload: BasePayload,
  task: DocumentTask,
  collection: PayloadCollectionSlug,
  doc: {
    id: string | number
    _status?: 'draft' | 'published' | null
  },
) => ({
  id: doc.id,
  depth: 0,
  draft: hasDrafts(payload, collection) && doc._status !== 'published',
  context: taskWriteContext(task),
})

/** The stored original of an upload, fetched from this site (uploads live in S3). */
export const fetchUploadOriginal = async (
  url: string | null | undefined,
): Promise<{
  data: Buffer
  contentType: string | null
}> => {
  const response = await fetch(resolveOwnMediaUrl(url))

  if (!response.ok) throw new Error(`Fetching the original failed (HTTP ${response.status})`)

  return {
    data: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type'),
  }
}
