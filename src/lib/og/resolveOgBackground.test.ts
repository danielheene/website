import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveOgBackground } from './resolveOgBackground'

// Under Vitest a PNG import is a bare string, not Next's `StaticImageData`.
vi.mock('@/components/HeroMedia/shaderPresets', () => ({
  SHADER_PRESET_MAP: {
    darkveil: {
      key: 'darkveil',
      thumbnail: {
        src: '/_next/static/media/darkveil.png',
      },
    },
  },
}))

const imageSlide = (url: string) => ({
  slideType: 'image',
  media: {
    relationTo: 'images',
    value: {
      id: 'img',
      url,
    },
  },
})

const videoSlide = (poster?: string) => ({
  slideType: 'video',
  media: {
    relationTo: 'videos',
    value: {
      id: 'vid',
      url: 'https://example.com/hero.mp4',
      thumbnails: poster
        ? [
            {
              relationTo: 'images',
              value: {
                url: poster,
              },
            },
          ]
        : [],
    },
  },
})

describe('resolveOgBackground', () => {
  beforeEach(() => {
    vi.stubEnv('SERVER_URL', 'https://daniel.heene.io')
  })

  it("uses the first slide's image", () => {
    expect(
      resolveOgBackground([
        imageSlide('https://daniel.heene.io/api/images/file/a.webp'),
        imageSlide('https://daniel.heene.io/api/images/file/b.webp'),
      ]),
    ).toBe('https://daniel.heene.io/api/images/file/a.webp')
  })

  it("uses a video's poster frame", () => {
    expect(resolveOgBackground([videoSlide('/api/images/file/poster.png')])).toBe(
      'https://daniel.heene.io/api/images/file/poster.png',
    )
  })

  it("uses a shader's thumbnail, made absolute", () => {
    expect(
      resolveOgBackground([
        {
          slideType: 'shader',
          shader: 'darkveil',
        },
      ]),
    ).toBe('https://daniel.heene.io/_next/static/media/darkveil.png')
  })

  it('falls back when the hero yields nothing, including a video without a poster', () => {
    const fallback = [imageSlide('https://daniel.heene.io/api/images/file/default.webp')]

    expect(resolveOgBackground(undefined, fallback)).toBe(
      'https://daniel.heene.io/api/images/file/default.webp',
    )
    expect(resolveOgBackground([videoSlide()], fallback)).toBe(
      'https://daniel.heene.io/api/images/file/default.webp',
    )
  })

  it('uses the bundled dither background when neither source has a still', () => {
    expect(resolveOgBackground([], [])).toBe('https://daniel.heene.io/og-background-fallback.webp')
  })
})
