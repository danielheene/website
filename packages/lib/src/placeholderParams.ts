/**
 *    Placeholder static params
 *
 *    Cache Components requires `generateStaticParams` to return at least one
 *    param, otherwise the route cannot prerender a shell and the build fails on
 *    a blocking read. When a collection query comes back empty there is no real
 *    slug to seed with, so routes fall back to a synthetic one that resolves to
 *    notFound().
 *
 *    The failure mode this guards against: an empty or unreachable database
 *    makes every content route silently emit a single 404 shell, while the
 *    build still reports success and the route table still shows Partial
 *    Prerender. The only visible tell is a slug named '__placeholder__' buried
 *    in the output. This warns loudly so a content-less build cannot pass for a
 *    healthy one.
 */

export const PLACEHOLDER_SLUG = '__placeholder__'

/**
 * Warns that `route` found no documents, then returns the synthetic params that
 * keep the build alive. Pass the extra params a route needs beyond `slug` (for
 * example `{ page: '2' }` on paginated segments).
 */
export const placeholderParams = <T extends Record<string, string>>(
  route: string,
  extra?: T,
): Array<
  {
    slug: string
  } & T
> => {
  console.warn(
    `[generateStaticParams] ${route}: query returned no documents — prerendering ` +
      `'${PLACEHOLDER_SLUG}' only. This route will serve a 404 shell. Check that the ` +
      `build is pointed at a populated database and that access control permits ` +
      `unauthenticated reads (overrideAccess: false).`,
  )

  return [
    {
      slug: PLACEHOLDER_SLUG,
      ...(extra ?? ({} as T)),
    },
  ]
}
