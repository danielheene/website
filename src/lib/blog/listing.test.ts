import { describe, expect, it } from 'vitest'

import {
  buildBlogListingHref,
  DEFAULT_BLOG_SORT,
  parseBlogListingParams,
  parsePageParam,
  resolveBlogListingUrl,
} from './listing'

describe('parsePageParam', () => {
  it('accepts positive integers', () => {
    expect(parsePageParam('1')).toBe(1)
    expect(parsePageParam('12')).toBe(12)
    expect(parsePageParam('007')).toBe(7)
  })

  it('takes the first value of a repeated param', () => {
    expect(parsePageParam(['3', '4'])).toBe(3)
  })

  it('rejects anything that is not a positive integer', () => {
    for (const raw of [
      undefined,
      '',
      '0',
      '-1',
      '1.5',
      'abc',
      '2abc',
      ' 2',
      '99999999999999999999',
    ]) {
      expect(parsePageParam(raw)).toBeNull()
    }
  })
})

describe('parseBlogListingParams', () => {
  it('defaults to page 1 in the default order', () => {
    expect(parseBlogListingParams({})).toEqual({
      page: 1,
      sort: DEFAULT_BLOG_SORT,
    })
    expect(parseBlogListingParams(undefined)).toEqual({
      page: 1,
      sort: DEFAULT_BLOG_SORT,
    })
  })

  it('reads valid page and sort values', () => {
    expect(
      parseBlogListingParams({
        page: '3',
        sort: 'oldest',
      }),
    ).toEqual({
      page: 3,
      sort: 'oldest',
    })
  })

  it('falls back to defaults for invalid values', () => {
    expect(
      parseBlogListingParams({
        page: 'nope',
        sort: 'popular',
      }),
    ).toEqual({
      page: 1,
      sort: DEFAULT_BLOG_SORT,
    })
  })

  it('ignores inherited object keys as sort values', () => {
    expect(
      parseBlogListingParams({
        sort: 'toString',
      }).sort,
    ).toBe(DEFAULT_BLOG_SORT)
  })
})

describe('buildBlogListingHref', () => {
  it('omits default values', () => {
    expect(buildBlogListingHref('/blog')).toBe('/blog')
    expect(
      buildBlogListingHref('/blog', {
        page: 1,
        sort: DEFAULT_BLOG_SORT,
      }),
    ).toBe('/blog')
  })

  it('adds non-default values in canonical order', () => {
    expect(
      buildBlogListingHref('/blog/react', {
        page: 2,
      }),
    ).toBe('/blog/react?page=2')
    expect(
      buildBlogListingHref('/blog', {
        page: 3,
        sort: 'title',
      }),
    ).toBe('/blog?sort=title&page=3')
  })
})

describe('resolveBlogListingUrl', () => {
  it('ignores paths that are not listings', () => {
    expect(resolveBlogListingUrl('/', '')).toBeNull()
    expect(resolveBlogListingUrl('/blogroll', '')).toBeNull()
    expect(resolveBlogListingUrl('/blog/post/hello-world', '')).toBeNull()
    expect(resolveBlogListingUrl('/blog/post', '')).toBeNull()
    expect(resolveBlogListingUrl('/blog/page', '')).toBeNull()
    expect(resolveBlogListingUrl('/blog/feed.xml', '')).toBeNull()
  })

  it('leaves canonical URLs alone', () => {
    expect(resolveBlogListingUrl('/blog', '')).toEqual({
      redirect: null,
      indexable: true,
    })
    expect(resolveBlogListingUrl('/blog/react', '?page=2')).toEqual({
      redirect: null,
      indexable: true,
    })
    expect(resolveBlogListingUrl('/blog', '?sort=oldest&page=2')).toEqual({
      redirect: null,
      indexable: false,
    })
  })

  it('moves legacy /page/<n> segments into the query', () => {
    expect(resolveBlogListingUrl('/blog/page/2', '')?.redirect).toBe('/blog?page=2')
    expect(resolveBlogListingUrl('/blog/react/page/3', '')?.redirect).toBe('/blog/react?page=3')
    expect(resolveBlogListingUrl('/blog/page/1', '')?.redirect).toBe('/blog')
    expect(resolveBlogListingUrl('/blog/page/2', '?utm_source=x')?.redirect).toBe(
      '/blog?utm_source=x&page=2',
    )
  })

  it('lets invalid legacy page segments fall through to a 404', () => {
    expect(resolveBlogListingUrl('/blog/page/abc', '')).toBeNull()
    expect(resolveBlogListingUrl('/blog/react/page/0', '')).toBeNull()
  })

  it('drops invalid and default param values', () => {
    expect(resolveBlogListingUrl('/blog', '?page=1')?.redirect).toBe('/blog')
    expect(resolveBlogListingUrl('/blog', '?page=abc')?.redirect).toBe('/blog')
    expect(resolveBlogListingUrl('/blog', '?page=02')?.redirect).toBe('/blog?page=2')
    expect(resolveBlogListingUrl('/blog', '?sort=newest')?.redirect).toBe('/blog')
    expect(resolveBlogListingUrl('/blog', '?sort=popular&page=2')?.redirect).toBe('/blog?page=2')
  })

  it('collapses repeated params to the first value', () => {
    expect(resolveBlogListingUrl('/blog', '?page=2&page=3')?.redirect).toBe('/blog?page=2')
  })

  it('does not redirect just to re-encode unrelated params', () => {
    expect(
      resolveBlogListingUrl('/blog', '?utm_campaign=my%20campaign&page=2')?.redirect,
    ).toBeNull()
    expect(resolveBlogListingUrl('/blog', "?q=(a)!'~")?.redirect).toBeNull()
  })

  it('keeps unrelated params in place', () => {
    expect(resolveBlogListingUrl('/blog', '?utm_source=rss&page=2')).toEqual({
      redirect: null,
      indexable: true,
    })
  })

  it('strips a trailing slash', () => {
    expect(resolveBlogListingUrl('/blog/', '')?.redirect).toBe('/blog')
  })

  it('marks alternative sort orders as not indexable', () => {
    expect(resolveBlogListingUrl('/blog/react', '?sort=title')?.indexable).toBe(false)
    expect(resolveBlogListingUrl('/blog/react', '?sort=newest')?.indexable).toBe(true)
  })

  it('is idempotent', () => {
    for (const [pathname, search] of [
      ['/blog/page/4', '?sort=oldest&x=a b'],
      ['/blog/react', '?page=0&sort=title&page=9'],
    ]) {
      const target = resolveBlogListingUrl(pathname, search)?.redirect
      expect(target).toBeTruthy()

      const url = new URL(target, 'http://localhost')
      expect(resolveBlogListingUrl(url.pathname, url.search)?.redirect).toBeNull()
    }
  })
})
