import { describe, expect, it } from 'vitest'

import { ogImageUrl, ogTargetFromPath, ogTargetFromSearchParams } from './ogTarget'

describe('ogTargetFromPath', () => {
  it.each([
    ['/', { collection: 'pages', slug: 'home' }],
    ['', { collection: 'pages', slug: 'home' }],
    ['/legal-notice', { collection: 'pages', slug: 'legal-notice' }],
    ['/resume', { collection: 'pages', slug: 'resume' }],
    ['/resume/latest', { collection: 'resume-documents', slug: 'latest' }],
    ['/blog', { listing: 'blog' }],
    ['/blog/', { listing: 'blog' }],
    ['/blog/payload-cms', { collection: 'topics', slug: 'payload-cms' }],
    ['/blog/post/my-post', { collection: 'posts', slug: 'my-post' }],
    ['/blog/post/my-post?ref=x#top', { collection: 'posts', slug: 'my-post' }],
  ])('%s', (path, target) => {
    expect(ogTargetFromPath(path)).toEqual(target)
  })

  it.each(['/blog/post', '/blog/post/a/b', '/blog/topic/extra', '/legal/notice', '/a/b/c/d'])(
    'rejects %s',
    (path) => {
      expect(ogTargetFromPath(path)).toBeNull()
    },
  )
})

describe('ogTargetFromSearchParams', () => {
  const read = (query: string) => ogTargetFromSearchParams(new URLSearchParams(query))

  it('prefers path', () => {
    expect(read('path=/blog/post/a&collection=pages&slug=b')).toEqual({
      collection: 'posts',
      slug: 'a',
    })
  })

  it('reads collection and slug', () => {
    expect(read('collection=topics&slug=payload-cms')).toEqual({
      collection: 'topics',
      slug: 'payload-cms',
    })
  })

  it('defaults pages to the home page', () => {
    expect(read('collection=pages')).toEqual({
      collection: 'pages',
      slug: 'home',
    })
  })

  it.each(['', 'collection=users&slug=a', 'collection=posts', 'slug=a'])(
    'rejects "%s"',
    (query) => {
      expect(read(query)).toBeNull()
    },
  )
})

describe('ogImageUrl', () => {
  it('links a document with its version', () => {
    expect(
      ogImageUrl(
        {
          collection: 'posts',
          slug: 'my post',
        },
        '2026-10-09T15:24:30.500Z',
      ),
    ).toBe('/api/og-image?collection=posts&slug=my+post&v=1791559470500')
  })

  it('links the blog listing by path and skips a missing version', () => {
    expect(
      ogImageUrl({
        listing: 'blog',
      }),
    ).toBe('/api/og-image?path=%2Fblog')
  })

  it('round-trips through the query parser', () => {
    const url = new URL(
      ogImageUrl({
        collection: 'resume-documents',
        slug: 'latest',
      }),
      'https://daniel.heene.io',
    )

    expect(ogTargetFromSearchParams(url.searchParams)).toEqual({
      collection: 'resume-documents',
      slug: 'latest',
    })
  })
})
