import { describe, expect, it } from 'vitest'

import { buildRssFeed, cdata, escapeXml, toRfc822 } from './rss'

const channel = {
  title: 'Site — Blog',
  link: 'https://example.com/blog',
  description: 'Posts & notes',
  selfUrl: 'https://example.com/blog/feed.xml',
}

describe('escapeXml', () => {
  it('escapes markup characters', () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;',
    )
  })

  it('strips characters XML does not allow', () => {
    expect(escapeXml('a\u0000b\u000Bc\td')).toBe('abc\td')
  })
})

describe('cdata', () => {
  it('splits a literal CDATA terminator', () => {
    expect(cdata('a]]>b')).toBe('<![CDATA[a]]]]><![CDATA[>b]]>')
  })
})

describe('toRfc822', () => {
  it('formats dates in GMT', () => {
    expect(toRfc822('2026-09-26T10:00:00.000Z')).toBe('Sat, 26 Sep 2026 10:00:00 GMT')
  })
})

describe('buildRssFeed', () => {
  it('renders the channel with a self link', () => {
    const xml = buildRssFeed(
      {
        ...channel,
        language: 'en',
        lastBuildDate: '2026-09-26T10:00:00.000Z',
        ttl: 60,
      },
      [],
    )

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<title>Site — Blog</title>')
    expect(xml).toContain('<description>Posts &amp; notes</description>')
    expect(xml).toContain(
      '<atom:link href="https://example.com/blog/feed.xml" rel="self" type="application/rss+xml"/>',
    )
    expect(xml).toContain('<language>en</language>')
    expect(xml).toContain('<lastBuildDate>Sat, 26 Sep 2026 10:00:00 GMT</lastBuildDate>')
    expect(xml).toContain('<ttl>60</ttl>')
    expect(xml).not.toContain('<item>')
  })

  it('renders items with content, categories and a permalink guid', () => {
    const xml = buildRssFeed(channel, [
      {
        title: 'Hello <World>',
        link: 'https://example.com/blog/post/hello',
        pubDate: '2026-09-01T08:30:00.000Z',
        description: 'Intro',
        contentHtml: '<p>Body</p>',
        categories: [
          'React',
          'Next.js',
        ],
        creator: 'Jane Doe',
      },
    ])

    expect(xml).toContain('<title>Hello &lt;World&gt;</title>')
    expect(xml).toContain('<guid isPermaLink="true">https://example.com/blog/post/hello</guid>')
    expect(xml).toContain('<pubDate>Tue, 01 Sep 2026 08:30:00 GMT</pubDate>')
    expect(xml).toContain('<dc:creator>Jane Doe</dc:creator>')
    expect(xml).toContain('<category>React</category><category>Next.js</category>')
    expect(xml).toContain('<description><![CDATA[Intro]]></description>')
    expect(xml).toContain('<content:encoded><![CDATA[<p>Body</p>]]></content:encoded>')
  })

  it('omits optional item elements that are empty', () => {
    const xml = buildRssFeed(channel, [
      {
        title: 'Bare',
        link: 'https://example.com/blog/post/bare',
        guid: 'post-1',
        pubDate: '2026-09-01T00:00:00.000Z',
      },
    ])

    expect(xml).toContain('<guid isPermaLink="false">post-1</guid>')
    expect(xml).not.toContain('<description><![CDATA[')
    expect(xml).not.toContain('content:encoded>')
    expect(xml).not.toContain('<category>')
    expect(xml).not.toContain('<dc:creator>')
  })
})
