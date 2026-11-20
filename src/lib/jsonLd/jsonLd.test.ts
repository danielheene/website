import { beforeEach, describe, expect, it, vi } from 'vitest'

import { generateBlogPosting } from './generateBlogPosting'
import { generateBreadcrumbList } from './generateBreadcrumbList'
import { generateDigitalDocument } from './generateDigitalDocument'
import { generateOccupation } from './generateOccupation'
import { generatePersonSchema } from './generatePersonSchema'
import { generateWebSiteSchema } from './generateWebSiteSchema'
import { jsonLdGraph } from './graph'
import { heroImageObjects, lexicalToText } from './imageObject'
import { toPostalAddress } from './postalAddress'
import {
  blogListingGraph,
  careerGraph,
  listedPostsGraph,
  pageGraph,
  postGraph,
  resumeDocumentGraph,
} from './routeGraphs'

const SITE = 'https://x.test'

const lexical = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text,
          },
        ],
      },
    ],
  },
})

const image = (overrides: Record<string, unknown> = {}) => ({
  id: 'img',
  url: '/api/images/file/a.jpg',
  mimeType: 'image/jpeg',
  width: 1600,
  height: 900,
  alt: 'Alt',
  ...overrides,
})

const imageSlide = (overrides: Record<string, unknown> = {}) => ({
  slideType: 'image',
  media: {
    relationTo: 'images',
    value: image(overrides),
  },
})

beforeEach(() => {
  vi.stubEnv('SERVER_URL', SITE)
})

describe('jsonLdGraph', () => {
  it('wraps nodes in one graph and skips missing ones', () => {
    expect(
      jsonLdGraph([
        {
          '@type': 'Thing',
          name: 'a',
        },
        undefined,
        false,
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Thing',
          name: 'a',
        },
      ],
    })
  })
})

describe('toPostalAddress', () => {
  const address = {
    street: 'Von-Sparr-Straße',
    number: '62',
    postCode: '51063',
    place: 'Cologne',
    countryCode: 'DE',
    region: 'North Rhine-Westphalia',
  }

  it('maps the backend fields to PostalAddress properties', () => {
    expect(toPostalAddress(address)).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Von-Sparr-Straße 62',
      postalCode: '51063',
      addressLocality: 'Cologne',
      addressRegion: 'North Rhine-Westphalia',
      addressCountry: 'DE',
    })
  })

  it('reads the English entry of a localized address', () => {
    expect(
      toPostalAddress({
        en: address,
        de: {
          ...address,
          place: 'Köln',
        },
      })?.addressLocality,
    ).toBe('Cologne')
  })

  it('returns undefined without any field', () => {
    expect(toPostalAddress({})).toBeUndefined()
    expect(toPostalAddress(null)).toBeUndefined()
  })
})

describe('lexicalToText', () => {
  it('flattens rich text to one line', () => {
    expect(lexicalToText(lexical('Hello\n  world'))).toBe('Hello world')
  })

  it('ignores values that are not rich text', () => {
    expect(lexicalToText('plain')).toBeUndefined()
    expect(lexicalToText(null)).toBeUndefined()
  })
})

describe('heroImageObjects', () => {
  it('turns populated image slides into ImageObjects with credits', () => {
    expect(
      heroImageObjects(
        [
          imageSlide({
            attribution: {
              authorName: 'Jane',
              authorURL: 'https://jane.test',
              studioName: 'Unsplash',
              license: 'unsplash',
            },
          }),
          {
            slideType: 'shader',
            shader: 'silk',
          },
          {
            slideType: 'image',
            media: {
              relationTo: 'images',
              value: 'unpopulated-id',
            },
          },
        ],
        SITE,
      ),
    ).toEqual([
      {
        '@type': 'ImageObject',
        url: 'https://x.test/api/images/file/a.jpg',
        contentUrl: 'https://x.test/api/images/file/a.jpg',
        width: {
          '@type': 'QuantitativeValue',
          value: 1600,
          unitCode: 'E37',
          unitText: 'px',
        },
        height: {
          '@type': 'QuantitativeValue',
          value: 900,
          unitCode: 'E37',
          unitText: 'px',
        },
        caption: 'Alt',
        creditText: 'Jane / Unsplash',
        creator: {
          '@type': 'Person',
          name: 'Jane',
          url: 'https://jane.test',
        },
        license: 'https://unsplash.com/license',
      },
    ])
  })
})

describe('generatePersonSchema', () => {
  const person = (overrides: Record<string, unknown> = {}) =>
    generatePersonSchema(
      {
        name: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        ...overrides,
      } as never,
      SITE,
    )

  it('identifies the person site-wide and names them', () => {
    expect(person()).toEqual({
      '@type': 'Person',
      '@id': 'https://x.test/#person',
      name: 'Jane Doe',
      givenName: 'Jane',
      familyName: 'Doe',
      url: SITE,
    })
  })

  it('never publishes the birth date or gender', () => {
    const schema = person({
      birthDate: '1988-04-17T12:00:00.000Z',
      gender: 'male',
    })

    expect(schema).not.toHaveProperty('birthDate')
    expect(schema).not.toHaveProperty('gender')
  })

  it('reads the portrait from the upload relation', () => {
    expect(
      person({
        portrait: {
          regular: {
            relationTo: 'images',
            value: image(),
          },
        },
      }).image,
    ).toMatchObject({
      '@type': 'ImageObject',
      url: 'https://x.test/api/images/file/a.jpg',
    })
  })

  it('falls back to the duotone portrait', () => {
    expect(
      person({
        portrait: {
          regular: null,
          duotone: {
            relationTo: 'images',
            value: image({
              url: '/duo.jpg',
            }),
          },
        },
      }).image,
    ).toMatchObject({
      url: 'https://x.test/duo.jpg',
    })
  })

  it('maps the address and contact details', () => {
    expect(
      person({
        email: 'jane@x.test',
        phoneNumber: {
          value: '+491234',
          uri: 'tel:+491234',
        },
        sameAs: [
          {
            url: 'https://github.com/jane',
          },
        ],
        address: {
          street: 'Main St',
          number: '1',
          countryCode: 'DE',
        },
      }),
    ).toMatchObject({
      email: 'jane@x.test',
      telephone: '+491234',
      sameAs: ['https://github.com/jane'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Main St 1',
        addressCountry: 'DE',
      },
    })
  })

  it('adds the employer only when it has a name', () => {
    expect(
      person({
        worksFor: {
          address: {
            en: {
              place: 'Cologne',
            },
          },
        },
      }),
    ).not.toHaveProperty('worksFor')
    expect(
      person({
        worksFor: {
          name: 'ACME',
          url: 'https://acme.test',
        },
      }).worksFor,
    ).toEqual({
      '@type': 'Organization',
      name: 'ACME',
      url: 'https://acme.test',
    })
  })
})

describe('generateWebSiteSchema', () => {
  const site = (overrides: Record<string, unknown> = {}) =>
    generateWebSiteSchema(
      {
        general: {
          siteName: 'Site',
          siteURL: SITE,
          ...overrides,
        },
      } as never,
      SITE,
    )

  it('is published by the person', () => {
    expect(site()).toEqual({
      '@type': 'WebSite',
      '@id': 'https://x.test/#website',
      name: 'Site',
      url: SITE,
      inLanguage: 'en',
      publisher: {
        '@id': 'https://x.test/#person',
      },
    })
  })

  it('collapses whitespace in the description', () => {
    expect(
      site({
        description: 'line1\nline2\r\n line3',
      }).description,
    ).toBe('line1 line2 line3')
  })

  it('takes the image from the first populated image slide', () => {
    expect(
      site({
        defaultOpengraphImage: [
          {
            slideType: 'shader',
            shader: 'silk',
          },
          imageSlide(),
        ],
      }).image,
    ).toEqual({
      '@type': 'ImageObject',
      url: 'https://x.test/api/images/file/a.jpg',
    })
  })
})

describe('generateBreadcrumbList', () => {
  it('numbers the trail and derives its id from the last page', () => {
    expect(
      generateBreadcrumbList([
        {
          name: 'Home',
          url: `${SITE}/`,
        },
        {
          name: 'Blog',
          url: `${SITE}/blog`,
        },
      ]),
    ).toEqual({
      '@type': 'BreadcrumbList',
      '@id': 'https://x.test/blog#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://x.test/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://x.test/blog',
        },
      ],
    })
  })
})

describe('generateBlogPosting', () => {
  it('links the author, publisher and blog, and derives section and keywords', () => {
    expect(
      generateBlogPosting({
        siteUrl: SITE,
        url: `${SITE}/blog/post/a`,
        headline: 'A',
        description: ' Desc ',
        datePublished: '2026-01-01',
        topics: ['Payload', 'Next.js'],
        wordCount: 1200,
        readingTime: 5.6,
      }),
    ).toEqual({
      '@type': 'BlogPosting',
      '@id': 'https://x.test/blog/post/a#article',
      url: 'https://x.test/blog/post/a',
      headline: 'A',
      description: 'Desc',
      datePublished: '2026-01-01',
      dateModified: '2026-01-01',
      inLanguage: 'en',
      mainEntityOfPage: {
        '@id': 'https://x.test/blog/post/a#webpage',
      },
      author: {
        '@id': 'https://x.test/#person',
      },
      publisher: {
        '@id': 'https://x.test/#person',
      },
      isPartOf: {
        '@id': 'https://x.test/blog#blog',
      },
      articleSection: 'Payload',
      keywords: 'Payload, Next.js',
      wordCount: 1200,
      timeRequired: 'PT6M',
    })
  })
})

describe('generateOccupation', () => {
  it('dates the occupation through the Role pattern', () => {
    expect(
      generateOccupation({
        name: 'Engineer',
        employer: 'ACME',
        startDate: '2020-10-01T12:00:00.000Z',
        endDate: '2021-10-01T12:00:00.000Z',
        responsibilities: ['Shipping'],
        skills: ['TypeScript'],
      }),
    ).toEqual({
      '@type': 'Role',
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Engineer',
        description: 'Engineer, ACME',
        responsibilities: ['Shipping'],
        skills: ['TypeScript'],
      },
      startDate: '2020-10-01',
      endDate: '2021-10-01',
    })
  })

  it('leaves an ongoing role open', () => {
    expect(
      generateOccupation({
        name: 'Engineer',
        startDate: '2024-01-01',
      }),
    ).not.toHaveProperty('endDate')
  })
})

describe('generateDigitalDocument', () => {
  it('lists one PDF encoding per language with its checksum', () => {
    expect(
      generateDigitalDocument({
        siteUrl: SITE,
        url: `${SITE}/resume/abc`,
        name: 'Resume',
        files: [
          {
            url: `${SITE}/en.pdf`,
            language: 'en',
            sha256: 'deadbeef',
            bytes: 2048,
          },
        ],
      }),
    ).toMatchObject({
      '@type': 'DigitalDocument',
      '@id': 'https://x.test/resume/abc#document',
      inLanguage: ['en'],
      encoding: [
        {
          '@type': 'MediaObject',
          contentUrl: 'https://x.test/en.pdf',
          encodingFormat: 'application/pdf',
          inLanguage: 'en',
          sha256: 'deadbeef',
          contentSize: '2048 B',
        },
      ],
    })
  })
})

describe('pageGraph', () => {
  it('makes the home page a profile of the person, without a breadcrumb', () => {
    const nodes = pageGraph({
      siteUrl: SITE,
      slug: 'home',
      title: 'Home',
    })

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({
      '@type': 'ProfilePage',
      '@id': 'https://x.test/#webpage',
      mainEntity: {
        '@id': 'https://x.test/#person',
      },
    })
  })

  it('gives other pages a breadcrumb home', () => {
    const [page, breadcrumb] = pageGraph({
      siteUrl: SITE,
      slug: 'legal-notice',
      title: 'Legal Notice',
      hero: {
        slides: [imageSlide()],
      },
    })

    expect(page).toMatchObject({
      '@type': 'WebPage',
      url: 'https://x.test/legal-notice',
      breadcrumb: {
        '@id': 'https://x.test/legal-notice#breadcrumb',
      },
      primaryImageOfPage: {
        url: 'https://x.test/api/images/file/a.jpg',
      },
    })
    expect(breadcrumb).toMatchObject({
      '@type': 'BreadcrumbList',
    })
  })

  it('makes the resume page a profile too', () => {
    expect(
      pageGraph({
        siteUrl: SITE,
        slug: 'resume',
        title: 'Resume',
        isProfile: true,
      })[0],
    ).toMatchObject({
      '@type': 'ProfilePage',
      mainEntity: {
        '@id': 'https://x.test/#person',
      },
    })
  })
})

describe('careerGraph', () => {
  it('adds occupations, skills and projects to the person', () => {
    const [person, projects] = careerGraph({
      siteUrl: SITE,
      jobs: [
        {
          employer: 'ACME',
          title: 'Engineer',
          startDate: '2020-01-01',
          tasks: [
            {
              task: lexical('Built things'),
            },
          ],
          skillTags: [
            {
              value: {
                title: 'TypeScript',
              },
            },
            {
              value: 'unpopulated-id',
            },
          ],
        },
      ],
      skillTags: [
        {
          title: 'TypeScript',
        },
        {
          title: 'React',
        },
      ],
      projects: [
        {
          title: 'Plugin',
          scope: 'Client',
          description: lexical('A plugin'),
          relatedPost: {
            value: {
              slug: 'plugin',
            },
          },
        },
      ],
    })

    expect(person).toMatchObject({
      '@type': 'Person',
      '@id': 'https://x.test/#person',
      knowsAbout: ['TypeScript', 'React'],
      hasOccupation: [
        {
          '@type': 'Role',
          hasOccupation: {
            name: 'Engineer',
            responsibilities: ['Built things'],
            skills: ['TypeScript'],
          },
        },
      ],
    })
    expect(projects).toMatchObject({
      '@type': 'ItemList',
      '@id': 'https://x.test/resume#projects',
      itemListElement: [
        {
          position: 1,
          item: {
            '@type': 'CreativeWork',
            name: 'Plugin',
            description: 'A plugin',
            url: 'https://x.test/blog/post/plugin',
            funder: {
              name: 'Client',
            },
          },
        },
      ],
    })
  })
})

describe('postGraph', () => {
  const ogImage = {
    '@type': 'ImageObject' as const,
    url: `${SITE}/api/og-image?collection=posts&slug=a`,
  }

  it('builds the page, the posting and a trail through the primary topic', () => {
    const [page, posting, breadcrumb] = postGraph({
      siteUrl: SITE,
      slug: 'a',
      title: 'A',
      excerpt: lexical('From the excerpt'),
      createdAt: '2026-01-01',
      topics: [
        {
          value: {
            title: 'Payload',
            slug: 'payload',
          },
        },
      ],
      ogImage,
    })

    expect(page).toMatchObject({
      '@type': 'WebPage',
      mainEntity: {
        '@id': 'https://x.test/blog/post/a#article',
      },
    })
    expect(posting).toMatchObject({
      '@type': 'BlogPosting',
      description: 'From the excerpt',
      articleSection: 'Payload',
      image: [ogImage],
    })
    expect(breadcrumb).toMatchObject({
      itemListElement: [
        {
          name: 'Home',
        },
        {
          name: 'Blog',
          item: 'https://x.test/blog',
        },
        {
          name: 'Payload',
          item: 'https://x.test/blog/payload',
        },
        {
          name: 'A',
          item: 'https://x.test/blog/post/a',
        },
      ],
    })
  })

  it('prefers the meta description over the excerpt', () => {
    expect(
      postGraph({
        siteUrl: SITE,
        slug: 'a',
        title: 'A',
        description: 'Meta',
        excerpt: lexical('Excerpt'),
        createdAt: '2026-01-01',
        ogImage,
      })[1],
    ).toMatchObject({
      description: 'Meta',
    })
  })
})

describe('blogListingGraph', () => {
  it('makes /blog a collection page about the blog', () => {
    const [page, blog, breadcrumb] = blogListingGraph({
      siteUrl: SITE,
      blogDescription: 'Writing',
    })

    expect(page).toMatchObject({
      '@type': 'CollectionPage',
      url: 'https://x.test/blog',
      description: 'Writing',
      mainEntity: {
        '@id': 'https://x.test/blog#blog',
      },
    })
    expect(blog).toMatchObject({
      '@type': 'Blog',
      '@id': 'https://x.test/blog#blog',
    })
    expect(breadcrumb).toMatchObject({
      itemListElement: [{}, {}],
    })
  })

  it('makes a topic page about its post list', () => {
    const [page] = blogListingGraph({
      siteUrl: SITE,
      topic: {
        slug: 'payload',
        title: 'Payload',
        content: lexical('About Payload'),
      },
    })

    expect(page).toMatchObject({
      name: 'Payload',
      description: 'About Payload',
      mainEntity: {
        '@id': 'https://x.test/blog/payload#posts',
      },
    })
  })
})

describe('listedPostsGraph', () => {
  const posts = [
    {
      slug: 'a',
      title: 'A',
      createdAt: '2026-01-01',
    },
  ]

  it('adds the posts to the blog on /blog', () => {
    expect(
      listedPostsGraph({
        siteUrl: SITE,
        posts,
      }),
    ).toMatchObject([
      {
        '@type': 'Blog',
        '@id': 'https://x.test/blog#blog',
        blogPost: [
          {
            '@type': 'BlogPosting',
            url: 'https://x.test/blog/post/a',
          },
        ],
      },
    ])
  })

  it('lists the posts under the topic page', () => {
    expect(
      listedPostsGraph({
        siteUrl: SITE,
        topicSlug: 'payload',
        posts,
      }),
    ).toMatchObject([
      {
        '@type': 'ItemList',
        '@id': 'https://x.test/blog/payload#posts',
        numberOfItems: 1,
      },
    ])
  })
})

describe('resumeDocumentGraph', () => {
  it('describes the PDFs that exist, under the resume page', () => {
    const [, document, breadcrumb] = resumeDocumentGraph({
      siteUrl: SITE,
      slug: 'abc',
      title: 'Resume 2026',
      description: 'Resume document',
      files: [
        {
          language: 'en',
          media: {
            url: '/en.pdf',
            mimeType: 'application/pdf',
            filesize: 10,
          },
          checksum: 'ff',
        },
        {
          language: 'de',
          media: null,
        },
      ],
    })

    expect(document).toMatchObject({
      '@type': 'DigitalDocument',
      inLanguage: ['en'],
      encoding: [
        {
          contentUrl: 'https://x.test/en.pdf',
          sha256: 'ff',
        },
      ],
    })
    expect(breadcrumb).toMatchObject({
      itemListElement: [
        {
          name: 'Home',
        },
        {
          name: 'Resume',
          item: 'https://x.test/resume',
        },
        {
          name: 'Resume 2026',
        },
      ],
    })
  })
})

describe('image uploads without a mimeType', () => {
  it('still yields the portrait and hero images', () => {
    const populated = {
      url: '/p.png',
      width: 10,
      height: 10,
    }

    expect(
      generatePersonSchema(
        {
          name: 'Jane',
          portrait: {
            regular: {
              relationTo: 'images',
              value: populated,
            },
          },
        } as never,
        SITE,
      ).image,
    ).toMatchObject({
      url: 'https://x.test/p.png',
    })
    expect(
      heroImageObjects(
        [
          {
            slideType: 'image',
            media: {
              relationTo: 'images',
              value: populated,
            },
          },
          {
            slideType: 'video',
            media: {
              relationTo: 'videos',
              value: populated,
            },
          },
        ],
        SITE,
      ),
    ).toHaveLength(1)
  })
})
