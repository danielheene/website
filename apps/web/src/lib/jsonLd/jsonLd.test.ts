import { describe, expect, it } from 'vitest'

import { generatePersonSchema } from './generatePersonSchema'
import { generateWebSiteSchema } from './generateWebSiteSchema'

describe('generateWebSiteSchema', () => {
  const general = (overrides: Record<string, unknown> = {}) =>
    ({
      general: {
        siteName: 'Site',
        siteURL: 'https://x.test',
        ...overrides,
      },
    }) as never

  it('builds the base schema', () => {
    expect(generateWebSiteSchema(general())).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Site',
      url: 'https://x.test',
    })
  })

  it('collapses newlines in the description', () => {
    expect(
      generateWebSiteSchema(
        general({
          description: 'line1\nline2\r\nline3',
        }),
      ).description,
    ).toBe('line1 line2 line3')
  })

  it('adds the image only for media image objects', () => {
    expect(
      generateWebSiteSchema(
        general({
          image: {
            mimeType: 'image/png',
            url: '/i.png',
          },
        }),
      ).image,
    ).toEqual({
      '@type': 'ImageObject',
      url: '/i.png',
    })
    expect(
      generateWebSiteSchema(
        general({
          image: 'plain-string',
        }),
      ),
    ).not.toHaveProperty('image')
  })
})

describe('generatePersonSchema', () => {
  const person = (overrides: Record<string, unknown> = {}) =>
    ({
      name: 'Daniel',
      ...overrides,
    }) as never

  it('builds a minimal schema', () => {
    expect(generatePersonSchema(person())).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Daniel',
    })
  })

  it('maps sameAs urls and worksFor', () => {
    const result = generatePersonSchema(
      person({
        sameAs: [
          {
            url: 'https://github.test',
          },
        ],
        worksFor: {
          name: 'Self',
          url: 'https://x.test',
        },
      }),
    )
    expect(result.sameAs).toEqual([
      'https://github.test',
    ])
    expect(result.worksFor).toEqual({
      '@type': 'Organization',
      name: 'Self',
      url: 'https://x.test',
    })
  })

  it('uses the regular portrait when it is a media image', () => {
    const result = generatePersonSchema(
      person({
        portrait: {
          regular: {
            mimeType: 'image/jpeg',
            url: '/regular.jpg',
          },
          duotone: {
            mimeType: 'image/jpeg',
            url: '/duotone.jpg',
          },
        },
      }),
    )
    expect(result.image).toEqual({
      '@type': 'ImageObject',
      url: '/regular.jpg',
    })
  })
})
