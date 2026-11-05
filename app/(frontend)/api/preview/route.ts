import { timingSafeEqual } from 'node:crypto'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Compares the supplied secret in constant time, so the endpoint does not leak
 * the expected value one character at a time through response timing.
 * `timingSafeEqual` requires equal-length buffers, hence the length check.
 */
const matchesPreviewSecret = (candidate: string): boolean => {
  const expected = Buffer.from(process.env.PREVIEW_SECRET ?? '')
  const supplied = Buffer.from(candidate)

  if (expected.length === 0 || expected.length !== supplied.length) return false

  return timingSafeEqual(expected, supplied)
}

/** Rejects anything but a same-site relative path, so `redirect()` can't be turned into an open redirect. */
const isRelativePath = (path: string): boolean => path.startsWith('/') && !path.startsWith('//')

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)

  const path = searchParams.get('path')
  const action = searchParams.get('action')

  if (!path || !isRelativePath(path)) {
    return new Response('Missing or invalid path parameter', { status: 400 })
  }

  if (action === 'disable') {
    const draft = await draftMode()
    draft.disable()

    redirect(path)
  }

  const secret = searchParams.get('secret')

  if (!secret || !matchesPreviewSecret(secret)) {
    return new Response('Invalid token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
