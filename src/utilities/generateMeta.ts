import type { BlogCategory, BlogPost, BlogTag, Page } from '@payload-types'
import { template } from 'lodash-es'
import type { Metadata } from 'next'

import { getCachedSiteMetaData } from '@/lib/getSiteMetaData'
import { getCachedUserMetaData } from '@/lib/getUserMetaData'

interface GenerateMetaArgs {
  doc: Partial<Page> | Partial<BlogPost> | Partial<BlogCategory> | Partial<BlogTag> | null
}

export const generateMeta = async ({ doc }: GenerateMetaArgs): Promise<Metadata> => {
  const { siteName, titleTemplate, description, keywords, category } = await getCachedSiteMetaData()
  const { name, url } = await getCachedUserMetaData()

  const titleGenerator = template(titleTemplate, { interpolate: /{{([\s\S]+?)}}/g })
  // const ogImage = getImageURL(doc?.meta?.image)

  return {
    title: titleGenerator({ title: doc.title || '', siteName }),
    description,
    keywords: keywords.map(({ label }) => label).join(','),
    category,
    creator: name,
    authors: [{ name, url }],
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
