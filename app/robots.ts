import type { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/',
        ],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'YandexBot',
          'DuckDuckBot',
          'Applebot',
        ],
        allow: [
          '/',
        ],
        disallow: [
          '/admin',
          '/api',
          '/_next',
          '/static',
          '/.well-known',
        ],
      },
    ],
    host: process.env.SERVER_URL,
    sitemap: `${process.env.SERVER_URL}/sitemap.xml`,
  }
}
