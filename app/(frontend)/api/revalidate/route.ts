import { z } from 'zod'

import { revalidateCacheSchema, revalidateLocally } from '@/lib/revalidation/revalidateCache'
import { isValidRevalidateToken } from '@/lib/revalidation/revalidateToken'

/**
 * Revalidates cache tags and paths on behalf of processes without a Next
 * context (the jobs worker), where `revalidateTag`/`revalidatePath` throw.
 * Called through `revalidateCache` — see `src/lib/revalidation/`.
 *
 * Body: `{ tags?: string[], paths?: string[], profile?: 'max' | 'immediate' }`
 */
export async function POST(request: Request): Promise<Response> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!isValidRevalidateToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body must be JSON' }, { status: 400 })
  }

  const parsed = revalidateCacheSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: z.prettifyError(parsed.error) }, { status: 400 })
  }

  revalidateLocally(parsed.data)

  return Response.json({
    revalidated: true,
    ...parsed.data,
  })
}
