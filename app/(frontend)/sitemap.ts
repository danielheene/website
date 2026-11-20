import type { MetadataRoute } from 'next'
import { connection } from 'next/server'

import { generateContentURL } from '@/lib/generateContentURL'
import { getRouteIndex } from '@/lib/routeIndex/routeIndexStore'

/**
 *    Sitemap
 *
 *    The indexable entries of the route index (`src/lib/routeIndex/`), which
 *    the proxy also checks every request against, so the sitemap lists
 *    exactly the URLs that answer 200:
 *
 *      /                    home (the Pages doc with slug `home`)
 *      /<slug>              published Pages
 *      /blog                the post listing
 *      /blog/<topic>        topics that have at least one published post
 *      /blog/post/<slug>    published posts
 *      /resume/<slug>       résumé documents, plus /resume/latest
 *      /resume/validate
 *
 *    Left out on purpose: `?page=` / `?sort=` listing variants (same content
 *    as the canonical listing, and discovered through its links), the RSS
 *    feed, and empty topics.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // read from Redis on each request, never frozen into the build
  await connection()

  const index = await getRouteIndex()

  return (
    Object.entries(index)
      .filter(([, { indexable }]) => indexable)
      // home first, then by path
      .sort(([a], [b]) => Number(b === '/') - Number(a === '/') || a.localeCompare(b))
      .map(([path, { lastModified }]) => ({
        url: generateContentURL({
          path,
        }),
        lastModified,
      }))
  )
}
