/**
 *    RSS 2.0 serialisation
 *
 *    Pure string building with no Payload or Next imports, so the feed's
 *    escaping and structure are unit-testable on their own. The route handler
 *    at app/(frontend)/blog/feed.xml gathers the data and hands it in here.
 *
 *    Namespaces used beyond the RSS 2.0 core:
 *      - atom    → `atom:link rel="self"`, which feed validators expect
 *      - content → `content:encoded`, the full post HTML
 *      - dc      → `dc:creator`, since RSS's own `<author>` must be an email
 */

export interface RssChannel {
  title: string
  /** The site page the feed represents (the blog index). */
  link: string
  description: string
  /** Absolute URL the feed itself is served from. */
  selfUrl: string
  language?: string
  lastBuildDate?: Date | string
  /** Minutes an aggregator may cache the feed for before refetching. */
  ttl?: number
}

export interface RssItem {
  title: string
  link: string
  /** Defaults to `link`, marked as a permalink. */
  guid?: string
  pubDate: Date | string
  description?: string
  /** Full HTML body, emitted as `content:encoded`. */
  contentHtml?: string
  categories?: string[]
  creator?: string
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/**
 * Characters XML 1.0 does not allow at all, even escaped. Pasted content can
 * carry them (vertical tabs, stray control codes) and a single one makes the
 * whole feed unparseable.
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: matching control characters is the point
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g

const stripInvalid = (value: string): string => value.replace(INVALID_XML_CHARS, '')

export const escapeXml = (value: string): string =>
  stripInvalid(value).replace(/[&<>"']/g, (char) => XML_ESCAPES[char])

/**
 * Wraps a value in CDATA. A literal `]]>` would end the section early, so it is
 * split across two sections.
 */
export const cdata = (value: string): string =>
  `<![CDATA[${stripInvalid(value).replaceAll(']]>', ']]]]><![CDATA[>')}]]>`

/** RFC 822 date, as RSS 2.0 requires (e.g. `Sat, 26 Sep 2026 10:00:00 GMT`). */
export const toRfc822 = (date: Date | string): string => new Date(date).toUTCString()

const element = (name: string, value: string | undefined, attributes = ''): string =>
  value ? `<${name}${attributes}>${escapeXml(value)}</${name}>` : ''

const renderItem = (item: RssItem): string => {
  const guid = item.guid ?? item.link
  const isPermaLink = guid === item.link

  return [
    '<item>',
    element('title', item.title),
    element('link', item.link),
    element('guid', guid, ` isPermaLink="${isPermaLink}"`),
    element('pubDate', toRfc822(item.pubDate)),
    element('dc:creator', item.creator),
    ...(item.categories ?? []).map((category) => element('category', category)),
    item.description ? `<description>${cdata(item.description)}</description>` : '',
    item.contentHtml ? `<content:encoded>${cdata(item.contentHtml)}</content:encoded>` : '',
    '</item>',
  ]
    .filter(Boolean)
    .join('')
}

export const buildRssFeed = (channel: RssChannel, items: RssItem[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '<channel>',
    element('title', channel.title),
    element('link', channel.link),
    element('description', channel.description),
    `<atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml"/>`,
    element('language', channel.language),
    channel.lastBuildDate ? element('lastBuildDate', toRfc822(channel.lastBuildDate)) : '',
    element('docs', 'https://www.rssboard.org/rss-specification'),
    channel.ttl ? element('ttl', String(channel.ttl)) : '',
    ...items.map(renderItem),
    '</channel>',
    '</rss>',
  ]
    .filter(Boolean)
    .join('\n')
