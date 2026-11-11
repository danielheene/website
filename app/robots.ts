import type { MetadataRoute } from 'next'

import { isProductionHost } from '@/lib/isProductionHost'

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!isProductionHost()) {
    return {
      rules: [
        {
          userAgent: ['*'],
          disallow: ['/'],
        },
      ],
    }
  }

  return {
    rules: [
      {
        userAgent: ['*'],
        // /_next stays crawlable: rendering needs its JS, CSS and /_next/image.
        // Uploads are served from /api/<collection>/file/, which must stay
        // reachable even though the rest of /api is not.
        allow: ['/', '/api/*/file/'],
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `${process.env.SERVER_URL}/sitemap.xml`,
  }
}
