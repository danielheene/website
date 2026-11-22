import type { Metadata } from 'next'

import { BLOG_FEED_ALTERNATES } from '@/lib/blog/feed'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import { generateContentURL } from '@/lib/generateContentURL'
import type { ReducedToBilingualLanguage } from '@/lib/i18n'
import { ogImageMetadata } from '@/lib/og/ogImageMetadata'
import type { OgCollection } from '@/lib/og/ogTarget'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData, Page, Topic } from '@/types/payload'

// the site is written in English (`inLanguage: 'en'` in the structured data)
const OG_LOCALE = 'en_US'

interface GenerateMetaArgs {
  doc:
    | ReducedToBilingualLanguage<Page>
    | ReducedToBilingualLanguage<BlogPostData>
    | ReducedToBilingualLanguage<Topic>
    | null
  /** The collection `doc` belongs to, which picks its Open Graph image. */
  collection: Exclude<OgCollection, 'resume-documents'>
}

export const generateMeta = async ({ doc, collection }: GenerateMetaArgs): Promise<Metadata> => {
  const {
    general: { description, category, siteName },
  } = await fetchSiteSettingsCached()

  const { name, url } = await fetchGlobalUserSettingsCached()

  const title = doc?.meta?.title || doc?.title
  const metaDescription = doc?.meta?.description || description
  const pageUrl = doc?.slug ? generateContentURL({ collection, slug: doc.slug }) : undefined

  const images = doc?.slug
    ? [
        ogImageMetadata(
          {
            collection,
            slug: doc.slug,
          },
          title,
          doc.updatedAt,
        ),
      ]
    : undefined

  return {
    title,
    description: metaDescription,
    // topics paginate with `?page=`, which metadata can't read without giving up the prerendered
    // shell, so a topic page declares no canonical rather than pointing every page at the first
    alternates:
      pageUrl && collection !== CollectionSlug.BlogTopics
        ? {
            canonical: pageUrl,
            types: BLOG_FEED_ALTERNATES,
          }
        : undefined,
    category,
    creator: name,
    authors: [
      {
        name,
        url,
      },
    ],
    openGraph: {
      type: 'website',
      url: pageUrl,
      locale: OG_LOCALE,
      title,
      description: metaDescription,
      siteName: siteName ?? undefined,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images,
    },
  }
}
