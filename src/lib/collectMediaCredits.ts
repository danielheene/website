import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { CollectionSlug, type MediaCollectionSlug } from '@/types/collections'

const MEDIA_COLLECTIONS: MediaCollectionSlug[] = [
  CollectionSlug.MediaImages,
  CollectionSlug.MediaVideos,
  CollectionSlug.MediaAudios,
  CollectionSlug.MediaDocuments,
]

export interface MediaCreditUsage {
  /** Slug of the collection (or global) the asset is used in. */
  collection: string
  /**
   * Human-readable name of the collection (or global) the asset is used in,
   * e.g. "Job" or "Blog Post" — a document's own title alone (e.g. "Resume")
   * doesn't say what kind of content it is.
   */
  collectionLabel: string
  /** Human-readable title of the referencing document. */
  label: string
}

export interface MediaCredit {
  id: string
  collection: MediaCollectionSlug
  filename: string
  credits: DefaultTypedEditorState
  /**
   * A small preview image for the asset, when one is available: the image's
   * own thumbnail size for `MediaImages`, or the related cover image for
   * `MediaVideos`/`MediaDocuments`. `MediaAudios` has no thumbnail generation
   * yet, so this is `null` there.
   */
  thumbnailUrl: string | null
  /** Every place the asset is referenced, de-duplicated and sorted by label. */
  usages: MediaCreditUsage[]
}

/**
 * A lexical editor state is "empty" when it has no children, or only children
 * that carry no text. Payload stores an empty paragraph rather than `null` when
 * a rich text field is cleared, so `exists`/`!= null` checks are not enough.
 */
const hasCreditsContent = (credits: unknown): credits is DefaultTypedEditorState => {
  if (!credits || typeof credits !== 'object') return false

  const root = (credits as DefaultTypedEditorState).root
  if (!root || !Array.isArray(root.children) || root.children.length === 0) return false

  const collectText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    const record = node as {
      text?: unknown
      children?: unknown
    }

    let text = typeof record.text === 'string' ? record.text : ''
    if (Array.isArray(record.children)) {
      for (const child of record.children) text += collectText(child)
    }
    return text
  }

  return root.children.some((child) => collectText(child).trim() !== '')
}

interface SourceLabel {
  /** Human-readable name of the collection/global itself, e.g. "Job", "Blog Post", "Site Settings". */
  collectionLabel: string
  /** Human-readable title of the referencing document. `null` for globals, which have no per-doc title. */
  docLabel: string | null
}

/**
 * Resolves the display info of a referencing document: the collection's own
 * label (so "Job" or "Blog Post" is visible, not just the slug) plus the
 * document's title, honouring each collection's own `useAsTitle` rather than
 * assuming every collection uses `title` (resume jobs use `employer`, skills
 * use `name_label`, and so on). A doc's title alone can be ambiguous — e.g. a
 * `ResumeDocuments` entry titled "Resume" — so callers should show both.
 */
const resolveSourceLabel = async (
  payload: Payload,
  sourceCollection: string,
  sourceId: string,
  sourceType: string,
): Promise<SourceLabel | null> => {
  if (sourceType === 'global') {
    const global = payload.config.globals.find(({ slug }) => slug === sourceCollection)
    return {
      collectionLabel: (global?.label as string) || sourceCollection,
      docLabel: null,
    }
  }

  const collection = payload.config.collections.find(({ slug }) => slug === sourceCollection)
  if (!collection) return null

  const collectionLabel = (collection.labels?.singular as string) || sourceCollection
  const titleField = collection.admin?.useAsTitle || 'id'

  try {
    const doc = await payload.findByID({
      collection: sourceCollection as Parameters<typeof payload.findByID>[0]['collection'],
      id: sourceId,
      depth: 0,
      select: {
        [titleField]: true,
      } as never,
    })

    const title = (doc as Record<string, unknown>)?.[titleField]
    return {
      collectionLabel,
      docLabel: typeof title === 'string' && title.trim() !== '' ? title : null,
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
 * (populated at depth 1) for `MediaVideos`/`MediaDocuments`. Falls back to the
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

  if (collection === CollectionSlug.MediaVideos || collection === CollectionSlug.MediaDocuments) {
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
 * Collects every media asset that carries a credit line *and* is actually
 * referenced somewhere on the site, together with the documents referencing it.
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
  const sourceLabels = new Map<string, SourceLabel | null>()

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
    [
      ...idsByCollection.entries(),
    ].map(async ([collection, ids]) => {
      const needsThumbnailRelation =
        collection === CollectionSlug.MediaVideos || collection === CollectionSlug.MediaDocuments

      const { docs } = await payload.find({
        collection,
        where: {
          id: {
            in: [
              ...ids,
            ],
          },
        },
        select: {
          filename: true,
          credits: true,
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
        if (!hasCreditsContent(doc.credits)) continue

        const usages = new Map<string, MediaCreditUsage>()
        for (const reference of references) {
          if (reference.targetCollection !== collection) continue
          if (reference.targetId !== String(doc.id)) continue

          const source = sourceLabels.get(sourceKey(reference.sourceCollection, reference.sourceId))
          if (!source) continue

          // Globals have no per-doc title; collection docs show both their
          // type and title since the title alone can be ambiguous (e.g. a
          // Resume Document entry titled "Resume").
          const label = source.docLabel
            ? `${source.collectionLabel}: ${source.docLabel}`
            : source.collectionLabel

          usages.set(`${reference.sourceCollection}:${label}`, {
            collection: reference.sourceCollection,
            collectionLabel: source.collectionLabel,
            label,
          })
        }

        credits.push({
          id: String(doc.id),
          collection,
          filename: doc.filename ?? '',
          credits: doc.credits as DefaultTypedEditorState,
          thumbnailUrl: resolveThumbnailUrl(collection, doc),
          usages: [
            ...usages.values(),
          ].sort((a, b) => a.label.localeCompare(b.label)),
        })
      }
    }),
  )

  return credits.sort((a, b) => a.filename.localeCompare(b.filename))
}
