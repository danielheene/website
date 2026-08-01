/**
 *    Rebuilds the media-references table from existing content.
 *
 *    Usage:
 *      pnpm media-refs:backfill
 *
 *    References are normally written by the `references` plugin on save,
 *    so this is only needed once after enabling it (or to repair the table).
 *    Safe to re-run: each source document's rows are replaced, not appended.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { syncReferences } from '@/lib/references'
import { CollectionSlug } from '@/types/collections'

const SKIPPED_COLLECTIONS = new Set<string>([
  CollectionSlug.DocumentReferences,
  CollectionSlug.PayloadJobs,
  CollectionSlug.PayloadKVS,
  CollectionSlug.PayloadLockedDocuments,
  CollectionSlug.PayloadMigrations,
  CollectionSlug.PayloadPreferences,
  CollectionSlug.PayloadQueryPresets,
  CollectionSlug.PayloadExports,
  CollectionSlug.PayloadImports,
  CollectionSlug.PayloadFolders,
])

const payload = await getPayload({
  config,
})

{
  let totalDocuments = 0
  let totalReferences = 0

  for (const collection of Object.values(payload.collections)) {
    const slug = collection.config.slug
    if (SKIPPED_COLLECTIONS.has(slug)) continue

    // depth 0 keeps relations as ids, which is all the extractor needs and
    // avoids pulling entire referenced documents into memory
    const { docs } = (await payload.find({
      collection: slug as never,
      pagination: false,
      limit: 0,
      depth: 0,
      draft: false,
    })) as {
      docs: {
        id: string | number
      }[]
    }

    let collectionReferences = 0
    for (const doc of docs) {
      const count = await syncReferences({
        payload,
        sourceCollection: slug,
        sourceId: String(doc.id),
        data: doc,
      })
      collectionReferences += count
    }

    totalDocuments += docs.length
    totalReferences += collectionReferences

    if (docs.length > 0) {
      console.info(`${slug}: ${docs.length} documents, ${collectionReferences} references`)
    }
  }

  for (const global of payload.config.globals) {
    const data = await payload.findGlobal({
      slug: global.slug as never,
      depth: 0,
    })

    const count = await syncReferences({
      payload,
      sourceCollection: global.slug,
      sourceId: global.slug,
      sourceType: 'global',
      data,
    })

    totalReferences += count
    if (count > 0) console.info(`${global.slug} (global): ${count} references`)
  }

  console.info(`\nBackfill complete: ${totalDocuments} documents, ${totalReferences} references.`)
  process.exit(0)
}
