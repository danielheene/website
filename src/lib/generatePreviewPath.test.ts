import { describe, expect, it, vi } from 'vitest'

import { generatePreviewPath } from './generatePreviewPath'

describe('generatePreviewPath', () => {
  it('returns null for empty, null or undefined slugs', async () => {
    expect(await generatePreviewPath('pages', '')).toBeNull()
    expect(await generatePreviewPath('pages', null as unknown as string)).toBeNull()
    expect(await generatePreviewPath('pages', undefined as unknown as string)).toBeNull()
  })

  it('builds a preview path with all query params', async () => {
    vi.stubEnv('PREVIEW_SECRET', 'shhh')
    const result = await generatePreviewPath('posts', 'my-post')
    expect(result).not.toBeNull()

    const [pathname, query] = (result as string).split('?')
    expect(pathname).toBe('/api/preview')

    const params = new URLSearchParams(query)
    expect(params.get('slug')).toBe('my-post')
    expect(params.get('collection')).toBe('posts')
    expect(params.get('path')).toBe('/posts/my-post')
    expect(params.get('previewSecret')).toBe('shhh')
  })

  it('falls back to an empty preview secret', async () => {
    vi.stubEnv('PREVIEW_SECRET', '')
    const result = await generatePreviewPath('pages', 'about')
    const params = new URLSearchParams((result as string).split('?')[1])
    expect(params.get('previewSecret')).toBe('')
  })
})
