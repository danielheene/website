import { afterEach, describe, expect, it, vi } from 'vitest'

const mockDraftMode = vi.fn()

vi.mock('next/headers', () => ({
  draftMode: mockDraftMode,
}))

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`)
})

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

const { GET } = await import('./route')

const draft = {
  enable: vi.fn(),
  disable: vi.fn(),
}

describe('GET /api/preview', () => {
  afterEach(() => {
    mockDraftMode.mockReset()
    mockRedirect.mockClear()
    draft.enable.mockClear()
    draft.disable.mockClear()
    vi.unstubAllEnvs()
  })

  it('rejects a missing path', async () => {
    mockDraftMode.mockResolvedValue(draft)

    const response = await GET(new Request('https://site.test/api/preview?secret=shhh'))

    expect(response.status).toBe(400)
    expect(draft.enable).not.toHaveBeenCalled()
  })

  it('rejects an absolute path (open-redirect protection)', async () => {
    mockDraftMode.mockResolvedValue(draft)

    const response = await GET(
      new Request(
        `https://site.test/api/preview?secret=shhh&path=${encodeURIComponent('https://evil.test')}`,
      ),
    )

    expect(response.status).toBe(400)
    expect(draft.enable).not.toHaveBeenCalled()
  })

  it('rejects a protocol-relative path (open-redirect protection)', async () => {
    mockDraftMode.mockResolvedValue(draft)

    const response = await GET(
      new Request(
        `https://site.test/api/preview?secret=shhh&path=${encodeURIComponent('//evil.test')}`,
      ),
    )

    expect(response.status).toBe(400)
    expect(draft.enable).not.toHaveBeenCalled()
  })

  it('rejects an invalid secret', async () => {
    vi.stubEnv('PREVIEW_SECRET', 'the-real-secret')
    mockDraftMode.mockResolvedValue(draft)

    const response = await GET(
      new Request('https://site.test/api/preview?secret=wrong&path=/about-me'),
    )

    expect(response.status).toBe(401)
    expect(draft.enable).not.toHaveBeenCalled()
  })

  it('rejects when no secret is configured', async () => {
    vi.stubEnv('PREVIEW_SECRET', '')
    mockDraftMode.mockResolvedValue(draft)

    const response = await GET(
      new Request('https://site.test/api/preview?secret=anything&path=/about-me'),
    )

    expect(response.status).toBe(401)
  })

  it('enables draft mode and redirects for a valid secret and relative path', async () => {
    vi.stubEnv('PREVIEW_SECRET', 'the-real-secret')
    mockDraftMode.mockResolvedValue(draft)

    await expect(
      GET(new Request('https://site.test/api/preview?secret=the-real-secret&path=/about-me')),
    ).rejects.toThrow('REDIRECT:/about-me')

    expect(draft.enable).toHaveBeenCalledOnce()
  })

  it('disables draft mode without requiring a secret', async () => {
    mockDraftMode.mockResolvedValue(draft)

    await expect(
      GET(new Request('https://site.test/api/preview?action=disable&path=/about-me')),
    ).rejects.toThrow('REDIRECT:/about-me')

    expect(draft.disable).toHaveBeenCalledOnce()
    expect(draft.enable).not.toHaveBeenCalled()
  })

  it('rejects disabling with an absolute path', async () => {
    mockDraftMode.mockResolvedValue(draft)

    const response = await GET(
      new Request(
        `https://site.test/api/preview?action=disable&path=${encodeURIComponent('https://evil.test')}`,
      ),
    )

    expect(response.status).toBe(400)
    expect(draft.disable).not.toHaveBeenCalled()
  })
})
