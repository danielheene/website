import type { MetadataRoute } from 'next'

// Same signal as the draft watermark in src/pdf/index.tsx. NODE_ENV cannot
// tell the environments apart: every deployed image runs in production mode.
const PRODUCTION_HOST = 'daniel.heene.io'

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (process.env.SERVER_HOST !== PRODUCTION_HOST) {
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
