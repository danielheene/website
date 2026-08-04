import type { BlogPosting, Person, WithContext } from 'schema-dts'

export interface BlogPostingData {
  headline: string
  alternativeHeadline?: string
  description?: string
  abstract?: string
  url: string
  datePublished: string
  dateModified?: string
  image?:
    | string
    | {
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
  articleSection?: string
  articleBody?: string
  timeRequired?: string
  audio?: {
    url: string
    name?: string
    description?: string
  }
}

/**
 * Generates BlogPosting JSON-LD
 *
 * @example
 * ```typescript
 * const blogPostingLd = generateBlogPosting({
 *   headline: 'My First Blog Post',
 *   alternativeHeadline: 'A subline for the post',
 *   description: 'This is the excerpt of my first blog post.',
 *   url: 'https://danielheene.io/blog/my-first-post',
 *   datePublished: '2024-01-01T12:00:00Z',
 *   author: {
 *     name: 'Daniel Heene',
 *     url: 'https://danielheene.io'
 *   },
 *   keywords: ['web development', 'typescript'],
 *   articleSection: 'Technology',
 *   timeRequired: 'PT5M', // 5 minutes reading time
 *   audio: {
 *     url: 'https://danielheene.io/blog/my-first-post/audio.mp3',
 *     name: 'Audio version of My First Blog Post'
 *   }
 * })
 * ```
 */
export function generateBlogPosting(data: BlogPostingData): WithContext<BlogPosting> {
  const author: Person | undefined = data.author
    ? {
        '@type': 'Person',
        name: data.author.name,
        ...(data.author.url && {
          url: data.author.url,
        }),
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

  if (data.alternativeHeadline) blogPosting.alternativeHeadline = data.alternativeHeadline
  if (data.description) blogPosting.description = data.description
  if (data.abstract) blogPosting.abstract = data.abstract
  if (data.dateModified) blogPosting.dateModified = data.dateModified
  if (author) blogPosting.author = author
  if (data.keywords && data.keywords.length > 0) blogPosting.keywords = data.keywords.join(', ')
  if (data.articleSection) blogPosting.articleSection = data.articleSection
  if (data.articleBody) blogPosting.articleBody = data.articleBody
  if (data.timeRequired) blogPosting.timeRequired = data.timeRequired

  if (data.audio) {
    blogPosting.audio = {
      '@type': 'AudioObject',
      contentUrl: data.audio.url,
      ...(data.audio.name && {
        name: data.audio.name,
      }),
      ...(data.audio.description && {
        description: data.audio.description,
      }),
    }
  }

  if (data.image) {
    if (typeof data.image === 'string') {
      blogPosting.image = {
        '@type': 'ImageObject',
        url: data.image,
      }
    } else {
      blogPosting.image = {
        '@type': 'ImageObject',
        url: data.image.url,
        ...(data.image.width && {
          width: `${data.image.width}px`,
        }),
        ...(data.image.height && {
          height: `${data.image.height}px`,
        }),
        ...(data.image.alt && {
          caption: data.image.alt,
        }),
      }
    }
  }

  return blogPosting
}
