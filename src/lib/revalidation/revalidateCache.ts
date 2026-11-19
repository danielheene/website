import { revalidatePath, revalidateTag } from 'next/cache'

import { z } from 'zod'

import { createRevalidateToken } from './revalidateToken'

const isRelativePath = (path: string): boolean => path.startsWith('/') && !path.startsWith('//')

export const revalidateCacheSchema = z.object({
  tags: z.array(z.string().trim().min(1).max(256)).max(100).default([]),
  paths: z
    .array(z.string().trim().max(2048).refine(isRelativePath, 'Must be a same-site relative path'))
    .max(100)
    .default([]),
  /**
   * `max` serves stale content while refetching in the background; `immediate`
   * expires the entry so the next read blocks on fresh data.
   */
  profile: z.enum(['max', 'immediate']).default('max'),
})

export type RevalidateCacheOptions = z.input<typeof revalidateCacheSchema>

export const REVALIDATE_API_PATH = '/api/revalidate'

// Message of the invariant `revalidateTag`/`revalidatePath` throw without a Next request context.
const MISSING_NEXT_CONTEXT = 'static generation store missing'

/** Calls Next's revalidation APIs directly. Only works inside a Next request context. */
export const revalidateLocally = (options: RevalidateCacheOptions): void => {
  const { tags, paths, profile } = revalidateCacheSchema.parse(options)

  tags.forEach((tag) => revalidateTag(tag, profile === 'immediate' ? { expire: 0 } : 'max'))
  paths.forEach((path) => revalidatePath(path))
}

const revalidateRemotely = async (options: RevalidateCacheOptions): Promise<void> => {
  const response = await fetch(new URL(REVALIDATE_API_PATH, process.env.SERVER_URL), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${createRevalidateToken()}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(revalidateCacheSchema.parse(options)),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new Error(`${REVALIDATE_API_PATH} responded with ${response.status}`)
  }
}

/**
 * Revalidates cache tags and paths from anywhere: directly when running inside
 * Next, otherwise (the standalone jobs worker, Payload CLI scripts) through the
 * app's `/api/revalidate` endpoint.
 *
 * Never throws — a failed invalidation must not fail the write that triggered
 * it; cached reads still pick the change up once their cacheLife expires.
 * Resolves to whether the invalidation went through.
 */
export const revalidateCache = async (options: RevalidateCacheOptions): Promise<boolean> => {
  const { tags = [], paths = [] } = options

  if (tags.length === 0 && paths.length === 0) return true

  try {
    revalidateLocally(options)

    return true
  } catch (error) {
    if (!(error instanceof Error && error.message.includes(MISSING_NEXT_CONTEXT))) {
      console.error('Failed to revalidate cache', { tags, paths }, error)

      return false
    }
  }

  try {
    await revalidateRemotely(options)

    return true
  } catch (error) {
    console.error(`Failed to revalidate cache via ${REVALIDATE_API_PATH}`, { tags, paths }, error)

    return false
  }
}
