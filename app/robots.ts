import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin', '/api', '/_next', '/static', '/.well-known'],
      },
    ],
    sitemap: process.env.NEXT_PUBLIC_SERVER_URL + '/sitemap.xml',
  }
}
