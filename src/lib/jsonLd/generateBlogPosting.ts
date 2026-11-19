import type { BlogPostingLeaf, ImageObjectLeaf } from 'schema-dts'

import { jsonLdIds } from './ids'

export interface BlogPostingData {
  siteUrl: string
  url: string
  headline: string
  description?: string | null
  datePublished: string
  dateModified?: string | null
  /** Hero images first, then the Open Graph card. */
  images?: ImageObjectLeaf[]
  /** Topic titles; the first is the primary one. */
  topics?: string[]
  wordCount?: number | null
  /** Minutes. */
  readingTime?: number | null
}

/** A post by the site owner, in the site's blog. */
export function generateBlogPosting(data: BlogPostingData): BlogPostingLeaf {
  const ids = jsonLdIds(data.siteUrl)

  const posting: BlogPostingLeaf = {
    '@type': 'BlogPosting',
    '@id': `${data.url}#article`,
    url: data.url,
    headline: data.headline,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    inLanguage: 'en',
    mainEntityOfPage: {
      '@id': `${data.url}#webpage`,
    },
    author: {
      '@id': ids.person,
    },
    publisher: {
      '@id': ids.person,
    },
    isPartOf: {
      '@id': ids.blog,
    },
  }

  const description = data.description?.trim()

  if (description) posting.description = description

  if (data.images && data.images.length > 0) posting.image = data.images

  if (data.topics && data.topics.length > 0) {
    posting.articleSection = data.topics[0]
    posting.keywords = data.topics.join(', ')
  }

  if (data.wordCount) posting.wordCount = data.wordCount

  if (data.readingTime) posting.timeRequired = `PT${Math.max(1, Math.round(data.readingTime))}M`

  return posting
}
