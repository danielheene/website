import type { Payload } from 'payload'

import { normalizeRedirectPath } from '@/collections/Redirects/hooks/normalizeFromPath'
import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionSlug } from '@/types/collections'

/** Maximum hops followed before a chain is abandoned. */
const MAX_HOPS = 5

export interface ResolvedRedirect {
  /** Destination path or absolute URL. */
  destination: string
  /** HTTP status to respond with. */
  statusCode: number
}

/** Resolves a redirect row to its destination, or null when it has none. */
const destinationFor = (redirect: Record<string, unknown>): string | null => {
  if (redirect.type === 'custom') {
    return typeof redirect.toPath === 'string' && redirect.toPath ? redirect.toPath : null
  }

  const target = redirect.toDocument as
    | {
        relationTo?: string
        value?: unknown
      }
    | undefined

  if (!target?.relationTo || !target.value) return null

  // resolving through the document keeps the target correct after a rename
  const document = target.value as
    | {
        slug?: string
      }
    | string

  if (typeof document === 'string' || !document?.slug) return null

  return generateContentPath(target.relationTo, document.slug)
}

/**
 * Looks up a redirect for `pathname`, following chains so a path that was
 * moved twice still lands on the final destination in one response.
 *
 * Returns null when nothing matches, which is the common case — callers should
 * treat that as "continue normally".
 */
export const resolveRedirect = async ({
  payload,
  pathname,
}: {
  payload: Payload
  pathname: string
}): Promise<ResolvedRedirect | null> => {
  let current = normalizeRedirectPath(pathname)
  let statusCode = 301
  let resolved: string | null = null

  const seen = new Set<string>([
    current,
  ])

  for (let hop = 0; hop < MAX_HOPS; hop++) {
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
      depth: 1,
    })

    const redirect = docs[0]
    if (!redirect) break

    const destination = destinationFor(redirect as unknown as Record<string, unknown>)
    if (!destination) break

    resolved = destination
    statusCode = Number.parseInt(String(redirect.statusCode ?? '301'), 10) || 301

    // external targets and cycles end the walk
    if (/^https?:\/\//i.test(destination)) break

    const next = normalizeRedirectPath(destination)
    if (seen.has(next)) break

    seen.add(next)
    current = next
  }

  if (!resolved) return null

  return {
    destination: resolved,
    statusCode,
  }
}
