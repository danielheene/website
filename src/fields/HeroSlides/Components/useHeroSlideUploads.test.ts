// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useHeroSlideUploads } from './useHeroSlideUploads'

const uploadHeroSlideMediaMock = vi.fn()
const importPhotoMock = vi.fn()
const toastErrorMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}))

vi.mock('@/lib/uploadHeroSlideMedia', () => ({
  uploadHeroSlideMedia: (...args: unknown[]) => uploadHeroSlideMediaMock(...args),
}))

// `importPhoto.ts` imports `@payload-config` at module scope, which pulls in
// the real payload.config.ts (and its Redis kv adapter) if not mocked here —
// mocking the module directly, the same way `uploadHeroSlideMedia` is mocked
// above, avoids evaluating that chain at all.
vi.mock('@/lib/unsplash/importPhoto', () => ({
  importPhoto: (...args: unknown[]) => importPhotoMock(...args),
}))

const buildMutators = () => ({
  addRow: vi.fn(),
  replaceRow: vi.fn(),
  removeRow: vi.fn(),
  setBackgroundProcessing: vi.fn(),
  cacheThumbnail: vi.fn(),
})

afterEach(() => {
  uploadHeroSlideMediaMock.mockReset()
  importPhotoMock.mockReset()
  toastErrorMock.mockReset()
})

const file = new File(
  [
    'x',
  ],
  'hero.png',
  {
    type: 'image/png',
  },
)

describe('useHeroSlideUploads', () => {
  it('adds a placeholder row and blocks the form before the upload resolves', () => {
    uploadHeroSlideMediaMock.mockReturnValue(
      new Promise(() => {
        /* never resolves within this test */
      }),
    )
    const mutators = buildMutators()

    const { result } = renderHook(() => useHeroSlideUploads(mutators))

    act(() => {
      void result.current.uploadFile('image', file, 2)
    })

    expect(mutators.setBackgroundProcessing).toHaveBeenCalledWith(true)
    expect(mutators.addRow).toHaveBeenCalledWith({
      rowIndex: 2,
      subFieldState: {
        slideType: {
          value: 'image',
          initialValue: 'image',
          valid: true,
        },
      },
    })
    expect(result.current.importingId).not.toBeNull()
  })

  it('replaces the placeholder with the real media relation and unblocks the form on success', async () => {
    uploadHeroSlideMediaMock.mockResolvedValue({
      id: 'img-1',
      kind: 'image',
      doc: {
        id: 'img-1',
      },
    })
    const mutators = buildMutators()

    const { result } = renderHook(() => useHeroSlideUploads(mutators))

    await act(async () => {
      await result.current.uploadFile('image', file, 0)
    })

    expect(mutators.replaceRow).toHaveBeenCalledWith({
      rowIndex: 0,
      subFieldState: {
        slideType: {
          value: 'image',
          initialValue: 'image',
          valid: true,
        },
        media: {
          value: {
            relationTo: 'images',
            value: 'img-1',
          },
          initialValue: {
            relationTo: 'images',
            value: 'img-1',
          },
          valid: true,
        },
      },
    })
    expect(mutators.cacheThumbnail).toHaveBeenCalledWith(
      {
        id: 'img-1',
      },
      'image',
    )
    expect(mutators.removeRow).not.toHaveBeenCalled()
    expect(mutators.setBackgroundProcessing).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(result.current.importingId).toBeNull())
  })

  it('uses the videos relation for a video upload', async () => {
    uploadHeroSlideMediaMock.mockResolvedValue({
      id: 'vid-1',
      kind: 'video',
      doc: {
        id: 'vid-1',
      },
    })
    const mutators = buildMutators()
    const { result } = renderHook(() => useHeroSlideUploads(mutators))

    await act(async () => {
      await result.current.uploadFile('video', file, 0)
    })

    expect(mutators.replaceRow).toHaveBeenCalledWith(
      expect.objectContaining({
        subFieldState: expect.objectContaining({
          media: expect.objectContaining({
            value: {
              relationTo: 'videos',
              value: 'vid-1',
            },
          }),
        }),
      }),
    )
    expect(mutators.cacheThumbnail).toHaveBeenCalledWith(
      {
        id: 'vid-1',
      },
      'video',
    )
  })

  it('rolls back the placeholder row and shows a toast when the upload fails', async () => {
    uploadHeroSlideMediaMock.mockRejectedValue(new Error('Upload failed.'))
    const mutators = buildMutators()

    const { result } = renderHook(() => useHeroSlideUploads(mutators))

    await act(async () => {
      await result.current.uploadFile('image', file, 1)
    })

    expect(mutators.removeRow).toHaveBeenCalledWith({
      rowIndex: 1,
    })
    expect(mutators.replaceRow).not.toHaveBeenCalled()
    expect(toastErrorMock).toHaveBeenCalledWith('Upload failed.')
    expect(mutators.setBackgroundProcessing).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(result.current.importingId).toBeNull())
  })

  it('imports an Unsplash photo as an image slide and blocks the form while it runs', () => {
    importPhotoMock.mockReturnValue(
      new Promise(() => {
        /* never resolves within this test */
      }),
    )
    const mutators = buildMutators()

    const { result } = renderHook(() => useHeroSlideUploads(mutators))

    act(() => {
      void result.current.importUnsplashPhoto('photo-1', 0)
    })

    expect(mutators.setBackgroundProcessing).toHaveBeenCalledWith(true)
    expect(mutators.addRow).toHaveBeenCalledWith({
      rowIndex: 0,
      subFieldState: {
        slideType: {
          value: 'image',
          initialValue: 'image',
          valid: true,
        },
      },
    })
  })

  it('replaces the placeholder with the imported image relation on success', async () => {
    importPhotoMock.mockResolvedValue({
      id: 'img-unsplash-1',
      url: '/media/unsplash.webp',
      alt: null,
      blurDataURL: null,
    })
    const mutators = buildMutators()

    const { result } = renderHook(() => useHeroSlideUploads(mutators))

    await act(async () => {
      await result.current.importUnsplashPhoto('photo-1', 0)
    })

    expect(importPhotoMock).toHaveBeenCalledWith({
      photoId: 'photo-1',
    })
    expect(mutators.replaceRow).toHaveBeenCalledWith({
      rowIndex: 0,
      subFieldState: {
        slideType: {
          value: 'image',
          initialValue: 'image',
          valid: true,
        },
        media: {
          value: {
            relationTo: 'images',
            value: 'img-unsplash-1',
          },
          initialValue: {
            relationTo: 'images',
            value: 'img-unsplash-1',
          },
          valid: true,
        },
      },
    })
    expect(mutators.cacheThumbnail).toHaveBeenCalledWith(
      {
        id: 'img-unsplash-1',
        url: '/media/unsplash.webp',
        alt: undefined,
        blurDataURL: undefined,
      },
      'image',
    )
    expect(mutators.setBackgroundProcessing).toHaveBeenLastCalledWith(false)
  })

  it('rolls back the placeholder and shows a toast when the Unsplash import fails', async () => {
    importPhotoMock.mockRejectedValue(new Error('Unsplash import failed.'))
    const mutators = buildMutators()

    const { result } = renderHook(() => useHeroSlideUploads(mutators))

    await act(async () => {
      await result.current.importUnsplashPhoto('photo-1', 3)
    })

    expect(mutators.removeRow).toHaveBeenCalledWith({
      rowIndex: 3,
    })
    expect(mutators.replaceRow).not.toHaveBeenCalled()
    expect(toastErrorMock).toHaveBeenCalledWith('Unsplash import failed.')
  })
})
