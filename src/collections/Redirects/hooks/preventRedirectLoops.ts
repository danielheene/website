import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { CollectionSlug } from '@/types/collections'

/** Depth beyond which a redirect chain is treated as a loop. */
const MAX_CHAIN_DEPTH = 10

/**
 * Rejects redirects that point at themselves or close a cycle.
 *
 * Without this a single bad row can make a path unreachable and, because the
 * proxy follows chains, spin until the hop limit on every request.
 */
export const preventRedirectLoops: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const { payload } = req

  const from = typeof data.from === 'string' ? data.from : originalDoc?.from
  const type = data.type ?? originalDoc?.type
  const toPath = data.toPath ?? originalDoc?.toPath

  // document targets resolve at request time and cannot be validated here
  if (!from || type !== 'custom' || typeof toPath !== 'string' || !toPath) return data

  if (/^https?:\/\//i.test(toPath)) return data

  if (toPath === from) {
    throw new APIError('A redirect cannot point at its own source path.', 400, undefined, true)
  }

  // walk the chain from the new target; if it returns to `from`, adding this
  // row would close a cycle
  let current = toPath
  for (let hop = 0; hop < MAX_CHAIN_DEPTH; hop++) {
    const { docs } = await payload.find({
      collection: CollectionSlug.Redirects,
      where: {
        and: [
          {
            from: {
              equals: current,
            },
          },
          {
            enabled: {
              equals: true,
            },
          },
        ],
      },
      limit: 1,
      pagination: false,
      depth: 0,
      // joins the caller's transaction so chain checks see pending writes
      req,
    })

    const next = docs[0]
    if (!next || next.type !== 'custom' || typeof next.toPath !== 'string') return data

    if (next.toPath === from) {
      throw new APIError(
        `This redirect would create a loop: ${from} → ${toPath} → … → ${from}.`,
        400,
        undefined,
        true,
      )
    }

    current = next.toPath
  }

  throw new APIError(
    `Redirect chain from ${from} exceeds ${MAX_CHAIN_DEPTH} hops; it is probably a loop.`,
    400,
    undefined,
    true,
  )
}
