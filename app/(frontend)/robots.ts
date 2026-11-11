import type { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
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
