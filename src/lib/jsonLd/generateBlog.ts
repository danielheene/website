import type { BlogLeaf } from 'schema-dts'

import { jsonLdIds } from './ids'

export interface BlogData {
  siteUrl: string
  url: string
  name: string
  description?: string | null
  /** Topic titles. */
  keywords?: string[]
}

/** The site's blog, published by the site owner. */
export function generateBlog(data: BlogData): BlogLeaf {
  const ids = jsonLdIds(data.siteUrl)

  const blog: BlogLeaf = {
    '@type': 'Blog',
    '@id': ids.blog,
    url: data.url,
    name: data.name,
    inLanguage: 'en',
    isPartOf: {
      '@id': ids.website,
    },
    publisher: {
      '@id': ids.person,
    },
    author: {
      '@id': ids.person,
    },
  }

  const description = data.description?.trim()

  if (description) blog.description = description

  if (data.keywords && data.keywords.length > 0) blog.keywords = data.keywords.join(', ')

  return blog
}
