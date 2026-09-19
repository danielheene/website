import { describe, expect, it } from 'vitest'

import { toSlideItems } from './toSlideItems'

const imageRow = (url: string) => ({
  slideType: 'image' as const,
  media: {
    relationTo: 'images',
    value: {
      id: 'img-1',
      url,
      alt: 'An image',
    },
  },
})

const videoRow = (url: string, posterUrl?: string) => ({
  slideType: 'video' as const,
  media: {
    relationTo: 'videos',
    value: {
      id: 'vid-1',
      url,
      thumbnails: posterUrl
        ? [
            {
              value: {
                url: posterUrl,
              },
            },
          ]
        : [],
    },
  },
})

describe('toSlideItems', () => {
  it('keeps an http(s) image url', () => {
    const items = toSlideItems(
      [
        imageRow('https://cdn.example.test/photo.jpg'),
      ],
      '',
    )

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      kind: 'image',
      url: 'https://cdn.example.test/photo.jpg',
    })
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
  ])('drops an image whose url uses the unsafe scheme %s', (url) => {
    const items = toSlideItems(
      [
        imageRow(url),
      ],
      '',
    )

    expect(items).toHaveLength(0)
  })

  it('keeps an http(s) video url and poster', () => {
    const items = toSlideItems(
      [
        videoRow('https://cdn.example.test/clip.mp4', 'https://cdn.example.test/poster.jpg'),
      ],
      '',
    )

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      kind: 'video',
      url: 'https://cdn.example.test/clip.mp4',
      poster: 'https://cdn.example.test/poster.jpg',
    })
  })

  it('drops a video whose url uses an unsafe scheme', () => {
    const items = toSlideItems(
      [
        videoRow('javascript:alert(1)'),
      ],
      '',
    )

    expect(items).toHaveLength(0)
  })

  it('keeps the video but strips a poster using an unsafe scheme', () => {
    const items = toSlideItems(
      [
        videoRow('https://cdn.example.test/clip.mp4', 'javascript:alert(1)'),
      ],
      '',
    )

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      kind: 'video',
      url: 'https://cdn.example.test/clip.mp4',
      poster: undefined,
    })
  })
})
