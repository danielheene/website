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
  /** Human-readable title of the referencing document. */
  label: string
}

export interface MediaCredit {
  id: string
  collection: MediaCollectionSlug
  filename: string
  credits: DefaultTypedEditorState
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

/**
 * Resolves the display title of a referencing document, honouring each
 * collection's own `useAsTitle` rather than assuming every collection uses
 * `title` (resume jobs use `employer`, skills use `name_label`, and so on).
 */
const resolveSourceLabel = async (
  payload: Payload,
  sourceCollection: string,
  sourceId: string,
  sourceType: string,
): Promise<string | null> => {
  if (sourceType === 'global') {
    const global = payload.config.globals.find(({ slug }) => slug === sourceCollection)
    return (global?.label as string) || sourceCollection
  }

  const collection = payload.config.collections.find(({ slug }) => slug === sourceCollection)
  if (!collection) return null

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

    const label = (doc as Record<string, unknown>)?.[titleField]
    return typeof label === 'string' && label.trim() !== '' ? label : null
  } catch {
    // The source document may have been deleted before its reference rows were
    // cleaned up; skip it rather than failing the whole credits list.
    return null
  }
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
  const sourceLabels = new Map<string, string | null>()

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
        },
        depth: 0,
        limit: 0,
        pagination: false,
      })

      for (const doc of docs) {
        if (!hasCreditsContent(doc.credits)) continue

        const usages = new Map<string, MediaCreditUsage>()
        for (const reference of references) {
          if (reference.targetCollection !== collection) continue
          if (reference.targetId !== String(doc.id)) continue

          const label = sourceLabels.get(sourceKey(reference.sourceCollection, reference.sourceId))
          if (!label) continue

          usages.set(label, {
            collection: reference.sourceCollection,
            label,
          })
        }

        credits.push({
          id: String(doc.id),
          collection,
          filename: doc.filename ?? '',
          credits: doc.credits as DefaultTypedEditorState,
          usages: [
            ...usages.values(),
          ].sort((a, b) => a.label.localeCompare(b.label)),
        })
      }
    }),
  )

  return credits.sort((a, b) => a.filename.localeCompare(b.filename))
}
