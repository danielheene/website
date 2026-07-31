import { describe, expect, it } from 'vitest'

import { generateBlog } from './generateBlog'
import { generateBlogPosting } from './generateBlogPosting'
import { generateBreadcrumbList } from './generateBreadcrumbList'
import { generateCollectionPage } from './generateCollectionPage'
import { generateCreativeWork } from './generateCreativeWork'
import { generateOccupation } from './generateOccupation'
import { generateOrganization } from './generateOrganization'
import { generatePersonSchema } from './generatePersonSchema'
import { generateSoftwareSourceCode } from './generateSoftwareSourceCode'
import { generateWebSiteSchema } from './generateWebSiteSchema'

describe('generateBreadcrumbList', () => {
  it('builds 1-indexed list items and omits item without url', () => {
    const result = generateBreadcrumbList([
      {
        name: 'Home',
        url: 'https://x.test',
      },
      {
        name: 'Current',
      },
    ])
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://x.test',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Current',
      },
    ])
  })
})

describe('generateBlog', () => {
  it('builds a minimal schema without optional fields', () => {
    const result = generateBlog({
      name: 'Blog',
      url: 'https://x.test/blog',
    })
    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog',
      url: 'https://x.test/blog',
    })
  })

  it('joins keywords and wraps the image', () => {
    const result = generateBlog({
      name: 'Blog',
      url: 'https://x.test/blog',
      description: 'desc',
      image: 'https://x.test/og.jpg',
      keywords: [
        'a',
        'b',
      ],
    })
    expect(result.keywords).toBe('a, b')
    expect(result.image).toEqual({
      '@type': 'ImageObject',
      url: 'https://x.test/og.jpg',
    })
  })

  it('omits keywords for an empty array', () => {
    expect(
      generateBlog({
        name: 'B',
        url: 'https://x.test',
        keywords: [],
      }),
    ).not.toHaveProperty('keywords')
  })
})

describe('generateBlogPosting', () => {
  const base = {
    headline: 'Post',
    url: 'https://x.test/blog/post',
    datePublished: '2026-01-01T00:00:00Z',
  }

  it('builds the required shape with mainEntityOfPage', () => {
    const result = generateBlogPosting(base)
    expect(result['@type']).toBe('BlogPosting')
    expect(result.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': base.url,
    })
    expect(result).not.toHaveProperty('author')
    expect(result).not.toHaveProperty('image')
  })

  it('maps the author with optional url', () => {
    expect(
      generateBlogPosting({
        ...base,
        author: {
          name: 'D',
        },
      }).author,
    ).toEqual({
      '@type': 'Person',
      name: 'D',
    })
    expect(
      generateBlogPosting({
        ...base,
        author: {
          name: 'D',
          url: 'https://x.test',
        },
      }).author,
    ).toEqual({
      '@type': 'Person',
      name: 'D',
      url: 'https://x.test',
    })
  })

  it('supports string and object images with px dimensions', () => {
    expect(
      generateBlogPosting({
        ...base,
        image: 'https://x.test/i.jpg',
      }).image,
    ).toEqual({
      '@type': 'ImageObject',
      url: 'https://x.test/i.jpg',
    })
    expect(
      generateBlogPosting({
        ...base,
        image: {
          url: 'https://x.test/i.jpg',
          width: 100,
          height: 50,
          alt: 'alt',
        },
      }).image,
    ).toEqual({
      '@type': 'ImageObject',
      url: 'https://x.test/i.jpg',
      width: '100px',
      height: '50px',
      caption: 'alt',
    })
  })

  it('maps audio to an AudioObject with contentUrl', () => {
    expect(
      generateBlogPosting({
        ...base,
        audio: {
          url: 'https://x.test/a.mp3',
          name: 'Audio',
        },
      }).audio,
    ).toEqual({
      '@type': 'AudioObject',
      contentUrl: 'https://x.test/a.mp3',
      name: 'Audio',
    })
  })
})

describe('generateCollectionPage', () => {
  it('builds the schema and omits an absent description', () => {
    const result = generateCollectionPage({
      name: 'Tag',
      url: 'https://x.test/t',
    })
    expect(result['@type']).toBe('CollectionPage')
    expect(result).not.toHaveProperty('description')
  })
})

describe('generateCreativeWork', () => {
  it('wraps the image and omits absent fields', () => {
    const result = generateCreativeWork({
      name: 'W',
      image: 'https://x.test/i.jpg',
    })
    expect(result.image).toEqual({
      '@type': 'ImageObject',
      url: 'https://x.test/i.jpg',
    })
    expect(result).not.toHaveProperty('url')
  })
})

describe('generateOccupation', () => {
  it('builds a minimal schema', () => {
    expect(
      generateOccupation({
        name: 'Engineer',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Occupation',
      name: 'Engineer',
    })
  })

  it('omits empty responsibility/skill arrays', () => {
    const result = generateOccupation({
      name: 'E',
      responsibilities: [],
      skills: [],
    })
    expect(result).not.toHaveProperty('responsibilities')
    expect(result).not.toHaveProperty('skills')
  })

  it('nests the employer as hiringOrganization and passes dates', () => {
    const result = generateOccupation({
      name: 'E',
      employer: 'ACME',
      startDate: '2020-01-01',
      endDate: '2022-01-01',
      responsibilities: [
        'r1',
      ],
      skills: [
        's1',
      ],
    }) as Record<string, unknown>
    expect(result.hiringOrganization).toEqual({
      '@type': 'Organization',
      name: 'ACME',
    })
    expect(result.startDate).toBe('2020-01-01')
    expect(result.endDate).toBe('2022-01-01')
    expect(result.responsibilities).toEqual([
      'r1',
    ])
    expect(result.skills).toEqual([
      's1',
    ])
  })
})

describe('generateOrganization', () => {
  it('wraps the logo as an ImageObject', () => {
    const result = generateOrganization({
      name: 'ACME',
      logo: 'https://x.test/l.png',
    })
    expect(result.logo).toEqual({
      '@type': 'ImageObject',
      url: 'https://x.test/l.png',
    })
  })
})

describe('generateSoftwareSourceCode', () => {
  it('builds a snippet schema with author and joined keywords', () => {
    const result = generateSoftwareSourceCode({
      name: 'Snippet',
      programmingLanguage: 'TypeScript',
      codeSampleType: 'code snippet',
      text: 'const a = 1',
      author: {
        name: 'D',
      },
      keywords: [
        'ts',
        'snippet',
      ],
    })
    expect(result['@type']).toBe('SoftwareSourceCode')
    expect(result.programmingLanguage).toBe('TypeScript')
    expect(result.author).toEqual({
      '@type': 'Person',
      name: 'D',
    })
    expect(result.keywords).toBe('ts, snippet')
  })

  it('omits absent optional fields', () => {
    const result = generateSoftwareSourceCode({
      name: 'Repo',
    })
    expect(result).not.toHaveProperty('codeRepository')
    expect(result).not.toHaveProperty('author')
  })
})

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
