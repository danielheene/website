import type { WebSiteLeaf } from 'schema-dts'

import { toSlideItems } from '@/components/HeroMedia/toSlideItems'
import { GlobalData, GlobalSlug } from '@/types/globals'

import { absoluteUrl, jsonLdIds } from './ids'

/** The site as a `WebSite`, published by the site owner. */
export function generateWebSiteSchema(
  { general }: GlobalData<GlobalSlug['SiteSettings']>,
  siteUrl: string,
): WebSiteLeaf {
  const ids = jsonLdIds(siteUrl)

  const webSite: WebSiteLeaf = {
    '@type': 'WebSite',
    '@id': ids.website,
    name: general?.siteName,
    url: general?.siteURL || siteUrl,
    inLanguage: 'en',
    publisher: {
      '@id': ids.person,
    },
  }

  const description = general?.description?.replaceAll(/\s+/g, ' ').trim()

  if (description) webSite.description = description

  const image = toSlideItems(general?.defaultOpengraphImage, '').find(
    (slide) => slide.kind === 'image',
  )

  if (image?.kind === 'image') {
    webSite.image = {
      '@type': 'ImageObject',
      url: absoluteUrl(image.url, siteUrl),
    }
  }

  return webSite
}
