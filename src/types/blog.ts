/**
 * Path segments under /blog that belong to routes rather than topics:
 * /blog/post/<slug> for articles, and /blog/page/<n>, the legacy pagination
 * URLs the proxy still redirects to `?page=<n>`.
 *
 * A topic using one of these slugs would be permanently unreachable, so
 * BlogTopics rejects them at validation time.
 */
export const RESERVED_TOPIC_SLUGS = ['page', 'post']
