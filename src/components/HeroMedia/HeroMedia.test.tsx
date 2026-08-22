// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HeroMedia, toItems } from './HeroMedia'

vi.mock('./ShaderHeroBackground', () => ({
  ShaderHeroBackground: ({ presetKey }: { presetKey: string }) => (
    <div data-testid="shader-hero-background" data-preset={presetKey} />
  ),
}))

const image = {
  relationTo: 'images',
  value: {
    id: 'img-1',
    url: 'https://example.com/hero.webp',
    alt: 'A hero',
    blurDataURL: 'data:image/webp;base64,AAAA',
  },
}

const video = {
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
}

describe('toItems', () => {
  it('maps a populated image, preferring its own alt', () => {
    expect(
      toItems(
        [
          image,
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

  it('falls back to the supplied alt when the asset has none', () => {
    const [item] = toItems(
      [
        {
          ...image,
          value: {
            ...image.value,
            alt: '',
          },
        },
      ],
      'fallback',
    )

    expect(item.alt).toBe('fallback')
  })

  it('maps a video and lifts its thumbnail into a poster', () => {
    expect(
      toItems(
        [
          video,
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

  it('keeps mixed media in their authored order', () => {
    expect(
      toItems(
        [
          video,
          image,
        ],
        'fallback',
      ).map(({ kind }) => kind),
    ).toEqual([
      'video',
      'image',
    ])
  })

  it('accepts a single entry that is not an array', () => {
    expect(toItems(image, 'fallback')).toHaveLength(1)
  })

  /**
   * `hasMany: true` with `maxRows: 1` — the shape SiteSettings.errorHero uses.
   * The 404 page previously handed the array straight to a guard expecting a
   * single object, so the background never rendered.
   */
  it('unwraps a single-entry array from a hasMany field', () => {
    expect(
      toItems(
        [
          video,
        ],
        'fallback',
      ),
    ).toHaveLength(1)
  })

  /**
   * The field is `relationTo`; `referenceTo` is the references plugin's shape.
   * Confusing the two silently yields an empty hero, so it is pinned here.
   */
  it('ignores the referenceTo shape', () => {
    expect(
      toItems(
        [
          {
            referenceTo: 'images',
            value: image.value,
          },
        ],
        'fallback',
      ),
    ).toEqual([])
  })

  it('drops unpopulated relations, unknown collections, and empty input', () => {
    expect(
      toItems(
        [
          {
            relationTo: 'images',
            value: 'just-an-id',
          },
          {
            relationTo: 'documents',
            value: {
              id: 'doc-1',
              url: 'https://example.com/a.pdf',
            },
          },
          null,
          undefined,
        ],
        'fallback',
      ),
    ).toEqual([])

    expect(toItems(null, 'fallback')).toEqual([])
    expect(toItems([], 'fallback')).toEqual([])
  })

  it('drops an entry whose asset has no url', () => {
    expect(
      toItems(
        [
          {
            relationTo: 'images',
            value: {
              id: 'img-2',
              url: null,
            },
          },
        ],
        'fallback',
      ),
    ).toEqual([])
  })

  it('leaves the poster undefined when the thumbnail is unpopulated', () => {
    const [item] = toItems(
      [
        {
          ...video,
          value: {
            ...video.value,
            thumbnails: [
              {
                relationTo: 'images',
                value: 'thumb-id',
              },
            ],
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
  it('renders nothing visual when backgroundType is media with no media', () => {
    render(
      <HeroMedia
        background={{
          backgroundType: 'media',
          media: [],
        }}
      />,
    )

    expect(screen.queryByTestId('shader-hero-background')).not.toBeInTheDocument()
  })

  it('renders the shader background when backgroundType is shader', () => {
    render(
      <HeroMedia
        background={{
          backgroundType: 'shader',
          shader: 'darkveil',
        }}
      />,
    )

    const shaderEl = screen.getByTestId('shader-hero-background')
    expect(shaderEl).toBeInTheDocument()
    expect(shaderEl).toHaveAttribute('data-preset', 'darkveil')
  })

  it('does not render a shader background when backgroundType is shader but no shader is selected', () => {
    render(
      <HeroMedia
        background={{
          backgroundType: 'shader',
          shader: undefined,
        }}
      />,
    )

    expect(screen.queryByTestId('shader-hero-background')).not.toBeInTheDocument()
  })

  it('falls back to media rendering when background is legacy/undefined (pre-migration content)', () => {
    // Documents saved before this field existed have no `background` key at
    // all — only the old flat `media` shape. HeroMedia must not crash.
    render(<HeroMedia background={undefined} />)

    expect(screen.queryByTestId('shader-hero-background')).not.toBeInTheDocument()
  })
})
