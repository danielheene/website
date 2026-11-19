import type { ImageObjectLeaf, WebPageLeaf } from 'schema-dts'

import { breadcrumbId, jsonLdIds, webPageId } from './ids'

export interface WebPageData {
  /** `ProfilePage` for pages about the site owner, `CollectionPage` for listings. */
  type?: 'WebPage' | 'ProfilePage' | 'CollectionPage'
  url: string
  name: string
  description?: string | null
  siteUrl: string
  /** `@id` of the node the page is about, e.g. the person or a blog post. */
  mainEntity?: string
  /** Set when the page's graph includes its breadcrumb trail. */
  hasBreadcrumb?: boolean
  image?: ImageObjectLeaf
  datePublished?: string | null
  dateModified?: string | null
}

/** The page itself, part of the site and linking the entity it presents. */
export function generateWebPage(data: WebPageData) {
  const ids = jsonLdIds(data.siteUrl)

  // SAFETY: the three page types share WebPage's properties; only `@type` differs.
  const page = {
    '@type': data.type ?? 'WebPage',
    '@id': webPageId(data.url),
    url: data.url,
    name: data.name,
    inLanguage: 'en',
    isPartOf: {
      '@id': ids.website,
    },
  } as WebPageLeaf

  const description = data.description?.trim()

  if (description) page.description = description

  if (data.mainEntity) {
    page.mainEntity = {
      '@id': data.mainEntity,
    }
  }

  if (data.hasBreadcrumb) {
    page.breadcrumb = {
      '@id': breadcrumbId(data.url),
    }
  }

  if (data.image) page.primaryImageOfPage = data.image

  if (data.datePublished) page.datePublished = data.datePublished

  if (data.dateModified) page.dateModified = data.dateModified

  return page
}
