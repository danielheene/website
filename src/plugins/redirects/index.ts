import type { CollectionConfig, Config, Plugin } from 'payload'

import { Redirects } from '@/collections/Redirects'
import { normalizeRedirectPath } from '@/collections/Redirects/hooks/normalizeFromPath'
import { generateContentPath } from '@/lib/generateContentPath'
import { COLLECTION_PREFIX_MAP, CollectionSlug } from '@/types/collections'

export interface RedirectsPluginOptions {
  /**
   * Collections whose slug changes create a redirect. Defaults to every
   * collection with a public content path.
   */
  collections?: string[]
  enabled?: boolean
}

/**
 * Records a redirect from a document's previous path whenever its slug
 * changes, so existing links and search results keep working.
 *
 * Targets the document rather than a literal path: a second rename then
 * updates every prior redirect automatically instead of leaving a chain of
 * stale hops.
 */
const withSlugChangeRedirect = (collection: CollectionConfig): CollectionConfig => ({
  ...collection,
  hooks: {
    ...collection.hooks,
    afterChange: [
      ...(collection.hooks?.afterChange ?? []),
      async ({ doc, previousDoc, operation, req, context }) => {
        if (context?.skipRedirects) return doc
        if (operation !== 'update') return doc

        const previousSlug = previousDoc?.slug
        const nextSlug = doc?.slug

        if (
          typeof previousSlug !== 'string' ||
          typeof nextSlug !== 'string' ||
          !previousSlug ||
          previousSlug === nextSlug
        ) {
          return doc
        }

        const from = normalizeRedirectPath(generateContentPath(collection.slug, previousSlug))
        const to = normalizeRedirectPath(generateContentPath(collection.slug, nextSlug))

        // the old path may now belong to a different document
        if (from === to) return doc

        const { docs: existing } = await req.payload.find({
          collection: CollectionSlug.Redirects,
          where: {
            from: {
              equals: from,
            },
          },
          limit: 1,
          pagination: false,
          depth: 0,
          req,
        })

        // the relationTo union is generated per-collection; the slug is
        // validated by `tracked` above, so the cast is safe here
        const data = {
          from,
          type: 'reference',
          toDocument: {
            relationTo: collection.slug,
            value: doc.id,
          },
          statusCode: '301',
          enabled: true,
          origin: 'slug-change',
        } as never

        if (existing[0]) {
          // refresh a stale automatic row; never clobber an editor's own entry
          if (existing[0].origin !== 'slug-change') return doc

          await req.payload.update({
            collection: CollectionSlug.Redirects,
            id: existing[0].id,
            data,
            req,
          })
          return doc
        }

        await req.payload.create({
          collection: CollectionSlug.Redirects,
          data,
          req,
        })

        return doc
      },
    ],
  },
})

/**
 * Registers the redirects collection and keeps it in sync with slug changes.
 */
export const redirectsPlugin =
  (options: RedirectsPluginOptions = {}): Plugin =>
  (incomingConfig: Config): Config => {
    const { collections = Object.keys(COLLECTION_PREFIX_MAP), enabled = true } = options

    if (!enabled) return incomingConfig

    const tracked = new Set(collections)

    return {
      ...incomingConfig,
      collections: [
        ...(incomingConfig.collections ?? []).map((collection) =>
          tracked.has(collection.slug) ? withSlugChangeRedirect(collection) : collection,
        ),
        Redirects,
      ],
    }
  }
