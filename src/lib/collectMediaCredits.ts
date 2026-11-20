import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { resolveAttribution, type ResolvedAttribution } from '@/lib/attribution'
import { generateContentPath } from '@/lib/generateContentPath'
import {
  COLLECTION_PREFIX_MAP,
  CollectionSlug,
  type MediaCollectionSlug,
} from '@/types/collections'

const MEDIA_COLLECTIONS: MediaCollectionSlug[] = [
  CollectionSlug.MediaImages,
  CollectionSlug.MediaVideos,
  CollectionSlug.MediaAudios,
  CollectionSlug.MediaFiles,
]

export interface MediaCreditUsage {
  /** Slug of the collection the asset is used in. */
  collection: string
  /**
   * Singular label of that collection, e.g. "Page" or "Blog Post": a title
   * alone (e.g. "Resume") doesn't say what kind of content it is.
   */
  collectionLabel: string
  /** Title of the referencing document, when it has one. */
  title: string | null
  /** The document's public path, for collections rendered at their own URL. */
  href: string | null
}

export interface MediaCredit {
  id: string
  collection: MediaCollectionSlug
  filename: string
  attribution: ResolvedAttribution
  /**
   * A small preview image for the asset, when one is available: the image's
   * own thumbnail size for `MediaImages`, or the related cover image for
   * `MediaVideos`/`MediaFiles`. `MediaAudios` has no thumbnail generation
   * yet, so this is `null` there.
   */
  thumbnailUrl: string | null
  /** Every published document using the asset, de-duplicated and sorted by title. */
  usages: MediaCreditUsage[]
}

type SourceLabel = Omit<MediaCreditUsage, 'collection'>

// a global is public site-wide content but no place to point to
const GLOBAL_SOURCE = 'global'

/**
 * Resolves how a referencing document is listed: its collection's label, its
 * title (each collection's own `useAsTitle`: resume jobs use `employer`,
 * skills `name_label`) and, for collections with their own URL, its path.
 * Globals resolve to GLOBAL_SOURCE: in use, but not listed. Documents the
 * public can't see (unpublished drafts, deleted ones) resolve to null.
 */
const resolveSourceLabel = async (
  payload: Payload,
  sourceCollection: string,
  sourceId: string,
  sourceType: string,
): Promise<SourceLabel | typeof GLOBAL_SOURCE | null> => {
  if (sourceType === 'global') return GLOBAL_SOURCE

  const collection = payload.config.collections.find(({ slug }) => slug === sourceCollection)

  if (!collection) return null

  const collectionLabel = (collection.labels?.singular as string) || sourceCollection
  const titleField = collection.admin?.useAsTitle || 'id'
  const hasDrafts = Boolean(collection.versions?.drafts)
  const hasPath = sourceCollection in COLLECTION_PREFIX_MAP

  try {
    const doc = await payload.findByID({
      collection: sourceCollection as Parameters<typeof payload.findByID>[0]['collection'],
      id: sourceId,
      depth: 0,
      select: {
        [titleField]: true,
        ...(hasDrafts && { _status: true }),
        ...(hasPath && { slug: true }),
      } as never,
    })

    // SAFETY: only the selected fields are read, each type-checked below.
    const fields = doc as unknown as Record<string, unknown>

    // the main document holds the last published state; a never-published one is a draft
    if (hasDrafts && fields._status !== 'published') return null

    const title = fields[titleField]
    const slug = fields.slug

    return {
      collectionLabel,
      title: typeof title === 'string' && title.trim() !== '' ? title : null,
      href:
        hasPath && typeof slug === 'string' ? generateContentPath(sourceCollection, slug) : null,
    }
  } catch {
    // The source document may have been deleted before its reference rows were
    // cleaned up; skip it rather than failing the whole credits list.
    return null
  }
}

/**
 * Resolves a small preview image URL for a media doc: the doc's own
 * `thumbnail` image size for `MediaImages`, or the first related cover image
 * (populated at depth 1) for `MediaVideos`/`MediaFiles`. Falls back to the
 * full-size `url` when no dedicated thumbnail exists, and to `null` for
 * collections without any image representation (`MediaAudios`).
 */
const resolveThumbnailUrl = (
  collection: MediaCollectionSlug,
  doc: Record<string, unknown>,
): string | null => {
  if (collection === CollectionSlug.MediaImages) {
    const sizes = doc.sizes as
      | {
          thumbnail?: {
            url?: string | null
          }
        }
      | undefined

    return sizes?.thumbnail?.url || (doc.url as string | null) || null
  }

  if (collection === CollectionSlug.MediaVideos || collection === CollectionSlug.MediaFiles) {
    const thumbnails = doc.thumbnails as
      | {
          value?:
            | {
                url?: string | null
                sizes?: {
                  thumbnail?: {
                    url?: string | null
                  }
                }
              }
            | string
        }[]
      | undefined

    const cover = thumbnails?.find((thumbnail) => typeof thumbnail.value === 'object')?.value

    if (cover && typeof cover === 'object') {
      return cover.sizes?.thumbnail?.url || cover.url || null
    }

    return null
  }

  return null
}

/**
 * Collects every media asset that carries an attribution *and* is used
 * somewhere the public can see, together with the documents using it.
 *
 * Reads the `document-references` bookkeeping table so unused assets are not
 * attributed, then batch-fetches the referenced media per collection — one
 * query each instead of one per reference row.
 */
export const collectMediaCredits = async (): Promise<MediaCredit[]> => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.DocumentReferences)

  for (const collection of MEDIA_COLLECTIONS) cacheTag(collection)

  // the usage list shows these documents' titles and only their published ones
  cacheTag(CollectionSlug.Pages, CollectionSlug.BlogPosts, CollectionSlug.BlogTopics)

  // Created inside the cache scope: a `Payload` instance is not serializable,
  // so it cannot be passed across a `'use cache'` boundary as an argument.
  const payload = await getPayload({
    config,
  })

  const { docs: references } = await payload.find({
    collection: CollectionSlug.DocumentReferences,
    where: {
      targetCollection: {
        in: MEDIA_COLLECTIONS,
      },
    },
    select: {
      targetCollection: true,
      targetId: true,
      sourceCollection: true,
      sourceId: true,
      sourceType: true,
    },
    depth: 0,
    limit: 0,
    pagination: false,
  })

  if (references.length === 0) return []

  // Group target ids per media collection so each collection is fetched once.
  const idsByCollection = new Map<MediaCollectionSlug, Set<string>>()

  for (const reference of references) {
    const collection = reference.targetCollection as MediaCollectionSlug

    if (!MEDIA_COLLECTIONS.includes(collection)) continue

    const ids = idsByCollection.get(collection) ?? new Set<string>()
    ids.add(reference.targetId)
    idsByCollection.set(collection, ids)
  }

  // Resolve each distinct source document once, not once per reference row.
  const sourceKey = (collection: string, id: string) => `${collection}:${id}`
  const sourceLabels = new Map<string, SourceLabel | typeof GLOBAL_SOURCE | null>()

  await Promise.all(
    [
      ...new Map(
        references.map((reference) => [
          sourceKey(reference.sourceCollection, reference.sourceId),
          reference,
        ]),
      ).values(),
    ].map(async (reference) => {
      const label = await resolveSourceLabel(
        payload,
        reference.sourceCollection,
        reference.sourceId,
        reference.sourceType,
      )

      sourceLabels.set(sourceKey(reference.sourceCollection, reference.sourceId), label)
    }),
  )

  const credits: MediaCredit[] = []

  await Promise.all(
    [...idsByCollection.entries()].map(async ([collection, ids]) => {
      const needsThumbnailRelation =
        collection === CollectionSlug.MediaVideos || collection === CollectionSlug.MediaFiles

      const { docs } = await payload.find({
        collection,
        where: {
          id: {
            in: [...ids],
          },
        },
        select: {
          filename: true,
          attribution: true,
          url: true,
          sizes: true,
          ...(needsThumbnailRelation
            ? {
                thumbnails: true,
              }
            : {}),
        },
        depth: needsThumbnailRelation ? 1 : 0,
        limit: 0,
        pagination: false,
      })

      for (const doc of docs) {
        const attribution = resolveAttribution(doc.attribution)

        if (!attribution) continue

        const usages = new Map<string, MediaCreditUsage>()
        let isPublic = false

        for (const reference of references) {
          if (reference.targetCollection !== collection) continue

          if (reference.targetId !== String(doc.id)) continue

          const source = sourceLabels.get(sourceKey(reference.sourceCollection, reference.sourceId))

          if (!source) continue

          isPublic = true

          if (source === GLOBAL_SOURCE) continue

          usages.set(`${reference.sourceCollection}:${reference.sourceId}`, {
            collection: reference.sourceCollection,
            ...source,
          })
        }

        // credited only where the public can see it in use
        if (!isPublic) continue

        credits.push({
          id: String(doc.id),
          collection,
          filename: doc.filename ?? '',
          attribution,
          // SAFETY: resolveThumbnailUrl only reads `url`, `sizes` and `thumbnails`, checking each.
          thumbnailUrl: resolveThumbnailUrl(collection, doc as unknown as Record<string, unknown>),
          usages: [...usages.values()].sort((a, b) =>
            (a.title ?? a.collectionLabel).localeCompare(b.title ?? b.collectionLabel),
          ),
        })
      }
    }),
  )

  return credits.sort((a, b) => a.filename.localeCompare(b.filename))
}
