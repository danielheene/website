import type { Metadata } from 'next'

import { getGlobalUserSettings } from '@/lib/getGlobalUserSettings'
import { getSiteSettings } from '@/lib/getSiteSettings'
import type { ReducedToLocale } from '@/lib/i18n'
import type { BlogPost, BlogTag, Page } from '@/types/payload'

interface GenerateMetaArgs {
  doc: ReducedToLocale<Page> | ReducedToLocale<BlogPost> | ReducedToLocale<BlogTag> | null
}

export const generateMeta = async ({ doc }: GenerateMetaArgs): Promise<Metadata> => {
  const {
    general: { description, category },
  } = await getSiteSettings()
  const { name, url } = await getGlobalUserSettings()

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
