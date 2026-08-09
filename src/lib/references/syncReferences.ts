import type { Field, Payload, PayloadRequest } from 'payload'

import { CollectionSlug } from '@/types/collections'

import { extractReferences } from './extractReferences'

export interface SyncReferencesArgs {
  payload: Payload
  req?: PayloadRequest
  /** Slug of the collection or global that owns the references. */
  sourceCollection: string
  /** Document id, or the global slug for globals. */
  sourceId: string
  sourceType?: 'collection' | 'global'
  /** The saved document to scan. */
  data: unknown
  /**
   * Field config of the source, used to resolve monomorphic relationships
   * whose stored value is a bare id.
   */
  fields?: Field[]
  /** Restrict tracking to these target collections. */
  only?: string[]
}

/**
 * Replaces the stored references for one source document with those currently
 * present in `data`.
 *
 * Delete-then-insert keeps the table consistent without diffing: a save is the
 * authoritative statement of what a document references. `req` is threaded
 * through so the writes join the caller's transaction.
 */
export const syncReferences = async ({
  payload,
  req,
  sourceCollection,
  sourceId,
  sourceType = 'collection',
  data,
  fields,
  only,
}: SyncReferencesArgs): Promise<number> => {
  const references = extractReferences(data, {
    fields,
    only,
  })

  await payload.delete({
    collection: CollectionSlug.DocumentReferences,
    where: {
      and: [
        {
          sourceCollection: {
            equals: sourceCollection,
          },
        },
        {
          sourceId: {
            equals: sourceId,
          },
        },
      ],
    },
    req,
  })

  for (const reference of references) {
    await payload.create({
      collection: CollectionSlug.DocumentReferences,
      data: {
        assetCollection: reference.relationTo,
        assetId: reference.value,
        sourceCollection,
        sourceId,
        sourceType,
        path: reference.path,
      },
      req,
    })
  }

  return references.length
}

/** Drops every reference recorded for a source document. */
export const clearReferences = async ({
  payload,
  req,
  sourceCollection,
  sourceId,
}: Pick<SyncReferencesArgs, 'payload' | 'req' | 'sourceCollection' | 'sourceId'>) => {
  await payload.delete({
    collection: CollectionSlug.DocumentReferences,
    where: {
      and: [
        {
          sourceCollection: {
            equals: sourceCollection,
          },
        },
        {
          sourceId: {
            equals: sourceId,
          },
        },
      ],
    },
    req,
  })
}

export interface AssetUsage {
  sourceCollection: string
  sourceId: string
  sourceType: 'collection' | 'global'
  path?: string
}

/**
 * Lists the documents currently referencing an asset — the query that replaces
 * per-collection `find({ where: { <someField>: { contains: id } } })` guards.
 */
export const findAssetUsages = async ({
  payload,
  req,
  assetCollection,
  assetId,
  excludeSource,
}: {
  payload: Payload
  req?: PayloadRequest
  assetCollection: string
  assetId: string
  /** Ignore references from this source (e.g. the asset's own document). */
  excludeSource?: {
    sourceCollection: string
    sourceId: string
  }
}): Promise<AssetUsage[]> => {
  const { docs } = await payload.find({
    collection: CollectionSlug.DocumentReferences,
    where: {
      and: [
        {
          assetCollection: {
            equals: assetCollection,
          },
        },
        {
          assetId: {
            equals: assetId,
          },
        },
      ],
    },
    pagination: false,
    limit: 0,
    req,
  })

  return docs
    .map((doc) => ({
      sourceCollection: String(doc.sourceCollection),
      sourceId: String(doc.sourceId),
      sourceType: (doc.sourceType ?? 'collection') as 'collection' | 'global',
      path: doc.path ? String(doc.path) : undefined,
    }))
    .filter(
      (usage) =>
        !excludeSource ||
        usage.sourceCollection !== excludeSource.sourceCollection ||
        usage.sourceId !== excludeSource.sourceId,
    )
}
