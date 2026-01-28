import type { BlogPosting, Person, WithContext } from 'schema-dts'

export interface BlogPostingData {
  headline: string
  description?: string
  url: string
  datePublished: string
  dateModified?: string
  image?: {
    url: string
    width?: number
    height?: number
    alt?: string
  }
  author?: {
    name: string
    url?: string
  }
  keywords?: string[]
  articleBody?: string
}

export function generateBlogPosting(data: BlogPostingData): WithContext<BlogPosting> {
  const author: Person | undefined = data.author
    ? {
        '@type': 'Person',
        name: data.author.name,
        ...(data.author.url && { url: data.author.url }),
      }
    : undefined

  const blogPosting: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.headline,
    url: data.url,
    datePublished: data.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
  }

  if (data.description) blogPosting.description = data.description
  if (data.dateModified) blogPosting.dateModified = data.dateModified
  if (author) blogPosting.author = author
  if (data.keywords && data.keywords.length > 0) blogPosting.keywords = data.keywords.join(', ')
  if (data.articleBody) blogPosting.articleBody = data.articleBody

  if (data.image) {
    blogPosting.image = {
      '@type': 'ImageObject',
      url: data.image.url,
      ...(data.image.width && { width: `${data.image.width}px` }),
      ...(data.image.height && { height: `${data.image.height}px` }),
      ...(data.image.alt && { caption: data.image.alt }),
    }
  }

  return blogPosting
}
