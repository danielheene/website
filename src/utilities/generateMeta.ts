import type { Metadata, ResolvedMetadata } from 'next'

import type { BlogPost, Media, Page } from '@payload-types'
import { GlobalData } from '@custom-types'
import { template } from 'lodash-es'

export const generateMeta = async (args: {
  doc: Partial<Page | BlogPost>
  globalMeta: GlobalData<'settingsMeta'>
  parentMeta: ResolvedMetadata
}): Promise<Metadata> => {
  const { doc, globalMeta, parentMeta } = args || {}

  const image = (doc?.meta?.image || globalMeta?.fallbackImage) as Media
  const ogImage = image?.url || parentMeta.openGraph?.images

  const siteName = globalMeta?.siteName || process.env.NEXT_PUBLIC_SERVER_URL
  const titleTemplate = template(globalMeta?.titleTemplate || '{{title}} | {{siteName}}', {
    interpolate: /{{([\s\S]+?)}}/g,
  })
  const pageTitle = doc?.meta?.title || globalMeta?.fallbackTitle || parentMeta.title || ''

  const title = titleTemplate({ title: pageTitle, siteName })
  const description =
    doc?.meta?.description || globalMeta?.fallbackDescription || parentMeta.description || ''

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      siteName,
      description,
      images: ogImage,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    },
  }
}
