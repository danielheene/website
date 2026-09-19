// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SelectMediaDrawer } from './SelectMediaDrawer'

const closeModalMock = vi.fn()
const usePayloadAPIMock = vi.fn()

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
  usePayloadAPI: (...args: unknown[]) => usePayloadAPIMock(...args),
}))

describe('SelectMediaDrawer', () => {
  it('fetches the images collection with a depth of 0', () => {
    usePayloadAPIMock.mockReturnValue([
      {
        data: {
          docs: [],
        },
        isLoading: false,
        isError: false,
      },
    ])

    render(<SelectMediaDrawer kind="image" onSelectAction={vi.fn()} slug="select-image" />)

    expect(usePayloadAPIMock).toHaveBeenCalledWith(
      '/api/images',
      expect.objectContaining({
        initialParams: expect.objectContaining({
          depth: 0,
        }),
      }),
    )
  })

  it('scopes the fetch to uploaded assets, excluding machine-generated ones', () => {
    usePayloadAPIMock.mockReturnValue([
      {
        data: {
          docs: [],
        },
        isLoading: false,
        isError: false,
      },
    ])

    render(<SelectMediaDrawer kind="image" onSelectAction={vi.fn()} slug="select-image" />)

    expect(usePayloadAPIMock).toHaveBeenCalledWith(
      '/api/images',
      expect.objectContaining({
        initialParams: expect.objectContaining({
          where: {
            generatorFlags: {
              not_in: expect.arrayContaining([
                'thumbnail',
                'resume-asset',
              ]),
            },
          },
        }),
      }),
    )

    const [, { initialParams }] = usePayloadAPIMock.mock.calls[0]
    // `unsplash-import` must stay outside the exclusion list — imported
    // photos are meant to show up here like any hand-uploaded image.
    expect(initialParams.where.generatorFlags.not_in).not.toContain('unsplash-import')
  })

  it('fetches the videos collection with a depth of 1 (needed to resolve the poster thumbnail)', () => {
    usePayloadAPIMock.mockReturnValue([
      {
        data: {
          docs: [],
        },
        isLoading: false,
        isError: false,
      },
    ])

    render(<SelectMediaDrawer kind="video" onSelectAction={vi.fn()} slug="select-video" />)

    expect(usePayloadAPIMock).toHaveBeenCalledWith(
      '/api/videos',
      expect.objectContaining({
        initialParams: expect.objectContaining({
          depth: 1,
        }),
      }),
    )
  })

  it('renders an image thumbnail from sizes.thumbnail.url and selects it on click', () => {
    const onSelectAction = vi.fn()
    const doc = {
      id: 'img-1',
      filename: 'hero.webp',
      sizes: {
        thumbnail: {
          url: 'https://example.com/hero-thumb.webp',
        },
      },
    }

    usePayloadAPIMock.mockReturnValue([
      {
        data: {
          docs: [
            doc,
          ],
        },
        isLoading: false,
        isError: false,
      },
    ])

    render(<SelectMediaDrawer kind="image" onSelectAction={onSelectAction} slug="select-image" />)

    const button = screen.getByRole('button', {
      name: 'hero.webp',
    })
    expect(button.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/hero-thumb.webp',
    )

    fireEvent.click(button)
    expect(onSelectAction).toHaveBeenCalledWith(doc)
    expect(closeModalMock).toHaveBeenCalledWith('select-image')
  })

  it("resolves a video's poster from its populated thumbnails relation", () => {
    const doc = {
      id: 'vid-1',
      filename: 'hero.mp4',
      thumbnails: [
        {
          relationTo: 'images',
          value: {
            id: 'thumb-1',
            url: 'https://example.com/poster.webp',
          },
        },
      ],
    }

    usePayloadAPIMock.mockReturnValue([
      {
        data: {
          docs: [
            doc,
          ],
        },
        isLoading: false,
        isError: false,
      },
    ])

    render(<SelectMediaDrawer kind="video" onSelectAction={vi.fn()} slug="select-video" />)

    const button = screen.getByRole('button', {
      name: 'hero.mp4',
    })
    expect(button.querySelector('img')).toHaveAttribute('src', 'https://example.com/poster.webp')
  })

  it("falls back to the doc's id as the label when filename is missing", () => {
    usePayloadAPIMock.mockReturnValue([
      {
        data: {
          docs: [
            {
              id: 'img-2',
            },
          ],
        },
        isLoading: false,
        isError: false,
      },
    ])

    render(<SelectMediaDrawer kind="image" onSelectAction={vi.fn()} slug="select-image" />)

    expect(
      screen.getByRole('button', {
        name: 'img-2',
      }),
    ).toBeInTheDocument()
  })

  it('shows a distinct empty message on a load error vs. a genuinely empty library', () => {
    usePayloadAPIMock.mockReturnValue([
      {
        data: undefined,
        isLoading: false,
        isError: true,
      },
    ])

    render(<SelectMediaDrawer kind="image" onSelectAction={vi.fn()} slug="select-image" />)

    expect(screen.getByText('Could not load the media library.')).toBeInTheDocument()
  })

  it('marks the currently-selected doc', () => {
    usePayloadAPIMock.mockReturnValue([
      {
        data: {
          docs: [
            {
              id: 'img-1',
              filename: 'a.webp',
            },
            {
              id: 'img-2',
              filename: 'b.webp',
            },
          ],
        },
        isLoading: false,
        isError: false,
      },
    ])

    render(
      <SelectMediaDrawer kind="image" onSelectAction={vi.fn()} slug="select-image" value="img-2" />,
    )

    expect(
      screen.getByRole('button', {
        name: 'a.webp',
      }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', {
        name: 'b.webp',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
