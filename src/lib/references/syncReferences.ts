import type { Block, Field, Payload, PayloadRequest } from 'payload'

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
  /**
   * Config-level block definitions, needed to resolve blocks referenced by slug
   * via `blockReferences`.
   */
  blocks?: Block[]
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
  blocks,
  only,
}: SyncReferencesArgs): Promise<number> => {
  const references = extractReferences(data, {
    fields,
    blocks,
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
        targetCollection: reference.relationTo,
        targetId: reference.value,
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

export interface TargetUsage {
  sourceCollection: string
  sourceId: string
  sourceType: 'collection' | 'global'
  path?: string
}

/**
 * Lists the documents currently referencing a target — the query that replaces
 * per-collection `find({ where: { <someField>: { contains: id } } })` guards.
 */
export const findTargetUsages = async ({
  payload,
  req,
  targetCollection,
  targetId,
  excludeSource,
}: {
  payload: Payload
  req?: PayloadRequest
  targetCollection: string
  targetId: string
  /** Ignore references from this source (e.g. the document's own record). */
  excludeSource?: {
    sourceCollection: string
    sourceId: string
  }
}): Promise<TargetUsage[]> => {
  const { docs } = await payload.find({
    collection: CollectionSlug.DocumentReferences,
    where: {
      and: [
        {
          targetCollection: {
            equals: targetCollection,
          },
        },
        {
          targetId: {
            equals: targetId,
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
