/**
 *    Rebuilds the references table from existing content.
 *
 *    Usage:
 *      pnpm refs:backfill
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

  /**
   *    Clear first rather than relying on the per-source replace below: rows
   *    whose source no longer exists — or which predate a field rename — match
   *    no source being rebuilt and would otherwise survive as dead entries.
   *
   *    The table is derived state, so dropping it is always recoverable by
   *    completing this run.
   */
  await payload.delete({
    collection: CollectionSlug.DocumentReferences,
    where: {},
  })

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
        // without the field config, monomorphic relations (a bare id, with no
        // collection in the stored value) are indistinguishable from plain
        // strings and would be dropped from the rebuilt table
        fields: collection.config.fields,
        blocks: payload.config.blocks,
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
      fields: global.fields,
      blocks: payload.config.blocks,
    })

    totalReferences += count
    if (count > 0) console.info(`${global.slug} (global): ${count} references`)
  }

  console.info(`\nBackfill complete: ${totalDocuments} documents, ${totalReferences} references.`)
  process.exit(0)
}
