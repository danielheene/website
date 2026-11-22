import type { CollectionSlug as PayloadCollectionSlug, TaskHandler } from 'payload'

import { loadLatestDocument } from '@/jobs-queue/lib/documentTaskHandler'
import { clearReferences, syncReferences } from '@/lib/references'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import type { ReferencesCustomConfig } from '@/plugins/references'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Rewrites the reference rows of one document from its newest version, as the save left it, or
 * clears them once the document is gone. Queued by the `references` plugin's hooks.
 */
const run: TaskHandler<TaskSlug['SyncReferences']> = async ({ input, req }) => {
  const { payload } = req
  // SAFETY: an unknown slug finds no collection, which is checked right below
  const collection = payload.collections[input.collection as PayloadCollectionSlug]

  if (!collection) throw new Error(`Unknown collection "${input.collection}"`)

  const doc = await loadLatestDocument(payload, collection.config.slug, input.id)
  // SAFETY: the references plugin writes this shape into `config.custom.references`
  const options = (payload.config.custom?.references ?? {}) as ReferencesCustomConfig

  const references = doc
    ? await syncReferences({
        payload,
        req,
        sourceCollection: collection.config.slug,
        sourceId: input.id,
        data: doc,
        fields: collection.config.fields,
        blocks: payload.config.blocks,
        only: options.trackCollections,
      })
    : await clearReferences({
        payload,
        req,
        sourceCollection: collection.config.slug,
        sourceId: input.id,
      }).then(() => 0)

  // the media credits list where each file is used
  await revalidateCache({
    tags: [CollectionSlug.DocumentReferences],
  })

  return { output: { references } }
}

export const handler = run
