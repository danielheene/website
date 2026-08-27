import type {
  Block,
  CollectionConfig,
  Config,
  GlobalConfig,
  Payload,
  PayloadRequest,
  Plugin,
} from 'payload'
import { APIError } from 'payload'

import { References } from '@/collections/References'
import {
  clearReferences,
  findTargetUsages,
  syncReferences,
  type TargetUsage,
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
   * referenced. Defaults to every tracked collection, so a topic or tag still
   * in use is protected the same way a media asset is.
   */
  guardedCollections?: string[]
  /**
   * Sources whose references are recorded but never block a delete.
   *
   * Defaults to the redirects table: a redirect pointing at a document is a
   * forwarding rule, not a usage, and rows are created automatically on every
   * slug change — so counting them would make renamed documents undeletable.
   */
  nonBlockingSources?: string[]
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

/** How many usages are named before the rest are summarised as a count. */
const MAX_LISTED_USAGES = 5

/** Human label for a collection, falling back to its slug. */
const labelFor = (payload: Payload, slug: string): string => {
  const labels = payload.collections?.[slug]?.config?.labels
  const singular = labels?.singular

  return typeof singular === 'string' && singular ? singular : slug
}

/**
 * Names the documents blocking a delete, in a form an editor can act on.
 *
 * Ids identify a row but not the thing an editor recognises, so each source is
 * resolved to its `useAsTitle` value — the same field the admin list shows.
 * Lookups are best-effort: a title that cannot be read falls back to the id
 * rather than turning a useful error into a failed one.
 */
const describeUsages = async (
  payload: Payload,
  req: PayloadRequest | undefined,
  usages: TargetUsage[],
): Promise<string> => {
  const listed = usages.slice(0, MAX_LISTED_USAGES)

  const described = await Promise.all(
    listed.map(async ({ sourceCollection, sourceId, sourceType, path }) => {
      const label = sourceType === 'global' ? sourceCollection : labelFor(payload, sourceCollection)

      let title: string | null = null

      if (sourceType === 'collection') {
        const titleField = payload.collections?.[sourceCollection]?.config?.admin?.useAsTitle

        if (titleField) {
          try {
            const doc = await payload.findByID({
              collection: sourceCollection as never,
              id: sourceId,
              depth: 0,
              select: {
                [titleField]: true,
              } as never,
              req,
            })

            const value = (doc as Record<string, unknown> | null)?.[titleField]
            if (typeof value === 'string' && value.trim()) title = value.trim()
          } catch {
            // fall through to the id
          }
        }
      }

      const name = title ?? sourceId
      return path ? `${label} "${name}" (${path})` : `${label} "${name}"`
    }),
  )

  const remainder = usages.length - listed.length
  return remainder > 0 ? `${described.join(', ')} and ${remainder} more` : described.join(', ')
}

const withReferenceTracking = (
  collection: CollectionConfig,
  blocks?: Block[],
  only?: string[],
): CollectionConfig => ({
  ...collection,
  hooks: {
    ...collection.hooks,
    /**
     *    Tracking runs *before* the collection's own hooks.
     *
     *    Payload awaits afterChange hooks in order, so anything that throws
     *    earlier in the chain skips everything after it. Several collections
     *    revalidate paths here, which throws outside a Next.js request scope
     *    (Local API, jobs, seeds) — appending would silently cost the save its
     *    references while the write itself succeeded.
     */
    afterChange: [
      async ({ doc, req, context }) => {
        if (context?.skipReferences) return doc

        try {
          await syncReferences({
            payload: req.payload,
            req,
            sourceCollection: collection.slug,
            sourceId: String(doc.id),
            data: doc,
            fields: collection.fields,
            blocks,
            only,
          })
        } catch (error) {
          // name the source: a bare failure here is hard to trace back, since
          // the save itself still looks like it succeeded
          req.payload.logger.error(
            `[references] failed to sync ${collection.slug}/${doc.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          )
          throw error
        }

        return doc
      },
      ...(collection.hooks?.afterChange ?? []),
    ],
    // likewise first, so cleanup is not skipped by an earlier hook throwing
    afterDelete: [
      async ({ doc, req }) => {
        await clearReferences({
          payload: req.payload,
          req,
          sourceCollection: collection.slug,
          sourceId: String(doc.id),
        })

        return doc
      },
      ...(collection.hooks?.afterDelete ?? []),
    ],
  },
})

/**
 * Guards a collection against deleting a document that is still in use.
 *
 * `beforeDelete` rather than `access.delete` so the reason can be reported:
 * access control can only return a boolean, which is why the previous
 * hand-rolled checks failed silently.
 */
const withDeleteGuard = (
  collection: CollectionConfig,
  nonBlockingSources: Set<string>,
): CollectionConfig => ({
  ...collection,
  hooks: {
    ...collection.hooks,
    beforeDelete: [
      ...(collection.hooks?.beforeDelete ?? []),
      async ({ id, req, context }) => {
        if (context?.skipReferences) return

        const allUsages = await findTargetUsages({
          payload: req.payload,
          req,
          targetCollection: collection.slug,
          targetId: String(id),
          // a document referencing itself (e.g. a video's own thumbnail) must
          // not block its deletion
          excludeSource: {
            sourceCollection: collection.slug,
            sourceId: String(id),
          },
        })

        const usages = allUsages.filter(
          ({ sourceCollection }) => !nonBlockingSources.has(sourceCollection),
        )

        if (usages.length > 0) {
          const subject = usages.length === 1 ? 'document' : 'documents'

          throw new APIError(
            `Cannot delete: still used by ${usages.length} ${subject} — ${await describeUsages(
              req.payload,
              req,
              usages,
            )}. Remove the reference there first.`,
            400,
            undefined,
            true,
          )
        }
      },
    ],
  },
})

const withGlobalTracking = (
  global: GlobalConfig,
  blocks?: Block[],
  only?: string[],
): GlobalConfig => ({
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
          blocks,
          only,
        })

        return doc
      },
    ],
  },
})

/**
 * Tracks every document reference in a hidden lookup table.
 *
 * Covers all collections through both `relationship` and `upload` fields, in
 * their monomorphic and polymorphic forms. Attaching hooks here rather than per
 * collection means new collections are included automatically, and the
 * reference shape is discovered by walking saved documents — so blocks, arrays
 * and Lexical upload nodes are all handled without enumerating field paths that
 * differ per entity.
 */
export const referencesPlugin =
  (options: ReferencesPluginOptions = {}): Plugin =>
  (incomingConfig: Config): Config => {
    const {
      excludeCollections = [],
      excludeGlobals = [],
      trackCollections,
      guardedCollections,
      nonBlockingSources = [
        CollectionSlug.Redirects,
      ],
      preventReferencedDeletes = true,
      enabled = true,
    } = options

    if (!enabled) return incomingConfig

    const excludedCollections = new Set([
      ...ALWAYS_EXCLUDED,
      ...excludeCollections,
    ])
    const excludedGlobals = new Set(excludeGlobals)
    const nonBlocking = new Set(nonBlockingSources)

    return {
      ...incomingConfig,
      collections: [
        ...(incomingConfig.collections ?? []).map((collection) => {
          if (excludedCollections.has(collection.slug)) return collection

          const tracked = withReferenceTracking(collection, incomingConfig.blocks, trackCollections)

          // undefined (the default) guards everything tracked; an explicit list
          // narrows it, and [] disables the guard without touching tracking
          const guarded = guardedCollections?.includes(collection.slug) ?? true

          return preventReferencedDeletes && guarded
            ? withDeleteGuard(tracked, nonBlocking)
            : tracked
        }),
        References,
      ],
      globals: (incomingConfig.globals ?? []).map((global) =>
        excludedGlobals.has(global.slug)
          ? global
          : withGlobalTracking(global, incomingConfig.blocks, trackCollections),
      ),
    }
  }
