import { cache } from 'react'
import type { PayloadRequest } from 'payload'

import { CollectionSlug } from '@/types/collections'

/**
 * Ceiling on documents offered per collection. Options are preloaded rather
 * than searched, so this bounds the query — the failure mode is "entries
 * missing from the list", never an unbounded read. Swapping in a debounced
 * search endpoint later is contained to this module and the select's client
 * half.
 */
export const LINK_TARGET_OPTION_LIMIT = 200

export const LINK_TARGET_COLLECTIONS = [
  {
    slug: CollectionSlug.Pages,
    label: 'Pages',
  },
  {
    slug: CollectionSlug.BlogPosts,
    label: 'Blog Posts',
  },
  {
    slug: CollectionSlug.BlogTopics,
    label: 'Topics',
  },
] as const

export type LinkTargetOption = {
  label: string
  /** `${relationTo}:${id}` — react-select needs values unique across groups. */
  value: string
  relationTo: string
  /**
   * The bare document id. Named `docID` rather than `id` because Payload's
   * `ReactSelect` reserves `id` on options for its own bookkeeping.
   */
  docID: string
}

export type LinkTargetOptionGroup = {
  label: string
  options: LinkTargetOption[]
}

export const linkTargetOptionValue = (relationTo: string, id: string): string =>
  `${relationTo}:${id}`

/**
 * Every document an editor may link to, grouped by collection.
 *
 * Memoised on `req` so the two field server components that need it — the
 * target select and the label — share one set of queries per request.
 */
export const fetchLinkTargetOptions = cache(
  async (req: PayloadRequest): Promise<LinkTargetOptionGroup[]> =>
    Promise.all(
      LINK_TARGET_COLLECTIONS.map(async ({ slug, label }) => {
        const { docs } = await req.payload.find({
          collection: slug,
          depth: 0,
          limit: LINK_TARGET_OPTION_LIMIT,
          overrideAccess: false,
          req,
          select: {
            title: true,
            slug: true,
          },
          sort: 'title',
          user: req.user,
        })

        return {
          label,
          options: docs.map((doc) => {
            const id = String(doc.id)

            return {
              label: typeof doc.title === 'string' && doc.title ? doc.title : id,
              value: linkTargetOptionValue(slug, id),
              relationTo: slug,
              docID: id,
            }
          }),
        }
      }),
    ),
)
