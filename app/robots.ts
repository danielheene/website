import type { MetadataRoute } from 'next'

// Search engines index the site. Link-preview bots only fetch a shared URL to
// render its card, so they get the same access. Everyone else, AI training
// crawlers included, is limited to /llms.txt.
const SEARCH_ENGINES = [
  'Googlebot',
  'Bingbot',
  'YandexBot',
  'DuckDuckBot',
  'Applebot',
]

const LINK_PREVIEW_BOTS = [
  'Twitterbot',
  'facebookexternalhit',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'TelegramBot',
  'WhatsApp',
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/llms.txt',
        ],
        disallow: [
          '/',
        ],
      },
      {
        userAgent: [
          ...SEARCH_ENGINES,
          ...LINK_PREVIEW_BOTS,
        ],
        // /_next stays crawlable: rendering needs its JS, CSS and /_next/image.
        // Uploads are served from /api/<collection>/file/, which must stay
        // reachable even though the rest of /api is not.
        allow: [
          '/',
          '/api/*/file/',
        ],
        disallow: [
          '/admin',
          '/api',
        ],
      },
    ],
    sitemap: `${process.env.SERVER_URL}/sitemap.xml`,
  }
}
