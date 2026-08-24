import type { Metadata } from 'next'

import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import type { ReducedToBilingualLanguage } from '@/lib/i18n'
import type { BlogPostData, Page, Topic } from '@/types/payload'

interface GenerateMetaArgs {
  doc:
    | ReducedToBilingualLanguage<Page>
    | ReducedToBilingualLanguage<BlogPostData>
    | ReducedToBilingualLanguage<Topic>
    | null
}

export const generateMeta = async ({ doc }: GenerateMetaArgs): Promise<Metadata> => {
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
    // `images` is deliberately omitted: Next auto-discovers each route's
    // sibling opengraph-image.tsx and infers its URL, so hand-computed image
    // URLs here cannot drift out of sync with the generated images.
    openGraph: {
      type: 'website',
      title,
      description: metaDescription,
      siteName: siteName ?? undefined,
    },
  }
}
