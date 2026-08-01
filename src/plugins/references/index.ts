import type { CollectionConfig, Config, GlobalConfig, Plugin } from 'payload'
import { APIError } from 'payload'

import { References } from '@/collections/References'
import {
  clearReferences,
  findAssetUsages,
  MEDIA_COLLECTIONS,
  syncReferences,
} from '@/lib/references'
import { CollectionSlug } from '@/types/collections'

export interface ReferencesPluginOptions {
  /** Skip tracking for these collection slugs. */
  excludeCollections?: string[]
  /** Skip tracking for these global slugs. */
  excludeGlobals?: string[]
  /**
   * Restrict which target collections are tracked. Defaults to every
   * collection, so any relationship — not only media — is recorded.
   */
  trackCollections?: string[]
  /**
   * Collections whose documents are guarded against deletion while still
   * referenced. Defaults to the media collections.
   */
  guardedCollections?: string[]
  /**
   * Block deleting a referenced document. Disable to keep the table purely
   * advisory.
   */
  preventReferencedDeletes?: boolean
  enabled?: boolean
}

/** Collections that must never be scanned — the table itself, plus churn-heavy internals. */
const ALWAYS_EXCLUDED = new Set<string>([
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

const describeUsages = (
  usages: {
    sourceCollection: string
    sourceId: string
    path?: string
  }[],
): string => {
  const shown = usages
    .slice(0, 5)
    .map(({ sourceCollection, sourceId, path }) =>
      path ? `${sourceCollection}/${sourceId} (${path})` : `${sourceCollection}/${sourceId}`,
    )
    .join(', ')

  const remainder = usages.length > 5 ? ` and ${usages.length - 5} more` : ''
  return `${shown}${remainder}`
}

const withReferenceTracking = (
  collection: CollectionConfig,
  only?: string[],
): CollectionConfig => ({
  ...collection,
  hooks: {
    ...collection.hooks,
    afterChange: [
      ...(collection.hooks?.afterChange ?? []),
      async ({ doc, req, context }) => {
        if (context?.skipReferences) return doc

        await syncReferences({
          payload: req.payload,
          req,
          sourceCollection: collection.slug,
          sourceId: String(doc.id),
          data: doc,
          fields: collection.fields,
          only,
        })

        return doc
      },
    ],
    afterDelete: [
      ...(collection.hooks?.afterDelete ?? []),
      async ({ doc, req }) => {
        await clearReferences({
          payload: req.payload,
          req,
          sourceCollection: collection.slug,
          sourceId: String(doc.id),
        })

        return doc
      },
    ],
  },
})

/**
 * Guards media collections against deleting an asset that is still in use.
 *
 * `beforeDelete` rather than `access.delete` so the reason can be reported:
 * access control can only return a boolean, which is why the previous
 * hand-rolled checks failed silently.
 */
const withDeleteGuard = (collection: CollectionConfig): CollectionConfig => ({
  ...collection,
  hooks: {
    ...collection.hooks,
    beforeDelete: [
      ...(collection.hooks?.beforeDelete ?? []),
      async ({ id, req, context }) => {
        if (context?.skipReferences) return

        const usages = await findAssetUsages({
          payload: req.payload,
          req,
          assetCollection: collection.slug,
          assetId: String(id),
          // an asset referencing itself (e.g. a video's own thumbnail) must
          // not block its deletion
          excludeSource: {
            sourceCollection: collection.slug,
            sourceId: String(id),
          },
        })

        if (usages.length > 0) {
          throw new APIError(
            `This asset is still referenced by ${usages.length} document(s): ${describeUsages(usages)}.`,
            400,
            undefined,
            true,
          )
        }
      },
    ],
  },
})

const withGlobalTracking = (global: GlobalConfig, only?: string[]): GlobalConfig => ({
  ...global,
  hooks: {
    ...global.hooks,
    afterChange: [
      ...(global.hooks?.afterChange ?? []),
      async ({ doc, req, context }) => {
        if (context?.skipReferences) return doc

        await syncReferences({
          payload: req.payload,
          req,
          sourceCollection: global.slug,
          sourceId: global.slug,
          sourceType: 'global',
          data: doc,
          fields: global.fields,
          only,
        })

        return doc
      },
    ],
  },
})

/**
 * Tracks every media reference in a hidden lookup table.
 *
 * Attaching hooks here rather than per collection means new collections are
 * covered automatically, and the reference shape is discovered by walking saved
 * documents — so blocks, arrays and Lexical upload nodes are all included
 * without enumerating field paths that differ per entity.
 */
export const referencesPlugin =
  (options: ReferencesPluginOptions = {}): Plugin =>
  (incomingConfig: Config): Config => {
    const {
      excludeCollections = [],
      excludeGlobals = [],
      trackCollections,
      guardedCollections = MEDIA_COLLECTIONS,
      preventReferencedDeletes = true,
      enabled = true,
    } = options

    if (!enabled) return incomingConfig

    const excludedCollections = new Set([
      ...ALWAYS_EXCLUDED,
      ...excludeCollections,
    ])
    const excludedGlobals = new Set(excludeGlobals)

    return {
      ...incomingConfig,
      collections: [
        ...(incomingConfig.collections ?? []).map((collection) => {
          if (excludedCollections.has(collection.slug)) return collection

          const tracked = withReferenceTracking(collection, trackCollections)

          return preventReferencedDeletes && guardedCollections.includes(collection.slug)
            ? withDeleteGuard(tracked)
            : tracked
        }),
        References,
      ],
      globals: (incomingConfig.globals ?? []).map((global) =>
        excludedGlobals.has(global.slug) ? global : withGlobalTracking(global, trackCollections),
      ),
    }
  }
