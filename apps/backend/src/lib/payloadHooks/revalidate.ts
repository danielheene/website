import type { Payload } from 'payload'

interface RevalidateCollectionChangeOptions {
  collection: string
  id: string
}

/**
 * Logs through Payload's logger when it is available.
 *
 * Collection hooks are frequently invoked with a stubbed payload in tests, so
 * the logger is treated as optional — a missing logger must not turn a
 * successful write into a failed one.
 */
const log = (payload: Payload, level: 'info' | 'warn' | 'error', message: string): void => {
  const logger = payload.logger as Partial<Record<'info' | 'warn' | 'error', (msg: string) => void>>

  logger[level]?.(message)
}

/**
 * Asks the frontend to drop the cached responses for a collection that just
 * changed in the backend.
 *
 * The two apps are deployed separately, so the backend cannot call
 * `revalidateTag()` on the frontend's cache directly. Instead it POSTs the
 * affected cache tags to the frontend's `/api/revalidate` route, which
 * authenticates the request with `REVALIDATE_SECRET` and revalidates them
 * there.
 *
 * Failures are swallowed on purpose: revalidation is a cache optimisation, not
 * part of the write. A frontend that is down (or a scheduled publish run by
 * the standalone jobs worker, which has no frontend to talk to) must not fail
 * the write itself — the cached reads simply pick the change up once their
 * `cacheLife` expires.
 */
export const revalidateCollectionChange = async (
  payload: Payload,
  { collection, id }: RevalidateCollectionChangeOptions,
): Promise<void> => {
  const frontendUrl = process.env.PAYLOAD_FRONTEND_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!frontendUrl || !secret) {
    log(
      payload,
      'warn',
      'Skipping revalidation: PAYLOAD_FRONTEND_URL or REVALIDATE_SECRET is not set',
    )

    return
  }

  try {
    const response = await fetch(new URL('/api/revalidate', frontendUrl), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'revalidate-secret': secret,
      },
      body: JSON.stringify({ tags: [collection, `${collection}:${id}`] }),
    })

    if (!response.ok) {
      log(
        payload,
        'error',
        `Revalidation request for ${collection}:${id} failed with status ${response.status}`,
      )
    }
  } catch (error) {
    log(
      payload,
      'error',
      `Revalidation request for ${collection}:${id} could not be delivered: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
