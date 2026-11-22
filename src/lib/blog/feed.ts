/** Where the blog's RSS feed is served (app/(frontend)/blog/feed.xml/route.ts). */
export const BLOG_FEED_PATH = '/blog/feed.xml'

/**
 * Feed autodiscovery (`<link rel="alternate" type="application/rss+xml">`), as Next's
 * `alternates.types`. Next replaces `alternates` as a whole, so a page that sets its own canonical
 * repeats this to keep the link.
 */
export const BLOG_FEED_ALTERNATES = {
  'application/rss+xml': [
    {
      url: BLOG_FEED_PATH,
      title: 'Blog',
    },
  ],
}

/** Number of most recent posts the feed carries. */
export const BLOG_FEED_SIZE = 20
