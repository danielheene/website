import { timingSafeEqual } from 'node:crypto'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload, type PayloadRequest, type TypedUser } from 'payload'

import { CollectionSlugValue } from '@/types/collections'

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

export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({
    config: configPromise,
  })

  const url = req.url
  const { searchParams } = new URL(url)

  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as CollectionSlugValue
  const slug = searchParams.get('slug')
  const previewSecret = searchParams.get('previewSecret')

  if (!previewSecret || !matchesPreviewSecret(previewSecret)) {
    return new Response('You are not allowed to preview this page', {
      status: 403,
    })
  }

  if (!path || !collection || !slug) {
    return new Response('Insufficient search params', {
      status: 404,
    })
  }

  if (!path.startsWith('/')) {
    return new Response('This endpoint can only be used for relative previews', {
      status: 500,
    })
  }

  let user: TypedUser | null = null

  try {
    /**
     * `payload.auth()` resolves to `{ permissions, user }` — the result object
     * is truthy even for an anonymous request, so the user has to be pulled out
     * of it. Testing the result itself would let anyone holding the preview
     * secret enable draft mode, and draft reads run with `overrideAccess: true`.
     */
    ;({ user } = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    }))
  } catch (error) {
    payload.logger.error(
      {
        err: error,
      },
      'Error verifying token for live preview',
    )
    return new Response('You are not allowed to preview this page', {
      status: 403,
    })
  }

  const draft = await draftMode()

  if (!user) {
    draft.disable()
    return new Response('You are not allowed to preview this page', {
      status: 403,
    })
  }

  // You can add additional checks here to see if the user is allowed to preview this page

  draft.enable()

  redirect(path)
}
