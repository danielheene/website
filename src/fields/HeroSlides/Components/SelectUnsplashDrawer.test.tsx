// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SelectUnsplashDrawer } from './SelectUnsplashDrawer'

const closeModalMock = vi.fn()
const searchPhotosMock = vi.fn()
const isUnsplashConfiguredMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  Drawer: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
  useModal: () => ({
    closeModal: closeModalMock,
  }),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
}))

vi.mock('@/lib/unsplash/searchPhotos', () => ({
  searchPhotos: (...args: unknown[]) => searchPhotosMock(...args),
}))

vi.mock('@/lib/unsplash/isConfigured', () => ({
  isUnsplashConfigured: () => isUnsplashConfiguredMock(),
}))

const result = {
  id: 'photo-1',
  thumbUrl: 'https://example.com/thumb.jpg',
  description: 'A mountain',
  photographerName: 'Jane Doe',
  photographerProfileUrl: 'https://unsplash.com/@janedoe',
  width: 800,
  height: 600,
}

describe('SelectUnsplashDrawer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    isUnsplashConfiguredMock.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('shows a configuration message when Unsplash is not configured', async () => {
    isUnsplashConfiguredMock.mockResolvedValue(false)

    render(
      <SelectUnsplashDrawer importingId={null} onSelectAction={vi.fn()} slug="import-unsplash" />,
    )

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByText(/Unsplash isn't configured/)).toBeInTheDocument()
  })

  it('debounces the search input and calls searchPhotos after 400ms', async () => {
    searchPhotosMock.mockResolvedValue({
      results: [
        result,
      ],
      total: 1,
      totalPages: 1,
    })

    render(
      <SelectUnsplashDrawer importingId={null} onSelectAction={vi.fn()} slug="import-unsplash" />,
    )

    await act(async () => {
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Search Unsplash'), {
      target: {
        value: 'mountain',
      },
    })

    expect(searchPhotosMock).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(400)
      await Promise.resolve()
    })

    expect(searchPhotosMock).toHaveBeenCalledWith({
      query: 'mountain',
      page: 1,
    })
    expect(
      screen.getByRole('button', {
        name: 'A mountain by Jane Doe',
      }),
    ).toBeInTheDocument()
  })

  it('selects a result, which closes the drawer via the shared shell', async () => {
    searchPhotosMock.mockResolvedValue({
      results: [
        result,
      ],
      total: 1,
      totalPages: 1,
    })
    const onSelectAction = vi.fn()

    render(
      <SelectUnsplashDrawer
        importingId={null}
        onSelectAction={onSelectAction}
        slug="import-unsplash"
      />,
    )

    await act(async () => {
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Search Unsplash'), {
      target: {
        value: 'mountain',
      },
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
      await Promise.resolve()
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'A mountain by Jane Doe',
      }),
    )

    expect(onSelectAction).toHaveBeenCalledWith(result)
    expect(closeModalMock).toHaveBeenCalledWith('import-unsplash')
  })

  it('disables every result while a different import is in flight', async () => {
    searchPhotosMock.mockResolvedValue({
      results: [
        result,
      ],
      total: 1,
      totalPages: 1,
    })

    render(
      <SelectUnsplashDrawer
        importingId="some-other-id"
        onSelectAction={vi.fn()}
        slug="import-unsplash"
      />,
    )

    await act(async () => {
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Search Unsplash'), {
      target: {
        value: 'mountain',
      },
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
      await Promise.resolve()
    })

    expect(
      screen.getByRole('button', {
        name: 'A mountain by Jane Doe',
      }),
    ).toBeDisabled()
  })

  it('shows the search error message when searchPhotos rejects', async () => {
    searchPhotosMock.mockRejectedValue(new Error('Unsplash search failed (500).'))

    render(
      <SelectUnsplashDrawer importingId={null} onSelectAction={vi.fn()} slug="import-unsplash" />,
    )

    await act(async () => {
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Search Unsplash'), {
      target: {
        value: 'mountain',
      },
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
      await Promise.resolve()
    })

    expect(screen.getByText('Unsplash search failed (500).')).toBeInTheDocument()
  })
})
