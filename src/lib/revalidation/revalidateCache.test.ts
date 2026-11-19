import { revalidatePath, revalidateTag } from 'next/cache'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidateCache } from './revalidateCache'
import { createRevalidateToken, isValidRevalidateToken } from './revalidateToken'

const missingNextContext = () => {
  throw new Error('Invariant: static generation store missing in revalidateTag posts')
}

describe('revalidateCache', () => {
  beforeEach(() => {
    vi.stubEnv('PAYLOAD_SECRET', 'payload-secret')
    vi.stubEnv('SERVER_URL', 'https://site.test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('revalidates in-process when a Next context is available', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(
      revalidateCache({
        tags: ['posts'],
        paths: ['/blog'],
      }),
    ).resolves.toBe(true)

    expect(revalidateTag).toHaveBeenCalledWith('posts', 'max')
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('expires tags immediately with the immediate profile', async () => {
    await revalidateCache({
      tags: ['resume-documents:latest'],
      profile: 'immediate',
    })

    expect(revalidateTag).toHaveBeenCalledWith('resume-documents:latest', { expire: 0 })
  })

  it('falls back to the API endpoint without a Next context', async () => {
    vi.mocked(revalidateTag).mockImplementationOnce(missingNextContext)
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ revalidated: true }))

    await expect(
      revalidateCache({
        tags: ['posts'],
        paths: ['/blog'],
      }),
    ).resolves.toBe(true)

    expect(fetchSpy).toHaveBeenCalledOnce()

    const [url, init] = fetchSpy.mock.calls[0]

    expect(String(url)).toBe('https://site.test/api/revalidate')
    expect(init?.method).toBe('POST')
    expect(new Headers(init?.headers).get('authorization')).toBe(
      `Bearer ${createRevalidateToken()}`,
    )
    expect(JSON.parse(String(init?.body))).toEqual({
      tags: ['posts'],
      paths: ['/blog'],
      profile: 'max',
    })
  })

  it('resolves false instead of throwing when the endpoint fails', async () => {
    vi.mocked(revalidateTag).mockImplementationOnce(missingNextContext)
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 500 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(revalidateCache({ tags: ['posts'] })).resolves.toBe(false)
  })

  it('does not call the endpoint for other revalidation errors', async () => {
    vi.mocked(revalidateTag).mockImplementationOnce(() => {
      throw new Error('revalidateTag cannot be called during render')
    })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(revalidateCache({ tags: ['posts'] })).resolves.toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('does nothing without tags or paths', async () => {
    await expect(revalidateCache({})).resolves.toBe(true)

    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('isValidRevalidateToken', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts the derived token and rejects anything else', () => {
    vi.stubEnv('PAYLOAD_SECRET', 'payload-secret')

    expect(isValidRevalidateToken(createRevalidateToken())).toBe(true)
    expect(isValidRevalidateToken('payload-secret')).toBe(false)
    expect(isValidRevalidateToken('')).toBe(false)
    expect(isValidRevalidateToken(null)).toBe(false)
  })

  it('rejects every token when PAYLOAD_SECRET is unset', () => {
    vi.stubEnv('PAYLOAD_SECRET', '')

    expect(isValidRevalidateToken('anything')).toBe(false)
  })
})
