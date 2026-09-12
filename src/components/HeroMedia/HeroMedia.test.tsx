// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HeroMedia } from './HeroMedia'
import { toSlideItems } from './toSlideItems'

vi.mock('./ShaderHeroBackground', () => ({
  ShaderHeroBackground: ({ presetKey }: { presetKey: string }) => (
    <div data-testid="shader-hero-background" data-preset={presetKey} />
  ),
}))

// Embla touches browser APIs jsdom doesn't implement; HeroCarousel's own
// behavior (autoplay, video hand-off, fade timing) is exercised separately —
// here only HeroMedia's single-slide-vs-carousel branching is under test.
vi.mock('./HeroCarousel', () => ({
  HeroCarousel: ({
    items,
  }: {
    items: {
      kind: string
    }[]
  }) => (
    <div
      data-testid="hero-carousel"
      data-count={items.length}
      data-kinds={items.map((item) => item.kind).join(',')}
    />
  ),
}))

const imageSlide = {
  slideType: 'image',
  media: {
    relationTo: 'images',
    value: {
      id: 'img-1',
      url: 'https://example.com/hero.webp',
      alt: 'A hero',
      blurDataURL: 'data:image/webp;base64,AAAA',
    },
  },
}

const videoSlide = {
  slideType: 'video',
  media: {
    relationTo: 'videos',
    value: {
      id: 'vid-1',
      url: 'https://example.com/hero.mp4',
      thumbnails: [
        {
          relationTo: 'images',
          value: {
            id: 'thumb-1',
            url: 'https://example.com/poster.webp',
          },
        },
      ],
    },
  },
}

const shaderSlide = {
  slideType: 'shader',
  shader: 'darkveil',
}

describe('toSlideItems', () => {
  it('maps a populated image slide, preferring its own alt', () => {
    expect(
      toSlideItems(
        [
          imageSlide,
        ],
        'fallback',
      ),
    ).toEqual([
      {
        kind: 'image',
        id: 'img-1',
        url: 'https://example.com/hero.webp',
        alt: 'A hero',
        blurDataURL: 'data:image/webp;base64,AAAA',
      },
    ])
  })

  it('falls back to the supplied alt when the image asset has none', () => {
    const [item] = toSlideItems(
      [
        {
          ...imageSlide,
          media: {
            ...imageSlide.media,
            value: {
              ...imageSlide.media.value,
              alt: '',
            },
          },
        },
      ],
      'fallback',
    )

    expect(item.kind).toBe('image')
    expect(
      (
        item as {
          alt: string
        }
      ).alt,
    ).toBe('fallback')
  })

  it('maps a video slide and lifts its thumbnail into a poster', () => {
    expect(
      toSlideItems(
        [
          videoSlide,
        ],
        'fallback',
      ),
    ).toEqual([
      {
        kind: 'video',
        id: 'vid-1',
        url: 'https://example.com/hero.mp4',
        alt: 'fallback',
        poster: 'https://example.com/poster.webp',
      },
    ])
  })

  it('maps a shader slide', () => {
    expect(
      toSlideItems(
        [
          shaderSlide,
        ],
        'fallback',
      ),
    ).toEqual([
      {
        kind: 'shader',
        id: '0',
        presetKey: 'darkveil',
      },
    ])
  })

  it('drops a shader slide with no preset selected', () => {
    expect(
      toSlideItems(
        [
          {
            slideType: 'shader',
          },
        ],
        'fallback',
      ),
    ).toEqual([])
  })

  it('keeps mixed slide kinds in their authored order', () => {
    expect(
      toSlideItems(
        [
          videoSlide,
          imageSlide,
          shaderSlide,
        ],
        'fallback',
      ).map(({ kind }) => kind),
    ).toEqual([
      'video',
      'image',
      'shader',
    ])
  })

  it('drops unpopulated relations, unknown collections, and empty input', () => {
    expect(
      toSlideItems(
        [
          {
            slideType: 'image',
            media: {
              relationTo: 'images',
              value: 'just-an-id',
            },
          },
          {
            slideType: 'image',
            media: {
              relationTo: 'documents',
              value: {
                id: 'doc-1',
                url: 'https://example.com/a.pdf',
              },
            },
          },
          null,
          undefined,
        ],
        'fallback',
      ),
    ).toEqual([])

    expect(toSlideItems(null, 'fallback')).toEqual([])
    expect(toSlideItems([], 'fallback')).toEqual([])
    expect(toSlideItems(undefined, 'fallback')).toEqual([])
  })

  it('ignores the referenceTo shape', () => {
    expect(
      toSlideItems(
        [
          {
            slideType: 'image',
            media: {
              referenceTo: 'images',
              value: imageSlide.media.value,
            },
          },
        ],
        'fallback',
      ),
    ).toEqual([])
  })

  it('drops a slide whose image asset has no url', () => {
    expect(
      toSlideItems(
        [
          {
            slideType: 'image',
            media: {
              relationTo: 'images',
              value: {
                id: 'img-2',
                url: null,
              },
            },
          },
        ],
        'fallback',
      ),
    ).toEqual([])
  })

  it('leaves the poster undefined when the video thumbnail is unpopulated', () => {
    const [item] = toSlideItems(
      [
        {
          ...videoSlide,
          media: {
            ...videoSlide.media,
            value: {
              ...videoSlide.media.value,
              thumbnails: [
                {
                  relationTo: 'images',
                  value: 'thumb-id',
                },
              ],
            },
          },
        },
      ],
      'fallback',
    )

    expect(item).toMatchObject({
      kind: 'video',
      poster: undefined,
    })
  })
})

describe('HeroMedia', () => {
  it('renders nothing visual when slides is empty', () => {
    render(<HeroMedia slides={[]} />)

    expect(screen.queryByTestId('shader-hero-background')).not.toBeInTheDocument()
  })

  it('renders a single shader slide directly (no carousel)', () => {
    render(
      <HeroMedia
        slides={[
          shaderSlide,
        ]}
      />,
    )

    const shaderEl = screen.getByTestId('shader-hero-background')
    expect(shaderEl).toBeInTheDocument()
    expect(shaderEl).toHaveAttribute('data-preset', 'darkveil')
  })

  it('renders a carousel when there are two or more slides', () => {
    render(
      <HeroMedia
        slides={[
          imageSlide,
          shaderSlide,
        ]}
      />,
    )

    const carousel = screen.getByTestId('hero-carousel')
    expect(carousel).toHaveAttribute('data-count', '2')
    expect(carousel).toHaveAttribute('data-kinds', 'image,shader')
  })

  it('renders nothing visual when the only slide has no usable asset', () => {
    render(
      <HeroMedia
        slides={[
          {
            slideType: 'shader',
          },
        ]}
      />,
    )

    expect(screen.queryByTestId('shader-hero-background')).not.toBeInTheDocument()
  })

  it('falls back to nothing visual when slides is legacy/undefined (pre-migration content)', () => {
    // Documents saved before this field existed have no `hero.slides` key at
    // all — only the old flat `hero.background` shape. HeroMedia must not crash.
    render(<HeroMedia slides={undefined} />)

    expect(screen.queryByTestId('shader-hero-background')).not.toBeInTheDocument()
  })
})
