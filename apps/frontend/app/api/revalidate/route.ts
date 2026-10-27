import { timingSafeEqual } from 'node:crypto'

import { revalidateTag } from 'next/cache'
import { type NextRequest } from 'next/server'

const matchesRevalidateSecret = (candidate: string): boolean => {
  const expected = Buffer.from(process.env.REVALIDATE_SECRET ?? '')
  const supplied = Buffer.from(candidate)

  if (expected.length === 0 || expected.length !== supplied.length) return false

  return timingSafeEqual(expected, supplied)
}

export async function POST(req: NextRequest): Promise<Response> {
  const secret = req.headers.get('revalidate-secret')

  if (!secret || !matchesRevalidateSecret(secret)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: { tags: string[] }

  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  if (!body || !Array.isArray(body.tags) || body.tags.length === 0) {
    return new Response('Missing tags array', { status: 400 })
  }

  for (const tag of body.tags) {
    revalidateTag(tag, 'max')
  }

  return new Response('Revalidated', { status: 200 })
}
