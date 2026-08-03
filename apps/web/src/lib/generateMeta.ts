import type { Metadata } from 'next'

import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import type { ReducedToLocale } from '@/lib/i18n'
import type { BlogPostData, Page, Topic } from '@/types/payload'

interface GenerateMetaArgs {
  doc: ReducedToLocale<Page> | ReducedToLocale<BlogPostData> | ReducedToLocale<Topic> | null
}

export const generateMeta = async ({ doc }: GenerateMetaArgs): Promise<Metadata> => {
  const {
    general: { description, category },
  } = await fetchSiteSettingsCached()
  const { name, url } = await fetchGlobalUserSettingsCached()

  // const ogImage = getImageURL(doc?.meta?.image)

  return {
    title: doc?.meta?.title || doc?.title,
    description: doc?.meta?.description || description,
    category,
    creator: name,
    authors: [
      {
        name,
        url,
      },
    ],
    // openGraph: {
    //   type: 'website',
    //   title: titleGenerator({ title: doc.title || '', siteName }),
    //   description,
    // },
  }
}
