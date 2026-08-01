/**
 * Path segments under /blog that belong to routes rather than topics:
 * /blog/page/<n> for pagination and /blog/post/<slug> for articles.
 *
 * A topic using one of these slugs would be permanently unreachable, so
 * BlogTopics rejects them at validation time.
 */
export const RESERVED_TOPIC_SLUGS = [
  'page',
  'post',
]
