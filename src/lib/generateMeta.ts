import type { Metadata } from 'next'

import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import type { ReducedToBilingualLanguage } from '@/lib/i18n'
import { ogImageMetadata } from '@/lib/og/ogImageMetadata'
import type { OgCollection } from '@/lib/og/ogTarget'
import type { BlogPostData, Page, Topic } from '@/types/payload'

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

  return {
    title,
    description: metaDescription,
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
      title,
      description: metaDescription,
      siteName: siteName ?? undefined,
      images: doc?.slug
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
        : undefined,
    },
  }
}
