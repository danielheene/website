// @vitest-environment jsdom
import type { ArrayFieldClientProps } from 'payload'

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useHeroSlideFieldEditor } from './useHeroSlideFieldEditor'

type Row = {
  id: string
}
type FieldStateStub = Record<
  string,
  {
    value?: unknown
  }
>

const fieldProps = {
  field: {
    name: 'slides',
  },
  path: 'hero.slides',
  schemaPath: 'hero.slides',
} as unknown as ArrayFieldClientProps

// Mutable state mutated in place per test — the established pattern for this
// field's tests (see `SlideThumb.test.tsx`), since `vi.mock`'s hoisted
// factory closes over the reference once.
let rows: Row[] = []
const formFields: FieldStateStub = {}

const setFormFields = (next: FieldStateStub) => {
  for (const key of Object.keys(formFields)) delete formFields[key]
  Object.assign(formFields, next)
}

const addFieldRowMock = vi.fn()
const replaceFieldRowMock = vi.fn()
const removeFieldRowMock = vi.fn()
const moveFieldRowMock = vi.fn()
const setBackgroundProcessingMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  useField: () => ({
    path: 'hero.slides',
    rows,
  }),
  useForm: () => ({
    addFieldRow: addFieldRowMock,
    moveFieldRow: moveFieldRowMock,
    removeFieldRow: removeFieldRowMock,
    replaceFieldRow: replaceFieldRowMock,
    setBackgroundProcessing: setBackgroundProcessingMock,
  }),
  useFormFields: (
    selector: (
      args: [
        FieldStateStub,
      ],
    ) => unknown,
  ) =>
    selector([
      formFields,
    ]),
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('@/lib/uploadHeroSlideMedia', () => ({
  uploadHeroSlideMedia: vi.fn(),
}))

vi.mock('@/lib/unsplash/importPhoto', () => ({
  importPhoto: vi.fn(),
}))

const fetchMock = vi.fn()

describe('useHeroSlideFieldEditor', () => {
  beforeEach(() => {
    rows = []
    setFormFields({})
    addFieldRowMock.mockClear()
    replaceFieldRowMock.mockClear()
    removeFieldRowMock.mockClear()
    moveFieldRowMock.mockClear()
    setBackgroundProcessingMock.mockClear()
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      ok: false,
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  it('hydrates the thumbnail cache for a row already on the document at first load (a bare id, never inserted this session)', async () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'images',
          value: 'img-1',
        },
      },
    })
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'img-1',
        url: 'https://example.com/hero.webp',
      }),
    })

    const { result } = renderHook(() => useHeroSlideFieldEditor(fieldProps))

    await waitFor(() =>
      expect(result.current.thumbnailCache['img-1']).toEqual({
        url: 'https://example.com/hero.webp',
      }),
    )

    expect(fetchMock).toHaveBeenCalledWith('/api/images/img-1?depth=0')
  })

  it('hydrates a video row at depth=1 (needed to resolve the poster thumbnail)', async () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'video',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'videos',
          value: 'vid-1',
        },
      },
    })
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'vid-1',
        thumbnails: [
          {
            relationTo: 'images',
            value: {
              url: 'https://example.com/poster.webp',
            },
          },
        ],
      }),
    })

    const { result } = renderHook(() => useHeroSlideFieldEditor(fieldProps))

    await waitFor(() => expect(result.current.thumbnailCache['vid-1']).toBeDefined())

    expect(fetchMock).toHaveBeenCalledWith('/api/videos/vid-1?depth=1')
  })

  it('keeps the optimistic cache entry from insertImage rather than letting a stale hydration fetch clobber it', async () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'images',
          value: 'img-1',
        },
      },
    })

    const { result, rerender } = renderHook(() => useHeroSlideFieldEditor(fieldProps))

    act(() => {
      result.current.insertImage(0, {
        id: 'img-1',
        url: 'https://example.com/hero.webp',
      } as never)
    })

    rerender()

    await waitFor(() =>
      expect(result.current.thumbnailCache['img-1']).toEqual({
        url: 'https://example.com/hero.webp',
      }),
    )
  })

  it('never fetches for a shader row (no media relation to hydrate)', async () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'shader',
      },
      'hero.slides.0.shader': {
        value: 'darkveil',
      },
    })

    renderHook(() => useHeroSlideFieldEditor(fieldProps))

    await Promise.resolve()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not populate the cache when the fetch fails, leaving the row resolvable as empty rather than throwing', async () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'images',
          value: 'img-missing',
        },
      },
    })
    fetchMock.mockResolvedValue({
      ok: false,
    })

    const { result } = renderHook(() => useHeroSlideFieldEditor(fieldProps))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(result.current.thumbnailCache['img-missing']).toBeUndefined()
  })
})
