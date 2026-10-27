import { timingSafeEqual } from 'node:crypto'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { CollectionSlugValue } from '@website/types/collections'

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

  let user: unknown = null

  try {
    const baseUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3100'

    const authRes = await fetch(`${baseUrl}/api/users/me`, {
      headers: req.headers,
      cache: 'no-store',
    })

    if (authRes.ok) {
      const data = await authRes.json()
      user = data?.user ?? data
    }
  } catch (error) {
    console.error('Error verifying token for live preview', error)

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
