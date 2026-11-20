import { describe, expect, it } from 'vitest'

import { classifyLinkClick } from './events'

const ORIGIN = 'https://site.test'

describe('classifyLinkClick', () => {
  it('reports the contact channel without the address', () => {
    expect(classifyLinkClick('mailto:me@site.test', ORIGIN)).toEqual({
      name: 'contact-link',
      data: { channel: 'email' },
    })
    expect(classifyLinkClick('tel:+491234', ORIGIN)?.data).toEqual({ channel: 'phone' })
  })

  it('reports outbound links by host and path, without the query', () => {
    expect(classifyLinkClick('https://github.com/me/repo?tab=1', ORIGIN)).toEqual({
      name: 'outbound-link',
      data: { host: 'github.com', url: 'https://github.com/me/repo' },
    })
  })

  it('reports the feed and file downloads', () => {
    expect(classifyLinkClick('/blog/feed.xml', ORIGIN)?.name).toBe('feed-link')
    expect(classifyLinkClick('/api/files/file/My%20CV.pdf', ORIGIN)).toEqual({
      name: 'file-download',
      data: { file: 'My CV.pdf' },
    })
  })

  it('ignores page links and other schemes', () => {
    expect(classifyLinkClick('/blog/post/hello', ORIGIN)).toBeNull()
    expect(classifyLinkClick('#top', ORIGIN)).toBeNull()
    expect(classifyLinkClick('javascript:void(0)', ORIGIN)).toBeNull()
  })
})
