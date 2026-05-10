import type { Metadata } from 'next'

import { getCachedSiteConfigurationData } from '@/lib/getSiteConfigurationData'
import { getCachedUserConfigurationData } from '@/lib/getUserConfigurationData'
import type { DeepReduced } from '@/lib/reduceDataToLocale'
import type { BlogPost, BlogTag, Page } from '@/types/payload'

interface GenerateMetaArgs {
  doc: DeepReduced<Page> | DeepReduced<BlogPost> | DeepReduced<BlogTag> | null
}

export const generateMeta = async ({
  doc,
}: GenerateMetaArgs): Promise<Metadata> => {
  const { description, category } = await getCachedSiteConfigurationData()
  const { name, url } = await getCachedUserConfigurationData()

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
    robots: {
      index: true,
      follow: true,
    },
    // openGraph: {
    //   type: 'website',
    //   title: titleGenerator({ title: doc.title || '', siteName }),
    //   description,
    // },
  }
}
