/**
 * Path segments under /blog that belong to routes rather than topics:
 * /blog/post/<slug> for articles.
 *
 * A topic using this slug would be permanently unreachable, so BlogTopics
 * rejects it at validation time.
 */
export const RESERVED_TOPIC_SLUGS = ['post']
