import { revalidatePath, revalidateTag } from 'next/cache'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createRevalidateToken } from '@/lib/revalidation/revalidateToken'

import { POST } from './route'

const request = (body: string, authorization = `Bearer ${createRevalidateToken()}`) => {
  const headers = new Headers({ 'content-type': 'application/json' })

  if (authorization) headers.set('authorization', authorization)

  return new Request('https://site.test/api/revalidate', {
    method: 'POST',
    headers,
    body,
  })
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.stubEnv('PAYLOAD_SECRET', 'payload-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects a missing token', async () => {
    const response = await POST(request(JSON.stringify({ tags: ['posts'] }), ''))

    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rejects a wrong token', async () => {
    const response = await POST(
      request(JSON.stringify({ tags: ['posts'] }), 'Bearer payload-secret'),
    )

    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rejects a body that is not JSON', async () => {
    const response = await POST(request('not json'))

    expect(response.status).toBe(400)
  })

  it('rejects paths that are not same-site relative', async () => {
    const response = await POST(request(JSON.stringify({ paths: ['//evil.test/blog'] })))

    expect(response.status).toBe(400)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidates the requested tags and paths', async () => {
    const response = await POST(
      request(
        JSON.stringify({
          tags: ['posts', 'resume-documents:latest'],
          paths: ['/blog'],
          profile: 'immediate',
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith('posts', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('resume-documents:latest', { expire: 0 })
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
  })
})
